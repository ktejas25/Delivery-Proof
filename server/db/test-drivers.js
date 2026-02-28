require('dotenv').config({path: require('path').resolve('.env'), override: true});

async function test() {
    // Login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@testcorp.com', password: 'Test1234!' })
    });
    const { token } = await loginRes.json();
    if (!token) { console.log('Login failed'); return; }
    console.log('Login OK');

    // Create driver
    const createRes = await fetch('http://localhost:5000/api/auth/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            first_name: 'Alex',
            last_name: 'Driver',
            email: `driver${Date.now()}@testcorp.com`,
            password: 'Driver1234!',
            vehicle_type: 'van',
            license_number: 'DL-9999'
        })
    });
    const data = await createRes.json();
    console.log('Create driver ->', createRes.status, JSON.stringify(data));

    // List drivers
    const listRes = await fetch('http://localhost:5000/api/auth/drivers', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const drivers = await listRes.json();
    console.log('Driver count:', Array.isArray(drivers) ? drivers.length : 'error ->' + JSON.stringify(drivers));
    if (Array.isArray(drivers)) {
        drivers.forEach(d => console.log(' -', d.first_name, d.last_name, '|', d.status));
    }
}

test().catch(e => console.error(e.message));
