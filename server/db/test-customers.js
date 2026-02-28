require('dotenv').config({path: require('path').resolve('.env'), override: true});

async function test() {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@testcorp.com', password: 'Test1234!' })
    });
    const { token } = await loginRes.json();
    if (!token) { console.log('Login failed'); return; }
    console.log('Login OK, token:', token.slice(0, 20) + '...');

    // Create customer
    const createRes = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0100',
            address: '456 Oak Ave, New York, NY'
        })
    });
    const createData = await createRes.json();
    console.log('Create customer ->', createRes.status, JSON.stringify(createData));

    // List customers
    const listRes = await fetch('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log('Customer list count:', Array.isArray(listData) ? listData.length : 'error', '->', Array.isArray(listData) ? listData.map(c => c.name).join(', ') : JSON.stringify(listData));
}

test().catch(e => console.error(e.message));
