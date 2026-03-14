const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/customer/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: '0123456789', // Phone number
                password: 'password123',
            }),
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (data.token) {
            console.log('\n✅ Login successful!');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

testLogin();
