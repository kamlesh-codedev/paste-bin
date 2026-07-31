def test_paste_crud_workflow(client):
    """Test the complete CRUD workflow for pastes in one run."""
    
    # 1. Register and Login to get a token
    client.post("/api/auth/register", json={
        "username": "crud_user",
        "email": "crud@example.com",
        "password": "password123"
    })
    
    login_response = client.post("/api/auth/login", json={
        "identifier": "crud_user",
        "password": "password123"
    })
    token = login_response.get_json()["access_token"]
    
    # We must pass this header to any route protected by @jwt_required()
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a Paste
    create_resp = client.post("/api/pastes", json={
        "title": "My First Test Paste",
        "content": "print('Hello, PasteVault!')",
        "language": "python",
        "visibility": "private"
    }, headers=headers)
    
    assert create_resp.status_code == 201
    paste_data = create_resp.get_json()["paste"]
    public_id = paste_data["public_id"]
    assert paste_data["title"] == "My First Test Paste"

    # 3. List Pastes
    list_resp = client.get("/api/pastes", headers=headers)
    assert list_resp.status_code == 200
    pastes = list_resp.get_json()["pastes"]
    assert len(pastes) > 0
    # Make sure the paste we just created is in the list
    assert any(p["public_id"] == public_id for p in pastes)

    # 4. Retrieve the Paste
    get_resp = client.get(f"/api/pastes/{public_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.get_json()["paste"]["content"] == "print('Hello, PasteVault!')"

    # 5. Update the Paste
    update_resp = client.put(f"/api/pastes/{public_id}", json={
        "title": "Updated Test Paste",
        "content": "print('Updated!')",
        "visibility": "public"
    }, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.get_json()["paste"]["title"] == "Updated Test Paste"

    # 6. Delete the Paste
    delete_resp = client.delete(f"/api/pastes/{public_id}", headers=headers)
    assert delete_resp.status_code == 200

    # 7. Verify Deletion (Should return 404 Not Found)
    get_deleted_resp = client.get(f"/api/pastes/{public_id}", headers=headers)
    assert get_deleted_resp.status_code == 404