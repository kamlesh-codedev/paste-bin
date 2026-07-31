import pytest
from app import create_app
from app.extensions import db
from app.config import Config

class TestConfig(Config):
    """Test configuration that overrides the real database with memory."""
    TESTING = True
    # Use a temporary SQLite in-memory database for blazing fast tests
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    # Hardcode a JWT secret just for testing purposes
    JWT_SECRET_KEY = "super-secret-test-key"
    # Disable CSRF tokens in testing (if you ever add them)
    WTF_CSRF_ENABLED = False

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app(TestConfig)

    # Establish an application context before running the tests.
    with app.app_context():
        # Create all tables in the temporary in-memory database
        db.create_all()
        
        yield app
        
        # Clean up the database after the test finishes
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app to simulate API requests."""
    return app.test_client()