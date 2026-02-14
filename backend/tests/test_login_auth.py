"""
Backend API Tests for Login Page and Authentication
Tests the email/password login flow and authentication endpoints

Features tested:
- POST /api/auth/login - Login with email/password
- POST /api/auth/register - Register new user
- GET /api/auth/me - Get current user
- POST /api/auth/logout - Logout user
- GET /api/health - Health check endpoint
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://chat-first-app.preview.emergentagent.com')
if BASE_URL.endswith('/'):
    BASE_URL = BASE_URL.rstrip('/')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"PASSED: Health endpoint returns status=healthy")


class TestAuthLogin:
    """Authentication login tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with valid email and password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "testuser@test.com",
                "password": "test123456"
            },
            headers={"Content-Type": "application/json"}
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "success" in data
        assert data["success"] == True
        assert "user" in data
        assert "token" in data
        
        # Verify user data structure
        user = data["user"]
        assert user["email"] == "testuser@test.com"
        assert "user_id" in user
        assert "auth_provider" in user
        
        # Verify token is a valid string
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 10
        
        print(f"PASSED: Login successful for testuser@test.com, token length={len(data['token'])}")
        return data["token"]
    
    def test_login_with_invalid_password(self):
        """Test login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "testuser@test.com",
                "password": "wrongpassword"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"PASSED: Invalid password returns 401 with message: {data['detail']}")
    
    def test_login_with_nonexistent_user(self):
        """Test login with non-existent email returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "anypassword"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"PASSED: Non-existent user returns 401")
    
    def test_login_with_missing_email(self):
        """Test login with missing email field returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"password": "test123456"},
            headers={"Content-Type": "application/json"}
        )
        
        # FastAPI returns 422 for validation errors
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print(f"PASSED: Missing email returns 422 validation error")
    
    def test_login_with_missing_password(self):
        """Test login with missing password field returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testuser@test.com"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print(f"PASSED: Missing password returns 422 validation error")


class TestAuthMe:
    """Test getting current user info"""
    
    def test_get_me_with_valid_token(self):
        """Test /api/auth/me with valid token returns user data"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "testuser@test.com",
                "password": "test123456"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Use token to get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["email"] == "testuser@test.com"
        assert "user_id" in data
        print(f"PASSED: /api/auth/me returns user data with token")
    
    def test_get_me_without_token(self):
        """Test /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"PASSED: /api/auth/me without token returns 401")
    
    def test_get_me_with_invalid_token(self):
        """Test /api/auth/me with invalid token returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_123"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"PASSED: /api/auth/me with invalid token returns 401")


class TestAuthRegister:
    """Test user registration"""
    
    def test_register_new_user(self):
        """Test registering a new user"""
        unique_email = f"TEST_newuser_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "password": "testpassword123",
                "name": "Test New User"
            },
            headers={"Content-Type": "application/json"}
        )
        
        # Could be 200 or 201 depending on implementation
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert data["user"]["email"] == unique_email
        assert "token" in data
        print(f"PASSED: New user registered successfully: {unique_email}")
    
    def test_register_duplicate_email(self):
        """Test registering with existing email returns error"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "testuser@test.com",  # Already exists
                "password": "testpassword123",
                "name": "Duplicate User"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"PASSED: Duplicate email registration returns 400")


class TestAuthLogout:
    """Test logout functionality"""
    
    def test_logout_with_token(self):
        """Test logout clears session"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "testuser@test.com",
                "password": "test123456"
            }
        )
        token = login_response.json()["token"]
        
        # Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert logout_response.status_code == 200, f"Expected 200, got {logout_response.status_code}"
        data = logout_response.json()
        assert data["success"] == True
        print(f"PASSED: Logout successful")
    
    def test_token_invalid_after_logout(self):
        """Test that token is invalid after logout"""
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "testuser@test.com",
                "password": "test123456"
            }
        )
        token = login_response.json()["token"]
        
        # Verify token works
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        
        # Logout
        requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Verify token no longer works
        me_response_after = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response_after.status_code == 401, f"Expected 401 after logout, got {me_response_after.status_code}"
        print(f"PASSED: Token is invalid after logout")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
