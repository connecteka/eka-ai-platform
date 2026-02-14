"""
Auth Flow Tests for EKA-AI Platform
Tests email registration, login, session management, and logout functionality
"""
import pytest
import requests
import os
import time

# Get BASE_URL from environment - NO defaults
BASE_URL = os.environ.get('VITE_API_URL', os.environ.get('REACT_APP_BACKEND_URL'))
if not BASE_URL:
    BASE_URL = "https://eka-detail-page.preview.emergentagent.com"

BASE_URL = BASE_URL.rstrip('/')


class TestHealthAndSetup:
    """Verify backend is running before auth tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health check passed: {data}")


class TestEmailRegistration:
    """Test user registration with email/password"""
    
    def test_register_new_user(self):
        """Test creating a new user with email/password"""
        test_email = f"test_reg_{int(time.time())}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": "testpass123",
                "name": "Test Registration User"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data.get("success") == True
        assert "user" in data
        assert "token" in data
        
        # Verify user data
        user = data["user"]
        assert user["email"] == test_email
        assert user["name"] == "Test Registration User"
        assert "user_id" in user
        assert user["auth_provider"] == "email"
        
        # Verify token is valid format
        assert data["token"].startswith("email_session_")
        print(f"✓ Registration successful: {user['email']}")
    
    def test_register_duplicate_email(self):
        """Test registration fails with existing email"""
        # First register
        test_email = f"test_dup_{int(time.time())}@example.com"
        
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": "testpass123",
                "name": "First User"
            }
        )
        
        # Try to register again with same email
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": "differentpass",
                "name": "Second User"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data.get("detail", "").lower()
        print(f"✓ Duplicate email rejected correctly")


class TestEmailLogin:
    """Test user login with email/password"""
    
    @pytest.fixture(autouse=True)
    def setup_test_user(self):
        """Create a test user for login tests"""
        self.test_email = "test@example.com"
        self.test_password = "test123"
        yield
    
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "user" in data
        assert "token" in data
        
        user = data["user"]
        assert user["email"] == self.test_email
        assert "user_id" in user
        print(f"✓ Login successful: {user['email']}")
    
    def test_login_invalid_password(self):
        """Test login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print(f"✓ Invalid password rejected correctly")
    
    def test_login_nonexistent_user(self):
        """Test login fails with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
        )
        
        assert response.status_code == 401
        print(f"✓ Non-existent user rejected correctly")


class TestSessionManagement:
    """Test session validation and /api/auth/me endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get a valid auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            }
        )
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_get_current_user_valid_token(self, auth_token):
        """Test /api/auth/me with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        user = response.json()
        
        assert "user_id" in user
        assert "email" in user
        assert user["email"] == "test@example.com"
        print(f"✓ Get current user successful: {user['email']}")
    
    def test_get_current_user_invalid_token(self):
        """Test /api/auth/me with invalid token returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print(f"✓ Invalid token rejected correctly")
    
    def test_get_current_user_no_token(self):
        """Test /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401
        print(f"✓ No token request rejected correctly")


class TestLogout:
    """Test logout functionality"""
    
    def test_logout_clears_session(self):
        """Test logout invalidates the session"""
        # First login to get a token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Verify token works
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        
        # Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert logout_response.status_code == 200
        assert logout_response.json().get("success") == True
        
        # Verify token is now invalid
        me_after_logout = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_after_logout.status_code == 401
        print(f"✓ Logout correctly invalidated session")


class TestGoogleOAuthSession:
    """Test Google OAuth session endpoint (simulated - external auth)"""
    
    def test_google_session_invalid_session_id(self):
        """Test /api/auth/google/session with invalid session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/google/session",
            json={"session_id": "invalid_session_id_12345"}
        )
        
        # Should return 401 or 500 for invalid session
        assert response.status_code in [401, 500]
        print(f"✓ Invalid Google session_id rejected correctly: {response.status_code}")


# Clean up function
def cleanup_test_users():
    """Clean up test users created during testing"""
    # This would typically be done via direct MongoDB access
    # or a cleanup endpoint
    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
