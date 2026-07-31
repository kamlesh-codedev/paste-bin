from flask import Flask

from app.config import Config
from app.extensions import db, migrate, jwt, cors
from app.models import User, Paste



def create_app(config_class=Config):
    """Application factory."""

    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    cors.init_app(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://paste-bin-frontend-k2rl.onrender.com"
            ]
        }
    }
    )

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.pastes import pastes_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(pastes_bp)

    return app