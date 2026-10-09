import mongoose, { Schema, Document } from 'mongoose';
import { ReviewResult, ReviewFocus } from '../types/index.js';

export interface IReview extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  language: string;
  focus: ReviewFocus;
  sourceCodeSnippet: string;
  hasFullCodeStored: boolean;
  result: ReviewResult;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: false },
    title: { type: String, required: true, trim: true },
    language: { type: String, required: true, lowercase: true, index: true },
    focus: { 
      type: String, 
      enum: ['comprehensive', 'bugs', 'security', 'performance', 'readability'], 
      default: 'comprehensive' 
    },
    sourceCodeSnippet: { type: String, required: true },
    hasFullCodeStored: { type: Boolean, default: false },
    result: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

// Indexes for fast dashboard query aggregation and user history
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ 'result.qualityScore': 1 });

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
