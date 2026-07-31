def test_register_and_login(client):
    """Test that a user can register and then immediately log in."""
    
    # 1. Register a new user
    register_response = client.post("/api/auth/register", json={
        "username": "test_user",
        "email": "test@example.com",
        "password": "securepassword123"
    })
    
    assert register_response.status_code == 201
    assert register_response.get_json()["message"] == "User registered successfully"

    # 2. Log in with the new user's credentials
    login_response = client.post("/api/auth/login", json={
        "identifier": "test_user",
        "password": "securepassword123"
    })
    
    assert login_response.status_code == 200
    
    data = login_response.get_json()
    assert "access_token" in data
    assert data["message"] == "Login successful"