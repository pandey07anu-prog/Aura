const http = require('http');
const mongoose = require('mongoose');

// We will test on port 8089 to keep it isolated from any other process
process.env.PORT = '8089';
process.env.MONGODB_URI = 'mongodb://localhost:27017/expensetracker';
process.env.MAIL_ENABLED = 'false';

const { startServer } = require('./server');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:8089${path}`);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('>>> STARTING BACKEND INTEGRATION TEST SUITE <<<');
  let server;

  try {
    server = await startServer();
    console.log('[Test] Server started on port 8089.');

    // 1. Health check & status
    console.log('1. Testing GET /api/auth/status...');
    const statusRes = await request('GET', '/api/auth/status');
    assert(statusRes.statusCode === 200, `Expected 200, got ${statusRes.statusCode}`);
    assert(statusRes.body.success === true, 'Expected success: true');
    assert(statusRes.body.data.status === 'UP', 'Expected status: UP');
    assert(statusRes.body.data.version === '1.0.4-mongotemplate-query', 'Expected exact version matching Java');
    console.log('   PASSED: Auth status endpoint verified.');

    // 2. Admin Login
    console.log('2. Testing Admin Login POST /api/auth/login...');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@aurafinance.com',
      password: 'Admin@123456'
    });
    assert(adminLoginRes.statusCode === 200, `Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
    assert(adminLoginRes.body.data.token, 'Expected JWT token in admin response');
    assert(adminLoginRes.body.data.user.role === 'ROLE_ADMIN', 'Expected ROLE_ADMIN');
    const adminToken = adminLoginRes.body.data.token;
    const adminId = adminLoginRes.body.data.user.id;
    console.log(`   PASSED: Admin authenticated successfully. Admin ID: ${adminId}`);

    // 3. User Registration & Auth
    console.log('3. Testing User Registration POST /api/auth/register...');
    const testEmail = `test.user.${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      fullName: 'Test Automation User',
      email: testEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    assert(regRes.statusCode === 201, `Registration failed: ${JSON.stringify(regRes.body)}`);
    assert(regRes.body.data.token, 'Expected JWT token for registered user');
    assert(regRes.body.data.user.role === 'ROLE_USER', 'Expected ROLE_USER');
    const userToken = regRes.body.data.token;
    const userId = regRes.body.data.user.id;
    console.log(`   PASSED: Registered test user. User ID: ${userId}`);

    // 4. Duplicate Registration Conflict Check
    console.log('4. Testing Duplicate Registration Conflict (409)...');
    const dupRegRes = await request('POST', '/api/auth/register', {
      fullName: 'Test Automation User',
      email: testEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    assert(dupRegRes.statusCode === 409, `Expected 409 Conflict, got ${dupRegRes.statusCode}`);
    console.log('   PASSED: 409 Conflict properly returned for duplicate email.');

    // 5. User Login
    console.log('5. Testing User Login POST /api/auth/login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Password@123'
    });
    assert(loginRes.statusCode === 200, `Login failed: ${JSON.stringify(loginRes.body)}`);
    console.log('   PASSED: User login succeeded.');

    // 6. Current User GET /api/auth/me
    console.log('6. Testing GET /api/auth/me...');
    const meRes = await request('GET', '/api/auth/me', null, userToken);
    assert(meRes.statusCode === 200, `GET /api/auth/me failed: ${JSON.stringify(meRes.body)}`);
    assert(meRes.body.data.id === userId, 'Expected matching user id');
    console.log('   PASSED: User profile retrieved.');

    // 7. Categories: System defaults verification
    console.log('7. Testing GET /api/categories...');
    const catsRes = await request('GET', '/api/categories', null, userToken);
    assert(catsRes.statusCode === 200, `GET /api/categories failed`);
    const cats = catsRes.body.data;
    assert(cats.length >= 16, `Expected at least 16 categories, got ${cats.length}`);
    const foodCat = cats.find((c) => c.name.toLowerCase() === 'food');
    assert(foodCat && foodCat.isSystem === true, 'Expected system Food category');
    console.log(`   PASSED: Retrieved ${cats.length} categories with system defaults verified.`);

    // 8. Custom Category CRUD
    console.log('8. Testing Custom Category CRUD...');
    const newCatName = `Crypto-${Date.now()}`;
    const createCatRes = await request(
      'POST',
      '/api/categories',
      {
        name: newCatName,
        type: 'INCOME',
        icon: 'trending-up',
        color: '#10B981'
      },
      userToken
    );
    assert(createCatRes.statusCode === 201, `Create category failed: ${JSON.stringify(createCatRes.body)}`);
    const createdCatId = createCatRes.body.data.id;

    // Get category by ID
    const getCatRes = await request('GET', `/api/categories/${createdCatId}`, null, userToken);
    assert(getCatRes.statusCode === 200, `Get category by id failed`);
    assert(getCatRes.body.data.name === newCatName, 'Expected matching name');

    // Update category
    const updatedCatName = `${newCatName}-Upd`;
    const updateCatRes = await request(
      'PUT',
      `/api/categories/${createdCatId}`,
      {
        name: updatedCatName,
        type: 'INCOME',
        icon: 'wallet',
        color: '#3B82F6'
      },
      userToken
    );
    assert(updateCatRes.statusCode === 200, `Update category failed`);
    assert(updateCatRes.body.data.name === updatedCatName, 'Expected updated name');
    console.log('   PASSED: Custom category created, retrieved and updated.');

    // 9. Transaction Creation & Budget alerts check
    console.log('9. Testing POST /api/transactions...');
    const txRes = await request(
      'POST',
      '/api/transactions',
      {
        type: 'EXPENSE',
        amount: 45.5,
        category: 'Food',
        date: '2026-10-28',
        description: 'Automated Test Organic Lunch',
        paymentMethod: 'CREDIT_CARD',
        notes: 'Verification test'
      },
      userToken
    );
    assert(txRes.statusCode === 201, `Create transaction failed: ${JSON.stringify(txRes.body)}`);
    assert(txRes.body.data.amount === 45.5, 'Expected amount 45.5');
    assert(txRes.body.data.date === '2026-10-28', 'Expected date format 2026-10-28');
    const txId = txRes.body.data.id;

    // Income transaction
    const incTxRes = await request(
      'POST',
      '/api/transactions',
      {
        type: 'INCOME',
        amount: 2500.0,
        category: 'Salary',
        date: '2026-10-28',
        description: 'Monthly Engineering Retainer',
        paymentMethod: 'BANK_TRANSFER'
      },
      userToken
    );
    assert(incTxRes.statusCode === 201, `Create income transaction failed`);
    console.log('   PASSED: Expense and income transactions created.');

    // 10. Transaction Pagination & Filtering (Spring Page format verification)
    console.log('10. Testing GET /api/transactions with pagination & filters...');
    const pageRes = await request('GET', '/api/transactions?page=0&size=10&sortBy=date&direction=desc', null, userToken);
    assert(pageRes.statusCode === 200, `GET /api/transactions failed`);
    const pageData = pageRes.body.data;
    assert(Array.isArray(pageData.content), 'Expected content array in Spring Page');
    assert(typeof pageData.totalPages === 'number', 'Expected totalPages number');
    assert(typeof pageData.totalElements === 'number', 'Expected totalElements number');
    assert(pageData.pageable && typeof pageData.pageable.pageNumber === 'number', 'Expected pageable object');
    assert(pageData.totalElements >= 2, `Expected at least 2 transactions, got ${pageData.totalElements}`);
    console.log(`   PASSED: Spring Page pagination verified. totalElements: ${pageData.totalElements}`);

    // Recent transactions
    const recentRes = await request('GET', '/api/transactions/recent', null, userToken);
    assert(recentRes.statusCode === 200, `GET /api/transactions/recent failed`);
    assert(Array.isArray(recentRes.body.data), 'Expected array for recent transactions');
    console.log(`   PASSED: Recent transactions verified (${recentRes.body.data.length} items).`);

    // 11. Budgets: Create, Calculate & Check
    console.log('11. Testing Budget Creation & Calculations...');
    const budgetRes = await request(
      'POST',
      '/api/budgets',
      {
        name: 'October Food Budget',
        category: 'Food',
        monthlyLimit: 100.0,
        month: 10,
        year: 2026,
        alertThreshold: 40.0
      },
      userToken
    );
    assert(budgetRes.statusCode === 201, `Create budget failed: ${JSON.stringify(budgetRes.body)}`);
    const budgetData = budgetRes.body.data;
    assert(budgetData.monthlyLimit === 100.0, 'Expected monthlyLimit 100.0');
    assert(budgetData.spent >= 45.5, `Expected spent >= 45.5, got ${budgetData.spent}`);
    assert(budgetData.percentageUsed >= 45.5, `Expected percentageUsed >= 45.5`);
    assert(budgetData.isNearThreshold === true, 'Expected isNearThreshold to be true');
    const budgetId = budgetData.id;
    console.log(`   PASSED: Budget created and calculated spent correctly (${budgetData.spent} / ${budgetData.monthlyLimit}).`);

    // 12. Recurring Transactions
    console.log('12. Testing Recurring Transactions...');
    const recurRes = await request(
      'POST',
      '/api/recurring-transactions',
      {
        type: 'EXPENSE',
        amount: 15.0,
        category: 'Bills and Utilities',
        description: 'Cloud Server Hosting',
        paymentMethod: 'CREDIT_CARD',
        frequency: 'MONTHLY',
        startDate: '2026-10-01'
      },
      userToken
    );
    assert(recurRes.statusCode === 201, `Create recurring failed: ${JSON.stringify(recurRes.body)}`);
    const recurId = recurRes.body.data.id;

    // Process due recurring transactions
    const processRes = await request('POST', '/api/recurring-transactions/process-now', null, userToken);
    assert(processRes.statusCode === 200, `Process recurring failed`);
    console.log(`   PASSED: Recurring rule created & processed successfully (${processRes.body.data.processedCount} processed).`);

    // 13. Reports: Summary, Distribution, Monthly Trends, CSV Export
    console.log('13. Testing Reports & Analytics...');
    const reportsRes = await request('GET', '/api/reports?startDate=2026-10-01&endDate=2026-10-31', null, userToken);
    assert(reportsRes.statusCode === 200, `GET /api/reports failed: ${JSON.stringify(reportsRes.body)}`);
    const reportData = reportsRes.body.data;
    assert(reportData.summary.totalIncome >= 2500, `Expected totalIncome >= 2500`);
    assert(reportData.summary.totalExpenses > 0, `Expected totalExpenses > 0`);
    assert(reportData.summary.currentBalance > 0, `Expected positive balance`);
    assert(Array.isArray(reportData.categoryDistribution), 'Expected categoryDistribution array');
    assert(Array.isArray(reportData.monthlyTrends), 'Expected monthlyTrends array');
    console.log('   PASSED: Financial summary, category distribution and trends computed.');

    // Dashboard summary
    const dashSummaryRes = await request('GET', '/api/reports/dashboard-summary', null, userToken);
    assert(dashSummaryRes.statusCode === 200, 'GET /api/reports/dashboard-summary failed');
    assert(dashSummaryRes.body.data.hasData === true, 'Expected hasData: true');
    console.log('   PASSED: Dashboard summary computed.');

    // CSV Export
    const csvRes = await request('GET', '/api/reports/export-csv?startDate=2026-10-01&endDate=2026-10-31', null, userToken);
    assert(csvRes.statusCode === 200, 'GET /api/reports/export-csv failed');
    assert(csvRes.headers['content-type'].includes('text/csv'), 'Expected text/csv content type');
    assert(typeof csvRes.body === 'string' && csvRes.body.includes('Transaction ID'), 'Expected CSV header');
    console.log('   PASSED: CSV export generated with valid headers and data.');

    // 14. Notifications
    console.log('14. Testing In-App Notifications...');
    const notifsRes = await request('GET', '/api/notifications', null, userToken);
    assert(notifsRes.statusCode === 200, 'GET /api/notifications failed');
    assert(Array.isArray(notifsRes.body.data), 'Expected notifications array');
    assert(notifsRes.body.data.length > 0, 'Expected at least 1 notification (welcome/budget)');

    const unreadRes = await request('GET', '/api/notifications/unread-count', null, userToken);
    assert(unreadRes.statusCode === 200, 'GET /api/notifications/unread-count failed');
    assert(typeof unreadRes.body.data.unreadCount === 'number', 'Expected unreadCount number');

    const readAllRes = await request('POST', '/api/notifications/read-all', null, userToken);
    assert(readAllRes.statusCode === 200, 'POST /api/notifications/read-all failed');
    console.log('   PASSED: Notifications listed, unread counted, and marked as read.');

    // 15. Admin API (with Admin Token)
    console.log('15. Testing Admin Dashboard & User Management...');
    const adminDashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminDashRes.statusCode === 200, `Admin dashboard failed: ${JSON.stringify(adminDashRes.body)}`);
    assert(adminDashRes.body.data.totalUsers >= 2, 'Expected totalUsers >= 2');
    assert(adminDashRes.body.data.totalTransactions >= 2, 'Expected totalTransactions >= 2');

    const adminUsersRes = await request('GET', '/api/admin/users?page=0&size=10', null, adminToken);
    assert(adminUsersRes.statusCode === 200, 'Admin users list failed');
    assert(adminUsersRes.body.data.content.length >= 2, 'Expected at least 2 users');

    const userDetailRes = await request('GET', `/api/admin/users/${userId}`, null, adminToken);
    assert(userDetailRes.statusCode === 200, 'Admin user details failed');
    assert(userDetailRes.body.data.user.id === userId, 'Expected matching user id');

    // Admin Status Update (Audit Log test)
    const statusUpdateRes = await request(
      'PATCH',
      `/api/admin/users/${userId}/status`,
      {
        status: 'ACTIVE',
        reason: 'Automated verification check'
      },
      adminToken
    );
    assert(statusUpdateRes.statusCode === 200, 'Update user status failed');

    // Audit logs
    const auditLogsRes = await request('GET', '/api/admin/audit-logs', null, adminToken);
    assert(auditLogsRes.statusCode === 200, 'Get audit logs failed');
    assert(Array.isArray(auditLogsRes.body.data), 'Expected array of audit logs');
    console.log('   PASSED: Admin dashboard, user management, status updates and audit logs verified.');

    // 16. Security & Role Guard (Forbidden check)
    console.log('16. Testing Role-based Security Guard (403 Forbidden)...');
    const forbiddenRes = await request('GET', '/api/admin/dashboard', null, userToken);
    assert(forbiddenRes.statusCode === 403, `Expected 403 Forbidden, got ${forbiddenRes.statusCode}`);
    assert(forbiddenRes.body.error === 'Forbidden', 'Expected Forbidden error');
    console.log('   PASSED: Non-admin user blocked with 403 Forbidden.');

    // 17. Cleanup of test category, transaction, budget, recurring rule
    console.log('17. Cleaning up test data...');
    await request('DELETE', `/api/transactions/${txId}`, null, userToken);
    await request('DELETE', `/api/budgets/${budgetId}`, null, userToken);
    await request('DELETE', `/api/recurring-transactions/${recurId}`, null, userToken);
    await request('DELETE', `/api/categories/${createdCatId}`, null, userToken);
    console.log('   PASSED: Test entities cleaned up.');

    console.log('\n======================================================');
    console.log('>>> ALL 17 TEST SUITES PASSED WITH 100% SUCCESS! <<<');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log('[Test] Server closed and MongoDB disconnected.');
  }
}

runTests();
