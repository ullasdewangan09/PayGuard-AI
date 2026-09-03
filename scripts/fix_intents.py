import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json

load_dotenv()
url = os.getenv('DATABASE_URL')
engine = create_engine(url)

with engine.begin() as conn:
    print('Updating intents to have valid jsonb...')
    # Get all intents and update them
    result = conn.execute(text('SELECT id, intent_jsonb FROM intents'))
    for row in result:
        intent_id = row[0]
        data = row[1]
        
        # Add required fields if they don't exist
        if not isinstance(data, dict):
            if isinstance(data, str):
                data = json.loads(data)
            else:
                data = {}
                
        if 'currency' not in data:
            data['currency'] = 'INR'
        if 'max_total_amount' not in data:
            data['max_total_amount'] = 10000.0
            
        data_json = json.dumps(data)
        # Using parameters to avoid SQL injection / escaping issues
        conn.execute(text("UPDATE intents SET intent_jsonb = :data WHERE id = :id"), {"data": data_json, "id": intent_id})

print('Done!')
