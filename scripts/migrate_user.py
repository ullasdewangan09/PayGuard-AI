import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('DATABASE_URL')
engine = create_engine(url)

real_uuid = "372c9399-e2dc-4b1c-8551-e11f9014a4ae"
dummy_uuid = "test-user-cf0c8e81"
email = "ullasdewangan09@gmail.com"

# Insert the real user if it doesn't exist
with engine.begin() as conn:
    print("Renaming dummy user's email to avoid conflict...")
    conn.execute(text(f"UPDATE users SET email = 'temp_' || email WHERE id = '{dummy_uuid}'"))

    print("Ensuring real user exists...")
    conn.execute(text(f"""
        INSERT INTO users (id, email, phone_number, email_enabled, sms_enabled, whatsapp_enabled)
        SELECT '{real_uuid}', '{email}', phone_number, email_enabled, sms_enabled, whatsapp_enabled
        FROM users WHERE id = '{dummy_uuid}'
        ON CONFLICT (id) DO NOTHING
    """))

    print("Updating intents...")
    conn.execute(text(f"UPDATE intents SET user_id = '{real_uuid}' WHERE user_id = '{dummy_uuid}'"))
    
    print("Updating transactions...")
    conn.execute(text(f"UPDATE transactions SET agent_id = '{real_uuid}' WHERE agent_id = '{dummy_uuid}'"))
    
    print("Updating receipts...")
    conn.execute(text(f"UPDATE receipts SET user_id = '{real_uuid}' WHERE user_id = '{dummy_uuid}'"))
    
    print("Updating audit_events...")
    conn.execute(text(f"UPDATE audit_events SET entity_id = '{real_uuid}' WHERE entity_type = 'User' AND entity_id = '{dummy_uuid}'"))

    print("Updating notifications...")
    conn.execute(text(f"UPDATE notifications SET user_id = '{real_uuid}' WHERE user_id = '{dummy_uuid}'"))

    print("Deleting old dummy user...")
    conn.execute(text(f"DELETE FROM users WHERE id = '{dummy_uuid}'"))
    
print("Migration complete!")
