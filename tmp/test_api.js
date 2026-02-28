const axios = require('axios');

async function testApi() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@testcorp.com',
            password: 'password123' // I don't know the password, let's guess
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const deliveriesRes = await axios.get('http://localhost:5000/api/deliveries', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Deliveries:', deliveriesRes.data.length);
    } catch (err) {
        console.error('API Test Error:', err.response?.data || err.message);
    }
}

testApi();
