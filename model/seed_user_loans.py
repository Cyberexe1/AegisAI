"""
Seed script to populate database with sample user loan data.

Creates realistic loan history for demo purposes including:
- Past approved loans
- Ongoing loans
- Rejected applications
- Pending applications
"""

import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from config import settings

# Sample loan data for demo users
DEMO_USERS = {
    "demo-user-001": "Demo User",
    "user@aegisai.com": "AegisAI User"
}


def get_sample_loans(user_id: str):
    """Generate sample loans for a user."""
    return [
        # Approved Loans (Past)
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=180),
            "input_data": {
                "income": 85000,
                "age": 32,
                "loan_amount": 15000,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 5000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 28.5,
                "risk_category": "Low",
                "confidence": 0.94,
                "approval_probability": 0.89,
                "model_version": "v1.0.0",
                "processing_time_ms": 45.2
            }
        },
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=120),
            "input_data": {
                "income": 90000,
                "age": 33,
                "loan_amount": 25000,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 8000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 32.1,
                "risk_category": "Low",
                "confidence": 0.91,
                "approval_probability": 0.85,
                "model_version": "v1.0.0",
                "processing_time_ms": 48.7
            }
        },
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=90),
            "input_data": {
                "income": 95000,
                "age": 33,
                "loan_amount": 10000,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 12000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 35.8,
                "risk_category": "Low",
                "confidence": 0.88,
                "approval_probability": 0.82,
                "model_version": "v1.0.0",
                "processing_time_ms": 42.3
            }
        },
        
        # Ongoing Loans (Recently Approved)
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=30),
            "input_data": {
                "income": 100000,
                "age": 34,
                "loan_amount": 35000,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 15000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 38.2,
                "risk_category": "Low",
                "confidence": 0.87,
                "approval_probability": 0.78,
                "model_version": "v1.0.0",
                "processing_time_ms": 51.4
            }
        },
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=15),
            "input_data": {
                "income": 105000,
                "age": 34,
                "loan_amount": 20000,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 18000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 41.5,
                "risk_category": "Low",
                "confidence": 0.85,
                "approval_probability": 0.75,
                "model_version": "v1.0.0",
                "processing_time_ms": 46.8
            }
        },
        
        # Pending Applications
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=5),
            "input_data": {
                "income": 110000,
                "age": 34,
                "loan_amount": 50000,
                "credit_history": "Fair",
                "employment_type": "Full-time",
                "existing_debts": 25000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 55.3,
                "risk_category": "Medium",
                "confidence": 0.76,
                "approval_probability": 0.62,
                "model_version": "v1.0.0",
                "processing_time_ms": 53.2
            }
        },
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=2),
            "input_data": {
                "income": 115000,
                "age": 34,
                "loan_amount": 30000,
                "credit_history": "Fair",
                "employment_type": "Full-time",
                "existing_debts": 28000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 58.7,
                "risk_category": "Medium",
                "confidence": 0.73,
                "approval_probability": 0.58,
                "model_version": "v1.0.0",
                "processing_time_ms": 49.6
            }
        },
        
        # Rejected Applications
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=60),
            "input_data": {
                "income": 45000,
                "age": 32,
                "loan_amount": 40000,
                "credit_history": "Poor",
                "employment_type": "Part-time",
                "existing_debts": 20000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 78.4,
                "risk_category": "High",
                "confidence": 0.89,
                "approval_probability": 0.18,
                "model_version": "v1.0.0",
                "processing_time_ms": 44.1
            }
        },
        {
            "user_id": user_id,
            "timestamp": datetime.now() - timedelta(days=45),
            "input_data": {
                "income": 50000,
                "age": 33,
                "loan_amount": 35000,
                "credit_history": "Poor",
                "employment_type": "Self-employed",
                "existing_debts": 25000,
                "user_id": user_id
            },
            "prediction": {
                "risk_score": 72.1,
                "risk_category": "High",
                "confidence": 0.84,
                "approval_probability": 0.25,
                "model_version": "v1.0.0",
                "processing_time_ms": 47.9
            }
        }
    ]


def seed_user_data(user_id: str, user_name: str, predictions_collection):
    """Seed data for a specific user."""
    print(f"\n{'='*60}")
    print(f"Processing: {user_name} ({user_id})")
    print(f"{'='*60}")
    
    # Check if data already exists
    existing_count = predictions_collection.count_documents({"user_id": user_id})
    
    if existing_count > 0:
        print(f"⚠️  Found {existing_count} existing loans for {user_id}")
        response = input(f"Delete existing data for {user_name}? (yes/no): ")
        
        if response.lower() in ['yes', 'y']:
            result = predictions_collection.delete_many({"user_id": user_id})
            print(f"✓ Deleted {result.deleted_count} existing loans")
        else:
            print(f"Skipping {user_name}...")
            return
    
    # Get sample loans for this user
    sample_loans = get_sample_loans(user_id)
    
    # Insert sample loans
    print(f"📝 Inserting {len(sample_loans)} sample loans...")
    result = predictions_collection.insert_many(sample_loans)
    print(f"✓ Successfully inserted {len(result.inserted_ids)} loans")
    
    # Display summary
    total = predictions_collection.count_documents({"user_id": user_id})
    approved = predictions_collection.count_documents({
        "user_id": user_id,
        "prediction.risk_category": "Low"
    })
    pending = predictions_collection.count_documents({
        "user_id": user_id,
        "prediction.risk_category": "Medium"
    })
    rejected = predictions_collection.count_documents({
        "user_id": user_id,
        "prediction.risk_category": "High"
    })
    
    print(f"\nLOAN SUMMARY for {user_name}:")
    print(f"Total Applications: {total}")
    print(f"  ✅ Approved (Low Risk): {approved}")
    print(f"  ⚠️  Pending (Medium Risk): {pending}")
    print(f"  ❌ Rejected (High Risk): {rejected}")
    
    # Calculate total borrowed
    approved_loans = list(predictions_collection.find({
        "user_id": user_id,
        "prediction.risk_category": "Low"
    }))
    
    total_borrowed = sum(loan['input_data']['loan_amount'] for loan in approved_loans)
    print(f"💰 Total Borrowed: ${total_borrowed:,.2f}")


def seed_database():
    """Seed the database with sample loan data for all demo users."""
    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB: {settings.MONGODB_URI}")
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DATABASE]
        predictions_collection = db['predictions']
        
        print("\n" + "="*60)
        print("SEEDING DATA FOR ALL DEMO USERS")
        print("="*60)
        
        # Seed data for each user
        for user_id, user_name in DEMO_USERS.items():
            seed_user_data(user_id, user_name, predictions_collection)
        
        # Overall summary
        print("\n" + "="*60)
        print("OVERALL SUMMARY")
        print("="*60)
        
        for user_id, user_name in DEMO_USERS.items():
            count = predictions_collection.count_documents({"user_id": user_id})
            print(f"{user_name:20} ({user_id:25}): {count} loans")
        
        print("\n" + "="*60)
        print("✓ Database seeding completed successfully!")
        print("="*60)
        print(f"\n🌐 View dashboards:")
        print(f"   - http://localhost:5173/user-dashboard")
        print(f"\n📊 API endpoints:")
        for user_id in DEMO_USERS.keys():
            print(f"   - http://localhost:5000/api/loans/user/{user_id}")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("="*60)
    print("LOAN DATA SEEDING SCRIPT")
    print("="*60)
    print(f"Database: {settings.MONGODB_DATABASE}")
    print(f"Users to seed: {len(DEMO_USERS)}")
    for user_id, user_name in DEMO_USERS.items():
        print(f"  - {user_name} ({user_id})")
    print("="*60)
    
    seed_database()
