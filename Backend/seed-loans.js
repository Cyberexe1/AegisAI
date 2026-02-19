/**
 * Seed Script for Loan Applications
 * Creates realistic loan data for demo purposes
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegisai';

const sampleLoans = [
    // User: user@agesai.com - Ongoing Loans
    {
        userId: 'user@agesai.com',
        userName: 'John Doe',
        loanAmount: 250000,
        loanPurpose: 'Home Purchase',
        status: 'ongoing',
        approvalStatus: 'approved',
        applicationDate: new Date('2025-12-15'),
        approvalDate: new Date('2025-12-20'),
        disbursementDate: new Date('2026-01-05'),
        tenure: 240, // 20 years
        interestRate: 8.5,
        monthlyEMI: 2145,
        paidEMIs: 2,
        remainingEMIs: 238,
        nextDueDate: new Date('2026-03-05'),
        creditScore: 750,
        mlPrediction: {
            approved: true,
            confidence: 0.89,
            riskScore: 0.11
        }
    },
    {
        userId: 'user@agesai.com',
        userName: 'John Doe',
        loanAmount: 50000,
        loanPurpose: 'Education',
        status: 'ongoing',
        approvalStatus: 'approved',
        applicationDate: new Date('2025-08-10'),
        approvalDate: new Date('2025-08-15'),
        disbursementDate: new Date('2025-09-01'),
        tenure: 60, // 5 years
        interestRate: 10.5,
        monthlyEMI: 1068,
        paidEMIs: 6,
        remainingEMIs: 54,
        nextDueDate: new Date('2026-03-01'),
        creditScore: 750,
        mlPrediction: {
            approved: true,
            confidence: 0.92,
            riskScore: 0.08
        }
    },

    // User: user@agesai.com - Completed Loans
    {
        userId: 'user@agesai.com',
        userName: 'John Doe',
        loanAmount: 30000,
        loanPurpose: 'Personal',
        status: 'completed',
        approvalStatus: 'approved',
        applicationDate: new Date('2023-01-15'),
        approvalDate: new Date('2023-01-20'),
        disbursementDate: new Date('2023-02-01'),
        completionDate: new Date('2025-02-01'),
        tenure: 24,
        interestRate: 12.0,
        monthlyEMI: 1412,
        paidEMIs: 24,
        remainingEMIs: 0,
        creditScore: 720,
        mlPrediction: {
            approved: true,
            confidence: 0.85,
            riskScore: 0.15
        }
    },

    // User: user@agesai.com - Rejected Loan
    {
        userId: 'user@agesai.com',
        userName: 'John Doe',
        loanAmount: 500000,
        loanPurpose: 'Business',
        status: 'rejected',
        approvalStatus: 'rejected',
        applicationDate: new Date('2025-11-01'),
        rejectionDate: new Date('2025-11-05'),
        rejectionReason: 'Insufficient income for requested amount',
        tenure: 120,
        interestRate: null,
        creditScore: 750,
        mlPrediction: {
            approved: false,
            confidence: 0.78,
            riskScore: 0.65
        }
    },

    // User: user@agesai.com - Pending Application
    {
        userId: 'user@agesai.com',
        userName: 'John Doe',
        loanAmount: 75000,
        loanPurpose: 'Vehicle',
        status: 'pending',
        approvalStatus: 'pending',
        applicationDate: new Date('2026-02-10'),
        tenure: 60,
        interestRate: 9.5,
        creditScore: 750,
        mlPrediction: {
            approved: true,
            confidence: 0.88,
            riskScore: 0.12
        }
    },

    // Other Users - For Admin Dashboard Monitoring
    {
        userId: 'alice@example.com',
        userName: 'Alice Johnson',
        loanAmount: 180000,
        loanPurpose: 'Home Purchase',
        status: 'ongoing',
        approvalStatus: 'approved',
        applicationDate: new Date('2025-10-01'),
        approvalDate: new Date('2025-10-10'),
        disbursementDate: new Date('2025-11-01'),
        tenure: 180,
        interestRate: 8.75,
        monthlyEMI: 1789,
        paidEMIs: 4,
        remainingEMIs: 176,
        nextDueDate: new Date('2026-03-01'),
        creditScore: 780,
        mlPrediction: {
            approved: true,
            confidence: 0.94,
            riskScore: 0.06
        }
    },
    {
        userId: 'bob@example.com',
        userName: 'Bob Smith',
        loanAmount: 40000,
        loanPurpose: 'Medical',
        status: 'ongoing',
        approvalStatus: 'approved',
        applicationDate: new Date('2026-01-05'),
        approvalDate: new Date('2026-01-10'),
        disbursementDate: new Date('2026-01-20'),
        tenure: 36,
        interestRate: 11.0,
        monthlyEMI: 1312,
        paidEMIs: 1,
        remainingEMIs: 35,
        nextDueDate: new Date('2026-03-20'),
        creditScore: 690,
        mlPrediction: {
            approved: true,
            confidence: 0.81,
            riskScore: 0.19
        }
    },
    {
        userId: 'carol@example.com',
        userName: 'Carol Williams',
        loanAmount: 100000,
        loanPurpose: 'Business',
        status: 'pending',
        approvalStatus: 'pending',
        applicationDate: new Date('2026-02-15'),
        tenure: 84,
        interestRate: 10.0,
        creditScore: 710,
        mlPrediction: {
            approved: true,
            confidence: 0.76,
            riskScore: 0.24
        }
    },
    {
        userId: 'david@example.com',
        userName: 'David Brown',
        loanAmount: 350000,
        loanPurpose: 'Home Purchase',
        status: 'rejected',
        approvalStatus: 'rejected',
        applicationDate: new Date('2026-01-20'),
        rejectionDate: new Date('2026-01-25'),
        rejectionReason: 'Low credit score',
        tenure: 240,
        creditScore: 580,
        mlPrediction: {
            approved: false,
            confidence: 0.91,
            riskScore: 0.82
        }
    },
    {
        userId: 'emma@example.com',
        userName: 'Emma Davis',
        loanAmount: 60000,
        loanPurpose: 'Education',
        status: 'completed',
        approvalStatus: 'approved',
        applicationDate: new Date('2022-06-01'),
        approvalDate: new Date('2022-06-10'),
        disbursementDate: new Date('2022-07-01'),
        completionDate: new Date('2025-07-01'),
        tenure: 36,
        interestRate: 9.5,
        monthlyEMI: 1923,
        paidEMIs: 36,
        remainingEMIs: 0,
        creditScore: 740,
        mlPrediction: {
            approved: true,
            confidence: 0.87,
            riskScore: 0.13
        }
    }
];

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');
        
        const db = client.db();
        const loansCollection = db.collection('loans');
        
        // Clear existing loans (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing loans...');
        await loansCollection.deleteMany({});
        console.log('✅ Cleared existing loans\n');
        
        // Insert sample loans
        console.log('📝 Inserting sample loans...');
        const result = await loansCollection.insertMany(sampleLoans);
        console.log(`✅ Inserted ${result.insertedCount} loans\n`);
        
        // Display summary
        console.log('📊 Loan Summary:');
        console.log('─────────────────────────────────────');
        
        const ongoing = await loansCollection.countDocuments({ status: 'ongoing' });
        const completed = await loansCollection.countDocuments({ status: 'completed' });
        const pending = await loansCollection.countDocuments({ status: 'pending' });
        const rejected = await loansCollection.countDocuments({ status: 'rejected' });
        
        console.log(`Ongoing Loans:   ${ongoing}`);
        console.log(`Completed Loans: ${completed}`);
        console.log(`Pending Loans:   ${pending}`);
        console.log(`Rejected Loans:  ${rejected}`);
        console.log(`Total Loans:     ${ongoing + completed + pending + rejected}`);
        console.log('─────────────────────────────────────\n');
        
        // User-specific summary
        const userLoans = await loansCollection.countDocuments({ userId: 'user@agesai.com' });
        console.log(`📧 user@agesai.com has ${userLoans} loans:`);
        
        const userOngoing = await loansCollection.countDocuments({ 
            userId: 'user@agesai.com', 
            status: 'ongoing' 
        });
        const userCompleted = await loansCollection.countDocuments({ 
            userId: 'user@agesai.com', 
            status: 'completed' 
        });
        const userPending = await loansCollection.countDocuments({ 
            userId: 'user@agesai.com', 
            status: 'pending' 
        });
        const userRejected = await loansCollection.countDocuments({ 
            userId: 'user@agesai.com', 
            status: 'rejected' 
        });
        
        console.log(`  - Ongoing: ${userOngoing}`);
        console.log(`  - Completed: ${userCompleted}`);
        console.log(`  - Pending: ${userPending}`);
        console.log(`  - Rejected: ${userRejected}\n`);
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n💡 You can now:');
        console.log('   1. Login as user@agesai.com to see user dashboard');
        console.log('   2. Login as admin@agesai.com to see admin dashboard');
        console.log('   3. View ongoing loans being monitored\n');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Database connection closed');
    }
}

// Run the seed script
seedDatabase();
