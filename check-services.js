// Check if all AegisAI services are running
const services = [
    { name: 'ML API', url: 'http://localhost:8000', endpoint: '/' },
    { name: 'Backend', url: 'http://localhost:5000', endpoint: '/api/health' },
    { name: 'Frontend', url: 'http://localhost:5173', endpoint: '/', checkText: true }
];

async function checkService(service) {
    try {
        const response = await fetch(`${service.url}${service.endpoint}`);
        if (response.ok) {
            console.log(`✅ ${service.name.padEnd(15)} - Running on ${service.url}`);
            return true;
        } else {
            console.log(`⚠️  ${service.name.padEnd(15)} - Responded with ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${service.name.padEnd(15)} - Not running (${error.message})`);
        return false;
    }
}

async function checkAll() {
    console.log('\n🔍 Checking AegisAI Services...\n');
    
    const results = await Promise.all(services.map(checkService));
    const allRunning = results.every(r => r);
    
    console.log('\n' + '='.repeat(50));
    if (allRunning) {
        console.log('🎉 All services are running!');
        console.log('\n📊 Admin Dashboard: http://localhost:5173');
        console.log('   Login: vikastiwari1045@gmail.com / Vikas123@');
        console.log('\n👤 User Dashboard: http://localhost:5173');
        console.log('   Login: user@agesai.com / Vikas123@');
    } else {
        console.log('⚠️  Some services are not running.');
        console.log('\n💡 To start all services, run:');
        console.log('   start-all-services.bat');
        console.log('\n   Or start them manually:');
        console.log('   1. cd model && python main.py');
        console.log('   2. cd Backend && npm start');
        console.log('   3. cd Frontend && npm run dev');
    }
    console.log('='.repeat(50) + '\n');
}

checkAll();
