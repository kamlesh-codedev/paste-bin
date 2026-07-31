def test_health(client):
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "ok"
    # Note: Because we use sqlite in memory for tests, 
    # it should still return connected!
    assert data["database"] == "connected"