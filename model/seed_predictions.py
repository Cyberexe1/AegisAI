"""
Seed script to populate predictions collection with sample data
This provides data for the monitoring dashboard
"""

import asyncio
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from config import settings

# Sample prediction data
def generate_sample_predictions(count=50):
    predictions = []
    base_time = datetime.now() - timedelta(hours=24)
    
    for i in range(count):
        # Generate realistic loan application data
        income = random.randint(30000, 150000)
        age = random.randint(25, 65)
        loan_amount = random.randint(10000, 500000)
        credit_history = random.choice(['Good', 'Fair', 'Poor'])
        employment_type = random.choice(['Salaried', 'Self-Employed', 'Business'])
        existing_debts = random.randint(0, 100000)
        
        # Calculate approval probability based on factors
        base_prob = 0.5
        if credit_history == 'Good':
            base_prob += 0.3
        elif credit_history == 'Fair':
            base_prob += 0.1
        else:
            base_prob -= 0.2
            
        if income > 80000:
            base_prob += 0.1
        if loan_amount < 100000:
            base_prob += 0.1
        if existing_debts < 20000:
            base_prob += 0.1
            
        approval_probability = max(0.1, min(0.95, base_prob + random.uniform(-0.1, 0.1)))
        
        # Determine risk category
        if approval_probability > 0.7:
            risk_category = 'Low'
        elif approval_probability > 0.4:
            risk_category = 'Medium'
        else:
            risk_category = 'High'
        
        # Generate timestamp spread over last 24 hours
        timestamp = base_time + timedelta(hours=i * 24 / count)
        
        prediction = {
            'timestamp': timestamp,
            'input_data': {
                'income': income,
                'age': age,
                'loan_amount': loan_amount,
                'credit_history': credit_history,
                'employment_type': employment_type,
                'existing_debts': existing_debts
            },
            'approval_probability': approval_probability,
            'risk_category': risk_category,
            'confidence_score': random.uniform(0.75, 0.95),
            'processing_time_ms': random.uniform(30, 100),
            'model_version': '145858',
            'user_id': f'user_{random.randint(1, 10):03d}'
        }
        
        predictions.append(prediction)
    
    return predictions

def seed_database():
    print("🌱 Seeding predictions database...\n")
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    predictions_collection = db['predictions']
    
    # Clear existing predictions (optional)
    print("🗑️  Clearing existing predictions...")
    predictions_collection.delete_many({})
    print("✅ Cleared\n")
    
    # Generate and insert predictions
    print("📝 Generating sample predictions...")
    predictions = generate_sample_predictions(50)
    
    print(f"💾 Inserting {len(predictions)} predictions...")
    result = predictions_collection.insert_many(predictions)
    print(f"✅ Inserted {len(result.inserted_ids)} predictions\n")
    
    # Display summary
    print("📊 Summary:")
    print("─" * 40)
    
    total = predictions_collection.count_documents({})
    low_risk = predictions_collection.count_documents({'risk_category': 'Low'})
    medium_risk = predictions_collection.count_documents({'risk_category': 'Medium'})
    high_risk = predictions_collection.count_documents({'risk_category': 'High'})
    
    print(f"Total Predictions: {total}")
    print(f"Low Risk:          {low_risk}")
    print(f"Medium Risk:       {medium_risk}")
    print(f"High Risk:         {high_risk}")
    print("─" * 40)
    
    # Calculate average metrics
    pipeline = [
        {
            '$group': {
                '_id': None,
                'avg_approval_prob': {'$avg': '$approval_probability'},
                'avg_confidence': {'$avg': '$confidence_score'},
                'avg_processing_time': {'$avg': '$processing_time_ms'}
            }
        }
    ]
    
    stats = list(predictions_collection.aggregate(pipeline))
    if stats:
        print(f"\n📈 Average Metrics:")
        print(f"Approval Probability: {stats[0]['avg_approval_prob']:.2%}")
        print(f"Confidence Score:     {stats[0]['avg_confidence']:.2%}")
        print(f"Processing Time:      {stats[0]['avg_processing_time']:.1f}ms")
    
    print("\n🎉 Database seeding completed!")
    print("\n💡 Your monitoring dashboard should now display data:")
    print("   - Model Health Panel: Accuracy and performance metrics")
    print("   - Drift Monitor: Feature drift detection")
    print("   - Performance Tracker: Precision, recall, F1-score")
    
    client.close()

if __name__ == "__main__":
    seed_database()
