"""
EKA-AI Backend API Tests
Tests for Job Cards, Stats, Invoices, and Dashboard endpoints
"""
import pytest
import requests
import os
from datetime import datetime

# Get base URL from environment (with /api prefix already handled)
BASE_URL = os.environ.get('VITE_API_URL', 'https://eka-ai-chat.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

print(f"Testing API at: {API_URL}")


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check_status(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"Health check passed: {data}")


class TestJobCardsStats:
    """P2: Job Cards Stats endpoint tests"""
    
    def test_stats_endpoint_returns_200(self):
        """Test /api/job-cards/stats returns 200"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        assert response.status_code == 200, f"Stats endpoint failed: {response.text}"
        print(f"Stats endpoint status: {response.status_code}")
    
    def test_stats_has_correct_structure(self):
        """Test stats response has required fields"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        data = response.json()
        
        # Check required fields exist
        required_fields = ["total", "pending", "in_progress", "completed", "cancelled", "active", "by_status"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Stats structure validated: {list(data.keys())}")
    
    def test_stats_values_are_numeric(self):
        """Test stats values are integers"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        data = response.json()
        
        numeric_fields = ["total", "pending", "in_progress", "completed", "cancelled", "active"]
        for field in numeric_fields:
            assert isinstance(data[field], int), f"{field} should be int, got {type(data[field])}"
        
        print(f"Stats values: total={data['total']}, active={data['active']}, pending={data['pending']}")
    
    def test_stats_active_calculation(self):
        """Test active = pending + in_progress"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        data = response.json()
        
        # Active should be pending + in_progress
        expected_active = data["pending"] + data["in_progress"]
        assert data["active"] == expected_active, f"Active mismatch: {data['active']} != {expected_active}"
        print(f"Active calculation correct: {data['active']} = {data['pending']} + {data['in_progress']}")
    
    def test_stats_by_status_structure(self):
        """Test by_status has breakdown"""
        response = requests.get(f"{API_URL}/job-cards/stats")
        data = response.json()
        
        assert isinstance(data["by_status"], dict), "by_status should be dict"
        expected_statuses = ["CUSTOMER_APPROVAL", "PDI", "PDI_COMPLETED", "CREATED", "IN_PROGRESS", "COMPLETED"]
        
        for status in expected_statuses:
            assert status in data["by_status"], f"Missing by_status key: {status}"
        
        print(f"by_status breakdown: {data['by_status']}")


class TestJobCardsCRUD:
    """Job Cards CRUD operations tests"""
    
    def test_get_all_job_cards(self):
        """Test GET /api/job-cards returns list"""
        response = requests.get(f"{API_URL}/job-cards")
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        assert data["success"] == True
        # Should have either 'data' or 'job_cards' array
        assert "data" in data or "job_cards" in data
        
        job_cards = data.get("job_cards", data.get("data", []))
        print(f"Found {len(job_cards)} job cards")
    
    def test_job_cards_response_format(self):
        """Test job cards have correct fields"""
        response = requests.get(f"{API_URL}/job-cards")
        data = response.json()
        
        job_cards = data.get("job_cards", data.get("data", []))
        if len(job_cards) > 0:
            card = job_cards[0]
            expected_fields = ["id", "customer_name", "vehicle_registration", "status"]
            for field in expected_fields:
                assert field in card, f"Job card missing field: {field}"
            print(f"Job card fields validated: {list(card.keys())}")
    
    def test_create_job_card(self):
        """Test POST /api/job-cards creates new card"""
        payload = {
            "customer_name": "TEST_E2E_Customer",
            "vehicle_registration": "TEST123456",
            "status": "Pending",
            "vehicle_model": "Test Model",
            "estimated_cost": 1000.0
        }
        
        response = requests.post(f"{API_URL}/job-cards", json=payload)
        assert response.status_code == 201, f"Create failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        created = data["data"]
        assert created["customer_name"] == payload["customer_name"]
        assert "id" in created
        
        # Store for cleanup
        self.__class__.created_job_card_id = created["id"]
        print(f"Created job card: {created['id']}")
        return created["id"]
    
    def test_get_job_card_by_id(self):
        """Test GET /api/job-cards/{id} returns single card"""
        # First create a card
        payload = {
            "customer_name": "TEST_GetById_Customer",
            "vehicle_registration": "TESTGET001",
            "status": "Pending"
        }
        create_response = requests.post(f"{API_URL}/job-cards", json=payload)
        created_id = create_response.json()["data"]["id"]
        
        # Then fetch it
        response = requests.get(f"{API_URL}/job-cards/{created_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["data"]["id"] == created_id
        assert data["data"]["customer_name"] == payload["customer_name"]
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{created_id}")
        print(f"Get by ID test passed for: {created_id}")
    
    def test_update_job_card(self):
        """Test PUT /api/job-cards/{id} updates card"""
        # Create a card
        payload = {
            "customer_name": "TEST_Update_Customer",
            "vehicle_registration": "TESTUPD001",
            "status": "Pending"
        }
        create_response = requests.post(f"{API_URL}/job-cards", json=payload)
        created_id = create_response.json()["data"]["id"]
        
        # Update it
        update_payload = {
            "status": "In-Progress",
            "estimated_cost": 5000.0
        }
        response = requests.put(f"{API_URL}/job-cards/{created_id}", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["data"]["status"] == "In-Progress"
        assert data["data"]["estimated_cost"] == 5000.0
        
        # Verify with GET
        get_response = requests.get(f"{API_URL}/job-cards/{created_id}")
        assert get_response.json()["data"]["status"] == "In-Progress"
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{created_id}")
        print(f"Update test passed for: {created_id}")
    
    def test_delete_job_card(self):
        """Test DELETE /api/job-cards/{id} removes card"""
        # Create a card
        payload = {
            "customer_name": "TEST_Delete_Customer",
            "vehicle_registration": "TESTDEL001",
            "status": "Pending"
        }
        create_response = requests.post(f"{API_URL}/job-cards", json=payload)
        created_id = create_response.json()["data"]["id"]
        
        # Delete it
        response = requests.delete(f"{API_URL}/job-cards/{created_id}")
        assert response.status_code == 200
        
        # Verify deletion with GET - should return 404
        get_response = requests.get(f"{API_URL}/job-cards/{created_id}")
        assert get_response.status_code == 404
        
        print(f"Delete test passed for: {created_id}")
    
    def test_job_card_transition(self):
        """Test POST /api/job-cards/{id}/transition changes status"""
        # Create a card
        payload = {
            "customer_name": "TEST_Transition_Customer",
            "vehicle_registration": "TESTTRANS01",
            "status": "Pending"
        }
        create_response = requests.post(f"{API_URL}/job-cards", json=payload)
        created_id = create_response.json()["data"]["id"]
        
        # Transition to In-Progress
        transition_payload = {
            "new_status": "In-Progress",
            "notes": "Started work"
        }
        response = requests.post(f"{API_URL}/job-cards/{created_id}/transition", json=transition_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["data"]["status"] == "In-Progress"
        
        # Cleanup
        requests.delete(f"{API_URL}/job-cards/{created_id}")
        print(f"Transition test passed for: {created_id}")


class TestDashboardMetrics:
    """Dashboard metrics endpoint tests"""
    
    def test_dashboard_metrics_status(self):
        """Test GET /api/dashboard/metrics returns 200"""
        response = requests.get(f"{API_URL}/dashboard/metrics")
        assert response.status_code == 200, f"Dashboard metrics failed: {response.text}"
        print(f"Dashboard metrics status: {response.status_code}")
    
    def test_dashboard_metrics_structure(self):
        """Test dashboard metrics has required fields"""
        response = requests.get(f"{API_URL}/dashboard/metrics")
        data = response.json()
        
        assert "success" in data
        assert "metrics" in data
        
        metrics = data["metrics"]
        required_fields = ["total_job_cards", "pending_jobs", "completed_jobs", "in_progress"]
        for field in required_fields:
            assert field in metrics, f"Missing dashboard metric: {field}"
        
        print(f"Dashboard metrics: {metrics}")


class TestInvoicesAPI:
    """Invoices API endpoint tests"""
    
    def test_get_invoices(self):
        """Test GET /api/invoices returns list"""
        response = requests.get(f"{API_URL}/invoices")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        print(f"Invoices endpoint working: {len(data['data'])} invoices found")
    
    def test_create_invoice(self):
        """Test POST /api/invoices creates new invoice"""
        payload = {
            "job_card_id": "test-job-card-id",
            "customer_name": "TEST_Invoice_Customer",
            "amount": 5000.0,
            "cgst": 450.0,
            "sgst": 450.0,
            "igst": 0,
            "total_amount": 5900.0,
            "status": "Draft"
        }
        
        response = requests.post(f"{API_URL}/invoices", json=payload)
        assert response.status_code == 201, f"Create invoice failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "invoice_number" in data["data"]
        
        print(f"Created invoice: {data['data']['invoice_number']}")


class TestMGFleetAPI:
    """MG Fleet API endpoint tests"""
    
    def test_get_mg_contracts(self):
        """Test GET /api/mg/contracts returns list"""
        response = requests.get(f"{API_URL}/mg/contracts")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        print(f"MG contracts endpoint working: {len(data['data'])} contracts found")


# Cleanup test data after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after test session"""
    yield
    # Clean up test job cards
    response = requests.get(f"{API_URL}/job-cards")
    if response.status_code == 200:
        data = response.json()
        job_cards = data.get("job_cards", data.get("data", []))
        for card in job_cards:
            if card.get("customer_name", "").startswith("TEST_"):
                requests.delete(f"{API_URL}/job-cards/{card['id']}")
                print(f"Cleaned up test job card: {card['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
