const testSignup = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/customer/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                password: 'password123',
                fundPassword: '123456',
                phoneNumber: '+9876543210',
            }),
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (data.account) {
            console.log('\n✅ Account created successfully!');
            console.log('Account ID:', data.account.account_id);
            console.log('Balance:', data.account.balance);
            console.log('Profit:', data.account.profit);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

testSignup();
