const TEST_PHONE = '8888888888';

async function testTradeableFlow() {
    console.log('--- Registering ---');
    await fetch('http://localhost:3000/api/v1/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Tradeable Tester',
            password: 'password123',
            fundPassword: '123456',
            phoneNumber: TEST_PHONE,
        }),
    });

    console.log('--- Logging In ---');
    const loginRes = await fetch('http://localhost:3000/api/v1/customer/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phoneNumber: TEST_PHONE,
            password: 'password123',
        }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token received:', !!token);

    console.log('--- Attemping to Activate Plan (should fail) ---');
    const actRes = await fetch('http://localhost:3000/api/v1/customer/activate-order-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const actData = await actRes.json();
    console.log('Status:', actRes.status);
    console.log('Response:', actData);
}

testTradeableFlow();
