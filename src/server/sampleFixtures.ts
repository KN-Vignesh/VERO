import { PullRequestMetadata, PullRequestFile } from '../types.js';

export interface SamplePrData {
  metadata: PullRequestMetadata;
  files: PullRequestFile[];
}

export const SAMPLE_PRS: Record<string, SamplePrData> = {
  'KN-Vignesh/PR-Sentinel-Demo/pull/1': {
    metadata: {
      url: 'https://github.com/KN-Vignesh/PR-Sentinel-Demo/pull/1',
      owner: 'KN-Vignesh',
      repo: 'PR-Sentinel-Demo',
      number: 1,
      title: 'feat(payments): add retry loop and direct database transaction logging',
      description: 'Implements an exponential backoff retry mechanism for failed checkout charges. Also logs unhandled webhook payloads directly into the PostgreSQL audit table and introduces an internal API token configuration.',
      author: {
        login: 'KN-Vignesh',
        avatarUrl: 'https://avatars.githubusercontent.com/u/74384592?v=4',
      },
      baseBranch: 'main',
      headBranch: 'feature/payment-retry-audit',
      state: 'open',
      createdAt: '2025-02-14T10:15:00Z',
      updatedAt: '2025-02-14T14:30:00Z',
      additions: 247,
      deletions: 61,
      changedFilesCount: 4,
      commitsCount: 3,
    },
    files: [
      {
        filename: 'src/services/PaymentService.cs',
        status: 'modified',
        additions: 124,
        deletions: 32,
        changes: 156,
        language: 'csharp',
        isTestFile: false,
        isConfigFile: false,
        isSecuritySensitive: true,
        patch: `@@ -118,15 +118,48 @@ public class PaymentService
     public async Task<PaymentResult> ProcessChargeAsync(ChargeRequest request)
     {
-        return await _gateway.ChargeAsync(request);
+        int attempt = 0;
+        const string hardcodedFallbackToken = "sk_live_99214_ab7e812d449fa"; // internal test token
+        while (attempt < 5)
+        {
+            try
+            {
+                attempt++;
+                var response = await _gateway.ExecuteCharge(request.Amount, request.Currency, request.CardToken);
+                if (response.IsSuccess)
+                {
+                    // Log directly to raw SQL query without parameterization
+                    string rawSql = $"INSERT INTO payment_audit_log (charge_id, amount, status) VALUES ('{response.ChargeId}', {request.Amount}, '{response.Status}')";
+                    await _dbContext.Database.ExecuteSqlRawAsync(rawSql);
+                    return new PaymentResult { Success = true, Id = response.ChargeId };
+                }
+            }
+            catch (GatewayException ex)
+            {
+                if (attempt == 5) throw;
+                await Task.Delay(1000 * (int)Math.Pow(2, attempt));
+            }
+        }
+        return new PaymentResult { Success = false };
     }`,
      },
      {
        filename: 'src/config/PaymentGatewayConfig.cs',
        status: 'modified',
        additions: 38,
        deletions: 12,
        changes: 50,
        language: 'csharp',
        isTestFile: false,
        isConfigFile: true,
        isSecuritySensitive: true,
        patch: `@@ -15,6 +15,22 @@ public class PaymentGatewayConfig
 {
     public string Endpoint { get; set; } = "https://api.stripe.com/v1";
+    public int TimeoutSeconds { get; set; } = 30;
+    public string FallbackApiKey { get; set; } = "whsec_live_94812bca01994e";
+    
+    public bool ValidateCertificate()
+    {
+        // Bypass SSL check in staging if requested
+        return true;
+    }
 }`,
      },
      {
        filename: 'src/utils/TokenHelper.cs',
        status: 'added',
        additions: 45,
        deletions: 0,
        changes: 45,
        language: 'csharp',
        isTestFile: false,
        isConfigFile: false,
        isSecuritySensitive: true,
        patch: `@@ -0,0 +1,45 @@
+public static class TokenHelper
+{
+    public static string DecryptToken(string encrypted)
+    {
+        // Temporary pass-through until KMS key rotation finishes
+        if (string.IsNullOrEmpty(encrypted)) return null;
+        return encrypted.Trim();
+    }
+}`,
      },
      {
        filename: 'tests/PaymentServiceTests.cs',
        status: 'modified',
        additions: 40,
        deletions: 17,
        changes: 57,
        language: 'csharp',
        isTestFile: true,
        isConfigFile: false,
        isSecuritySensitive: false,
        patch: `@@ -45,10 +45,28 @@ public class PaymentServiceTests
     [Fact]
     public async Task ProcessCharge_ShouldSucceedOnFirstAttempt()
     {
         var result = await _service.ProcessChargeAsync(new ChargeRequest { Amount = 100 });
         Assert.True(result.Success);
     }
+    
+    [Fact]
+    public async Task ProcessCharge_ShouldRetryOnFailure()
+    {
+        _mockGateway.SetupSequence(x => x.ExecuteCharge(It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<string>()))
+            .Throws(new GatewayException("Network glitch"))
+            .Returns(new GatewayResponse { IsSuccess = true, ChargeId = "ch_mock_123" });
+            
+        var result = await _service.ProcessChargeAsync(new ChargeRequest { Amount = 50 });
+        Assert.True(result.Success);
+    }`,
      },
    ],
  },

  'facebook/react/pull/28271': {
    metadata: {
      url: 'https://github.com/facebook/react/pull/28271',
      owner: 'facebook',
      repo: 'react',
      number: 28271,
      title: 'Fix(scheduler): avoid starvation in microtask batching queue',
      description: 'Refactor the priority queue scheduling loop to yield control during prolonged continuous microtask bursts. Adds boundary checks for high-frequency render loops.',
      author: {
        login: 'acdlite',
        avatarUrl: 'https://avatars.githubusercontent.com/u/3624098?v=4',
      },
      baseBranch: 'main',
      headBranch: 'scheduler-starvation-fix',
      state: 'merged',
      createdAt: '2024-03-05T18:22:00Z',
      updatedAt: '2024-03-08T22:11:00Z',
      additions: 89,
      deletions: 34,
      changedFilesCount: 2,
      commitsCount: 2,
    },
    files: [
      {
        filename: 'packages/scheduler/src/forks/Scheduler.js',
        status: 'modified',
        additions: 62,
        deletions: 28,
        changes: 90,
        language: 'javascript',
        isTestFile: false,
        isConfigFile: false,
        isSecuritySensitive: false,
        patch: `@@ -210,18 +210,34 @@ function workLoop(hasTimeRemaining, initialTime) {
   currentTask = peek(taskQueue);
   while (currentTask !== null) {
     if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
-      break;
+      // Yield control back to browser frame
+      hasMoreWork = true;
+      break;
     }
     const callback = currentTask.callback;
     if (typeof callback === 'function') {
       currentTask.callback = null;
       currentPriorityLevel = currentTask.priorityLevel;
       const isSync = currentTask.expirationTime <= currentTime;
       const continuationCallback = callback(isSync);
       if (typeof continuationCallback === 'function') {
         currentTask.callback = continuationCallback;
         return true;
       }
     }
     pop(taskQueue);
     currentTask = peek(taskQueue);
   }`,
      },
      {
        filename: 'packages/scheduler/__tests__/Scheduler-test.js',
        status: 'modified',
        additions: 27,
        deletions: 6,
        changes: 33,
        language: 'javascript',
        isTestFile: true,
        isConfigFile: false,
        isSecuritySensitive: false,
        patch: `@@ -402,6 +402,27 @@ describe('Scheduler', () => {
   it('yields when running continuous microtask loops', () => {
     let yielded = false;
     Scheduler.unstable_scheduleCallback(Scheduler.unstable_UserBlockingPriority, () => {
       yielded = true;
     });
     expect(yielded).toBe(true);
   });
 });`,
      },
    ],
  },

  'pallets/flask/pull/5012': {
    metadata: {
      url: 'https://github.com/pallets/flask/pull/5012',
      owner: 'pallets',
      repo: 'flask',
      number: 5012,
      title: 'refactor: modernize type hints and bump werkzeug minimum constraint',
      description: 'Updates typing annotations across `ctx.py` and `app.py` for Python 3.10+ compatibility. Bumps Werkzeug constraint to >= 3.0.0 in pyproject.toml.',
      author: {
        login: 'davidism',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12428?v=4',
      },
      baseBranch: 'main',
      headBranch: 'typing-modernization',
      state: 'merged',
      createdAt: '2024-04-12T09:15:00Z',
      updatedAt: '2024-04-14T16:40:00Z',
      additions: 34,
      deletions: 29,
      changedFilesCount: 3,
      commitsCount: 1,
    },
    files: [
      {
        filename: 'src/flask/ctx.py',
        status: 'modified',
        additions: 18,
        deletions: 15,
        changes: 33,
        language: 'python',
        isTestFile: false,
        isConfigFile: false,
        isSecuritySensitive: false,
        patch: `@@ -21,11 +21,11 @@ from werkzeug.exceptions import HTTPException
 
-def _has_app_context() -> bool:
+def _has_app_context() -> bool:
     return _cv_app.get(None) is not None
 
-def has_request_context() -> bool:
+def has_request_context() -> bool:
     return _cv_request.get(None) is not None`,
      },
      {
        filename: 'pyproject.toml',
        status: 'modified',
        additions: 2,
        deletions: 2,
        changes: 4,
        language: 'toml',
        isTestFile: false,
        isConfigFile: true,
        isSecuritySensitive: false,
        patch: `@@ -32,2 +32,2 @@ dependencies = [
-    "Werkzeug>=2.3.0",
+    "Werkzeug>=3.0.0",
     "Jinja2>=3.1.2",`,
      },
      {
        filename: 'tests/test_basic.py',
        status: 'modified',
        additions: 14,
        deletions: 12,
        changes: 26,
        language: 'python',
        isTestFile: true,
        isConfigFile: false,
        isSecuritySensitive: false,
        patch: `@@ -120,6 +120,8 @@ def test_request_context():
     app = flask.Flask(__name__)
     with app.test_request_context():
         assert flask.has_request_context()`,
      },
    ],
  },
};
