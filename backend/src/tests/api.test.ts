import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../app.js';
import { staticAnalysisService } from '../services/staticAnalysisService.js';

describe('CodeLens AI Backend API & Analysis Suite', () => {
  const app = createApp();

  describe('Static Analysis Service', () => {
    it('should detect eval() execution vulnerabilities', () => {
      const code = 'const input = "alert(1)"; eval(input);';
      const findings = staticAnalysisService.analyze(code, 'javascript');
      const evalFinding = findings.find(f => f.ruleId === 'security/no-eval');

      assert.ok(evalFinding, 'evalFinding should be found');
      assert.strictEqual(evalFinding?.severity, 'critical');
    });

    it('should detect hardcoded credentials and secrets', () => {
      const code = 'const apiKey = "AIzaSyD-sampleSecretKey12345678";';
      const findings = staticAnalysisService.analyze(code, 'typescript');
      const secretFinding = findings.find(f => f.ruleId === 'security/no-hardcoded-secrets');

      assert.ok(secretFinding, 'secretFinding should be found');
      assert.strictEqual(secretFinding?.severity, 'critical');
    });

    it('should detect loose equality operators', () => {
      const code = 'if (userId == 10) { doSomething(); }';
      const findings = staticAnalysisService.analyze(code, 'javascript');
      const equalityFinding = findings.find(f => f.ruleId === 'best-practice/no-loose-equality');

      assert.ok(equalityFinding, 'equalityFinding should be found');
      assert.strictEqual(equalityFinding?.severity, 'medium');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return healthy status code 200 with service metadata', async () => {
      const res = await request(app).get('/api/v1/health');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'healthy');
      assert.strictEqual(res.body.service, 'CodeLens AI Backend');
      assert.ok('database' in res.body);
      assert.ok('aiEngine' in res.body);
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should fail with 400 when code is empty', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({
          code: '',
          language: 'javascript'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Validation failed');
    });

    it('should successfully review source code and return structured metrics', async () => {
      const sampleCode = `
        function calculateTotal(items) {
          var total = 0;
          for (var i = 0; i < items.length; i++) {
            total = total + items[i].price;
          }
          return total;
        }
      `;

      const res = await request(app)
        .post('/api/v1/reviews')
        .send({
          code: sampleCode,
          language: 'javascript',
          focus: 'comprehensive',
          title: 'Cart Total Function'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.ok(res.body.data.result.summary);
      assert.ok(typeof res.body.data.result.qualityScore === 'number');
      assert.ok(res.body.data.result.rubric);
      assert.ok(Array.isArray(res.body.data.result.findings));
      assert.ok(res.body.data.result.suggestedFullCode);
      assert.ok(Array.isArray(res.body.data.result.suggestedTestCases));
    });
  });

  describe('Authentication & User Flow', () => {
    const testUser = {
      name: 'Alex Engineer',
      email: `alex_${Date.now()}@example.com`,
      password: 'SecurePassword123!'
    };

    let authToken = '';

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.email, testUser.email.toLowerCase());

      authToken = res.body.token;
    });

    it('should log in with registered credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'IncorrectPassword'
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('should access /api/v1/auth/me when authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.email, testUser.email.toLowerCase());
    });
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should retrieve aggregated dashboard metrics', async () => {
      const res = await request(app).get('/api/v1/dashboard/stats');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok('totalReviews' in res.body.data);
      assert.ok('averageQualityScore' in res.body.data);
      assert.ok('severityBreakdown' in res.body.data);
      assert.ok('languageBreakdown' in res.body.data);
    });
  });
});
