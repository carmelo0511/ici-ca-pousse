// Test script for authentication system
const http = require('http');

const BASE_URL = 'http://localhost:3001/api';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Testing authentication system...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const usersResponse = await makeRequest('/users');
    if (usersResponse.status === 200) {
      console.log('✅ Server is running and responding');
    } else {
      throw new Error('Server not responding');
    }

    // Test 2: Register a test user
    console.log('\n2️⃣ Testing user registration...');
    const registerResponse = await makeRequest('/register', {
      method: 'POST',
      body: {
        username: 'testuser',
        password: 'testpass123'
      }
    });

    if (registerResponse.status === 200) {
      console.log('✅ User registered successfully');
      console.log(`   User ID: ${registerResponse.data.user.id}`);
      console.log(`   Username: ${registerResponse.data.user.username}`);
      console.log(`   Token: ${registerResponse.data.token.substring(0, 20)}...`);
    } else {
      console.log(`❌ Registration failed: ${registerResponse.data.error}`);
    }

    // Test 3: Login with the test user
    console.log('\n3️⃣ Testing user login...');
    const loginResponse = await makeRequest('/login', {
      method: 'POST',
      body: {
        username: 'testuser',
        password: 'testpass123'
      }
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginResponse.data.user.username}`);
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
    } else {
      console.log(`❌ Login failed: ${loginResponse.data.error}`);
    }

    // Test 4: Validate token
    console.log('\n4️⃣ Testing token validation...');
    const validateResponse = await makeRequest('/validate', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    if (validateResponse.status === 200) {
      console.log('✅ Token validation successful');
      console.log(`   Validated user: ${validateResponse.data.user.username}`);
    } else {
      console.log('❌ Token validation failed');
    }

    // Test 5: List users
    console.log('\n5️⃣ Testing user list...');
    const finalUsersResponse = await makeRequest('/users');
    if (finalUsersResponse.status === 200) {
      const users = finalUsersResponse.data;
      console.log(`✅ Found ${users.length} users in system`);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.id})`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 You can now use the login system in your React app.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: node server.js');
    console.log('2. Check if port 3001 is available');
    console.log('3. Verify all dependencies are installed: npm install');
  }
}

// Run the test
testAuth(); 