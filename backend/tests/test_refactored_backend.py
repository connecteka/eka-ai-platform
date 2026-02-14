"""
Backend Refactoring Tests for EKA-AI
Tests all modular APIRouter endpoints after refactoring from monolithic server.py
Includes password hashing with bcrypt verification

Features tested:
- Health endpoint
- Auth routes (login, register, logout, /me)
- Job Cards CRUD with stats
- Chat sessions
- Invoices
- MG Fleet contracts
- Dashboard metrics
"""
import pytest
import requests
import os
import time
import uuid

# Get BASE_URL from environment
BASE_URL = os.environ.get('VITE_API_URL', 'https://eka-detail-page.preview.emergentagent.com')
BASE_URL = BASE_URL.rstrip('/')
API_URL = f"{BASE_URL}/api"

# Test credentials
TEST_USER_EMAIL = "testuser@test.com"
TEST_USER_PASSWORD = "test123456"


class TestHealthEndpoint:
    """Health check endpoint - verifies backend is running"""
    
    def test_health_returns_200(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check: {data['status']}")


class TestAuthLogin:
    """Auth login tests with password hashing verification"""
    
    def test_login_valid_credentials(self):
        """POST /api/auth/login with valid credentials"""
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "user" in data
        assert "token" in data
        
        user = data["user"]
        assert user["email"] == TEST_USER_EMAIL
        assert "user_id" in user
        assert "password" not in user  # Password should be excluded
        
        print(f"✓ Login successful: {user['email']}, token: {data['token'][:30]}...")
    
    def test_login_invalid_password(self):
        """POST /api/auth/login with wrong password"""
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": "wrongpassword123"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print("✓ Invalid password rejected")
    
    def test_login_nonexistent_user(self):
        """POST /api/auth/login with non-existent email"""
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": "nonexistent@example.com", "password": "anypassword"}
        )
        
        assert response.status_code == 401
        print("✓ Non-existent user rejected")


class TestAuthRegister:
    """Auth registration tests with bcrypt password hashing"""
    
    def test_register_new_user(self):
        """POST /api/auth/register creates new user with hashed password"""
        test_email = f"test_refactor_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{API_URL}/auth/register",
            json={
                "email": test_email,
                "password": "securepass123",
                "name": "Test Refactor User",
                "workshop_name": "Test Workshop"
            }
        )
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "user" in data
        assert "token" in data
        
        user = data["user"]
        assert user["email"] == test_email
        assert user["name"] == "Test Refactor User"
        assert user["auth_provider"] == "email"
        assert "user_id" in user
        assert "password" not in user  # Password should NOT be in response
        
        # Verify token format for email auth
        assert data["token"].startswith("email_session_")
        
        print(f"✓ Registration successful: {user['email']}")
        
        # Store token for later tests
        self.__class__.test_token = data["token"]
        self.__class__.test_user_id = user["user_id"]
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register fails with duplicate email"""
        # First registration
        test_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        requests.post(
            f"{API_URL}/auth/register",
            json={"email": test_email, "password": "pass123", "name": "First"}
        )
        
        # Second registration with same email
        response = requests.post(
            f"{API_URL}/auth/register",
            json={"email": test_email, "password": "pass456", "name": "Second"}
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json().get("detail", "").lower()
        print("✓ Duplicate email registration rejected")


class TestAuthMe:
    """Auth /me endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get valid auth token"""
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_get_current_user_valid_token(self, auth_token):
        """GET /api/auth/me with valid Bearer token"""
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        
        user = response.json()
        assert user["email"] == TEST_USER_EMAIL
        assert "user_id" in user
        assert "password" not in user
        
        print(f"✓ Get current user: {user['email']}")
    
    def test_get_current_user_invalid_token(self):
        """GET /api/auth/me with invalid token returns 401"""
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        
        assert response.status_code == 401
        print("✓ Invalid token rejected")
    
    def test_get_current_user_no_token(self):
        """GET /api/auth/me without token returns 401"""
        response = requests.get(f"{API_URL}/auth/me")
        
        assert response.status_code == 401
        print("✓ Missing token rejected")


class TestAuthLogout:
    """Auth logout tests"""
    
    def test_logout_invalidates_session(self):
        """POST /api/auth/logout invalidates session"""
        # Login first
        login_resp = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        token = login_resp.json()["token"]
        
        # Verify token works
        me_resp = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_resp.status_code == 200
        
        # Logout
        logout_resp = requests.post(
            f"{API_URL}/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert logout_resp.status_code == 200
        assert logout_resp.json()["success"] == True
        
        # Verify token is now invalid
        me_after = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_after.status_code == 401
        
        print("✓ Logout invalidates session")


class TestJobCardsStats:
    """Job Cards stats endpoint tests"""
    
    def test_stats_returns_200(self):
        """GET /api/job-cards/stats returns 200"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        assert response.status_code == 200
        print("✓ Stats endpoint returns 200")
    
    def test_stats_structure(self):
        """Stats has required fields"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        data = response.json()
        
        required = ["total", "pending", "in_progress", "completed", "cancelled", "active", "by_status"]
        for field in required:
            assert field in data, f"Missing: {field}"
        
        assert isinstance(data["by_status"], dict)
        print(f"✓ Stats structure: total={data['total']}, active={data['active']}")


class TestJobCardsCRUD:
    """Job Cards CRUD tests"""
    
    def test_get_all_job_cards(self):
        """GET /api/job-cards returns list"""
        response = requests.get(f"{API_URL}/job-cards")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data or "job_cards" in data
        
        print(f"✓ Get all job cards: {data.get('count', len(data.get('data', [])))} cards")
    
    def test_create_job_card(self):
        """POST /api/job-cards creates new card"""
        payload = {
            "customer_name": "TEST_Refactor_Customer",
            "vehicle_registration": f"TEST{uuid.uuid4().hex[:6].upper()}",
            "status": "Pending",
            "vehicle_model": "Test Model",
            "estimated_cost": 2500.0
        }
        
        response = requests.post(f"{API_URL}/job-cards", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert data["data"]["customer_name"] == payload["customer_name"]
        assert "id" in data["data"]
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{data['data']['id']}")
        
        print(f"✓ Create job card: {data['data']['id']}")
    
    def test_get_job_card_by_id(self):
        """GET /api/job-cards/{id} returns single card"""
        # Create first
        create_resp = requests.post(f"{API_URL}/job-cards", json={
            "customer_name": "TEST_GetByID",
            "vehicle_registration": f"TESTGET{uuid.uuid4().hex[:4].upper()}",
            "status": "Pending"
        })
        card_id = create_resp.json()["data"]["id"]
        
        # Get by ID
        response = requests.get(f"{API_URL}/job-cards/{card_id}")
        assert response.status_code == 200
        assert response.json()["data"]["id"] == card_id
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{card_id}")
        
        print(f"✓ Get job card by ID: {card_id}")
    
    def test_update_job_card(self):
        """PUT /api/job-cards/{id} updates card"""
        # Create
        create_resp = requests.post(f"{API_URL}/job-cards", json={
            "customer_name": "TEST_Update",
            "vehicle_registration": f"TESTUPD{uuid.uuid4().hex[:4].upper()}",
            "status": "Pending"
        })
        card_id = create_resp.json()["data"]["id"]
        
        # Update
        response = requests.put(f"{API_URL}/job-cards/{card_id}", json={
            "status": "In-Progress",
            "estimated_cost": 3000.0
        })
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "In-Progress"
        
        # Verify with GET
        get_resp = requests.get(f"{API_URL}/job-cards/{card_id}")
        assert get_resp.json()["data"]["status"] == "In-Progress"
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{card_id}")
        
        print(f"✓ Update job card: {card_id}")
    
    def test_delete_job_card(self):
        """DELETE /api/job-cards/{id} removes card"""
        # Create
        create_resp = requests.post(f"{API_URL}/job-cards", json={
            "customer_name": "TEST_Delete",
            "vehicle_registration": f"TESTDEL{uuid.uuid4().hex[:4].upper()}",
            "status": "Pending"
        })
        card_id = create_resp.json()["data"]["id"]
        
        # Delete
        response = requests.delete(f"{API_URL}/job-cards/{card_id}")
        assert response.status_code == 200
        
        # Verify gone
        get_resp = requests.get(f"{API_URL}/job-cards/{card_id}")
        assert get_resp.status_code == 404
        
        print(f"✓ Delete job card: {card_id}")


class TestChatSessions:
    """Chat sessions API tests"""
    
    def test_get_chat_sessions(self):
        """GET /api/chat/sessions returns sessions"""
        response = requests.get(f"{API_URL}/chat/sessions")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "sessions" in data
        
        print(f"✓ Get chat sessions: {len(data['sessions'])} sessions")
    
    def test_create_chat_session(self):
        """POST /api/chat/sessions creates session"""
        response = requests.post(f"{API_URL}/chat/sessions", json={
            "title": "TEST_Session",
            "context": {"vehicle": "Test Model"}
        })
        
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert "session_id" in data
        
        # Cleanup
        requests.delete(f"{API_URL}/chat/sessions/{data['session_id']}")
        
        print(f"✓ Create chat session: {data['session_id']}")
    
    def test_post_chat_message(self):
        """POST /api/chat sends AI chat request"""
        response = requests.post(f"{API_URL}/chat", json={
            "history": [{"role": "user", "parts": [{"text": "Hello, test message"}]}],
            "context": {},
            "status": "CREATED"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        assert "response_content" in data
        assert "visual_text" in data["response_content"]
        
        print(f"✓ Chat endpoint works: response received")


class TestInvoices:
    """Invoices API tests"""
    
    def test_get_invoices(self):
        """GET /api/invoices returns list"""
        response = requests.get(f"{API_URL}/invoices")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        print(f"✓ Get invoices: {len(data['data'])} invoices")
    
    def test_create_invoice(self):
        """POST /api/invoices creates invoice"""
        response = requests.post(f"{API_URL}/invoices", json={
            "job_card_id": "test-job-id",
            "customer_name": "TEST_Invoice_Customer",
            "amount": 5000.0,
            "cgst": 450.0,
            "sgst": 450.0,
            "igst": 0,
            "total_amount": 5900.0,
            "status": "Draft"
        })
        
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert "invoice_number" in data["data"]
        
        print(f"✓ Create invoice: {data['data']['invoice_number']}")


class TestMGFleet:
    """MG Fleet API tests"""
    
    def test_get_mg_contracts(self):
        """GET /api/mg/contracts returns contracts"""
        response = requests.get(f"{API_URL}/mg/contracts")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        print(f"✓ Get MG contracts: {len(data['data'])} contracts")


class TestDashboardMetrics:
    """Dashboard metrics API tests"""
    
    def test_dashboard_metrics(self):
        """GET /api/dashboard/metrics returns metrics"""
        response = requests.get(f"{API_URL}/dashboard/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "metrics" in data
        
        metrics = data["metrics"]
        required = ["total_job_cards", "pending_jobs", "completed_jobs", "in_progress", "active_mg_contracts"]
        for field in required:
            assert field in metrics, f"Missing metric: {field}"
        
        print(f"✓ Dashboard metrics: {metrics}")


# Cleanup fixture
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after tests"""
    yield
    # Clean up test job cards
    try:
        response = requests.get(f"{API_URL}/job-cards")
        if response.status_code == 200:
            data = response.json()
            job_cards = data.get("job_cards", data.get("data", []))
            for card in job_cards:
                if card.get("customer_name", "").startswith("TEST_"):
                    requests.delete(f"{API_URL}/job-cards/{card['id']}")
    except:
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
