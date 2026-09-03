import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db

# Import models so they are registered
from app.models.user import User
from app.models.intent import Intent
from app.models.transaction import Transaction
from app.models.evaluation import Evaluation, ViolationRecord
from app.models.audit import AuditEvent
from app.models.idempotency import IdempotencyKey


SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    db = TestingSessionLocal(bind=connection)
    
    yield db
    
    db.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    def override_get_current_user_id():
        return "usr_test_123"
            
    app.dependency_overrides[get_db] = override_get_db
    from app.api.v1.auth import get_current_user_id
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    
    yield TestClient(app)
    
    app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides.pop(get_current_user_id, None)
