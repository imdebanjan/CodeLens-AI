import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { ReviewResult, ReviewFocus, StoredReview, UserProfile } from '../types/index.js';
import { UserModel } from './userModel.js';
import { ReviewModel } from './reviewModel.js';

let isMongoConnected = false;

// Resilient In-Memory Fallback Stores for offline/local development without local mongod
const inMemoryUsers: Map<string, {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'developer' | 'admin';
  storeFullCodePreference: boolean;
  createdAt: string;
}> = new Map();

const inMemoryReviews: Map<string, StoredReview> = new Map();

export async function connectDB(): Promise<boolean> {
  if (!config.mongodbUri) {
    console.log('[DB] No MONGODB_URI configured. Running in resilient in-memory development mode.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('[DB] Successfully connected to MongoDB Database.');
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    console.warn(`[DB] Notice: Could not connect to MongoDB (${err.message}). Defaulting to in-memory store for local testing.`);
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isMongoConnected;
}

// ----------------------------------------------------
// Unified Data Repository (Mongoose with Memory Fallback)
// ----------------------------------------------------

export const storage = {
  // --- USER OPERATIONS ---
  async findUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        storeFullCodePreference: user.storeFullCodePreference,
        createdAt: user.createdAt.toISOString()
      };
    }

    for (const u of inMemoryUsers.values()) {
      if (u.email === normalizedEmail) return u;
    }
    return null;
  },

  async findUserById(id: string) {
    if (isMongoConnected) {
      const user = await UserModel.findById(id);
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        storeFullCodePreference: user.storeFullCodePreference,
        createdAt: user.createdAt.toISOString()
      };
    }
    return inMemoryUsers.get(id) || null;
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role?: 'developer' | 'admin' }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (isMongoConnected) {
      const doc = await UserModel.create({
        name: data.name,
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        role: data.role || 'developer',
        storeFullCodePreference: false
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        storeFullCodePreference: doc.storeFullCodePreference,
        createdAt: doc.createdAt.toISOString()
      };
    }

    const id = 'usr_' + Math.random().toString(36).substring(2, 11);
    const userRecord = {
      id,
      name: data.name,
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'developer' as const,
      storeFullCodePreference: false,
      createdAt: new Date().toISOString()
    };
    inMemoryUsers.set(id, userRecord);
    return {
      id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      storeFullCodePreference: userRecord.storeFullCodePreference,
      createdAt: userRecord.createdAt
    };
  },

  async updateUserPreferences(id: string, storeFullCodePreference: boolean) {
    if (isMongoConnected) {
      const doc = await UserModel.findByIdAndUpdate(id, { storeFullCodePreference }, { new: true });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        storeFullCodePreference: doc.storeFullCodePreference,
        createdAt: doc.createdAt.toISOString()
      };
    }
    const user = inMemoryUsers.get(id);
    if (!user) return null;
    user.storeFullCodePreference = storeFullCodePreference;
    inMemoryUsers.set(id, user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeFullCodePreference: user.storeFullCodePreference,
      createdAt: user.createdAt
    };
  },

  // --- REVIEW OPERATIONS ---
  async saveReview(data: {
    userId?: string;
    title: string;
    language: string;
    focus: ReviewFocus;
    sourceCodeSnippet: string;
    hasFullCodeStored: boolean;
    result: ReviewResult;
  }): Promise<StoredReview> {
    if (isMongoConnected) {
      const doc = await ReviewModel.create({
        userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
        title: data.title,
        language: data.language,
        focus: data.focus,
        sourceCodeSnippet: data.sourceCodeSnippet,
        hasFullCodeStored: data.hasFullCodeStored,
        result: data.result
      });
      return {
        id: doc._id.toString(),
        userId: data.userId,
        title: doc.title,
        language: doc.language,
        focus: doc.focus,
        sourceCodeSnippet: doc.sourceCodeSnippet,
        hasFullCodeStored: doc.hasFullCodeStored,
        result: doc.result,
        createdAt: doc.createdAt.toISOString()
      };
    }

    const id = 'rev_' + Math.random().toString(36).substring(2, 11);
    const stored: StoredReview = {
      id,
      userId: data.userId,
      title: data.title,
      language: data.language,
      focus: data.focus,
      sourceCodeSnippet: data.sourceCodeSnippet,
      hasFullCodeStored: data.hasFullCodeStored,
      result: data.result,
      createdAt: new Date().toISOString()
    };
    inMemoryReviews.set(id, stored);
    return stored;
  },

  async getReviews(userId?: string, limit: number = 20, page: number = 1): Promise<{ reviews: StoredReview[]; total: number }> {
    const skip = (page - 1) * limit;

    if (isMongoConnected) {
      const query = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
      const [docs, total] = await Promise.all([
        ReviewModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ReviewModel.countDocuments(query)
      ]);
      const reviews = docs.map(doc => ({
        id: doc._id.toString(),
        userId: doc.userId ? doc.userId.toString() : undefined,
        title: doc.title,
        language: doc.language,
        focus: doc.focus,
        sourceCodeSnippet: doc.sourceCodeSnippet,
        hasFullCodeStored: doc.hasFullCodeStored,
        result: doc.result,
        createdAt: doc.createdAt.toISOString()
      }));
      return { reviews, total };
    }

    const all = Array.from(inMemoryReviews.values())
      .filter(r => (!userId || r.userId === userId || !r.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = all.length;
    const reviews = all.slice(skip, skip + limit);
    return { reviews, total };
  },

  async getReviewById(id: string): Promise<StoredReview | null> {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await ReviewModel.findById(id);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId ? doc.userId.toString() : undefined,
        title: doc.title,
        language: doc.language,
        focus: doc.focus,
        sourceCodeSnippet: doc.sourceCodeSnippet,
        hasFullCodeStored: doc.hasFullCodeStored,
        result: doc.result,
        createdAt: doc.createdAt.toISOString()
      };
    }
    return inMemoryReviews.get(id) || null;
  },

  async deleteReview(id: string, userId?: string): Promise<boolean> {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const query: any = { _id: id };
      if (userId) query.userId = new mongoose.Types.ObjectId(userId);
      const res = await ReviewModel.deleteOne(query);
      return res.deletedCount > 0;
    }

    const review = inMemoryReviews.get(id);
    if (!review) return false;
    if (userId && review.userId && review.userId !== userId) return false;
    return inMemoryReviews.delete(id);
  },

  async getStats(userId?: string) {
    const { reviews } = await this.getReviews(userId, 100, 1);
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageQualityScore: 0,
        severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        languageBreakdown: {},
        recentScoreTrend: []
      };
    }

    let totalScore = 0;
    const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    const languageBreakdown: Record<string, number> = {};

    reviews.forEach(r => {
      totalScore += r.result.qualityScore || 0;
      languageBreakdown[r.language] = (languageBreakdown[r.language] || 0) + 1;

      r.result.findings?.forEach(f => {
        if (f.severity in severityBreakdown) {
          severityBreakdown[f.severity]++;
        }
      });
      r.result.staticFindings?.forEach(sf => {
        if (sf.severity in severityBreakdown) {
          severityBreakdown[sf.severity]++;
        }
      });
    });

    const averageQualityScore = Math.round(totalScore / totalReviews);
    const recentScoreTrend = reviews.slice(0, 7).reverse().map(r => ({
      date: r.createdAt.substring(0, 10),
      score: r.result.qualityScore,
      title: r.title
    }));

    return {
      totalReviews,
      averageQualityScore,
      severityBreakdown,
      languageBreakdown,
      recentScoreTrend
    };
  }
};
