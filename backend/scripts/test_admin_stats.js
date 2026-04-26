const testAdminStats = async () => {
    try {
        // First login to get token
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@gmail.com',
                password: 'password@123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }

        // Fetch dashboard stats
        const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        console.log('Admin Dashboard Stats:', JSON.stringify(statsData, null, 2));
        if (statsData.totalRevenue > 0) {
            console.log('SUCCESS: Total Revenue is populated.');
        } else {
            console.log('FAILURE: Total Revenue is still 0.');
        }
    } catch (error) {
        console.error('Error testing admin stats:', error.message);
    }
};

testAdminStats();
