"""
Job Card Detail Page API Tests
Tests for GET /api/job-cards/{id}/detail, /api/job-cards/{id}/insights, 
POST /api/job-cards/{id}/notes, POST /api/job-cards/{id}/signature
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://garage-job-portal.preview.emergentagent.com')
TEST_JOB_CARD_ID = "698f9f0ac18c7ff6345f7a7e"

class TestJobCardDetailAPI:
    """Test job card detail endpoint"""
    
    def test_get_job_card_detail_success(self):
        """GET /api/job-cards/{id}/detail - should return job card details"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/detail")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        # Validate structure
        detail = data["data"]
        assert "id" in detail
        assert "job_card_number" in detail
        assert "status" in detail
        assert "vehicle" in detail
        assert "customer" in detail
        assert "services" in detail
        assert "parts" in detail
        assert "payment" in detail
        assert "timeline" in detail
        assert "notes" in detail
        
        print(f"✓ Job card detail returned for {detail['job_card_number']}")
    
    def test_get_job_card_detail_vehicle_info(self):
        """Verify vehicle information structure"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/detail")
        
        assert response.status_code == 200
        vehicle = response.json()["data"]["vehicle"]
        
        # Validate vehicle fields
        assert "registration_number" in vehicle
        assert "make" in vehicle
        assert "model" in vehicle
        assert "year" in vehicle
        assert "fuel_type" in vehicle
        assert "odometer_reading" in vehicle
        
        print(f"✓ Vehicle: {vehicle['registration_number']} - {vehicle['make']} {vehicle['model']}")
    
    def test_get_job_card_detail_customer_info(self):
        """Verify customer information structure"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/detail")
        
        assert response.status_code == 200
        customer = response.json()["data"]["customer"]
        
        # Validate customer fields
        assert "name" in customer
        assert "total_visits" in customer
        assert "lifetime_value" in customer
        assert "rating" in customer
        
        print(f"✓ Customer: {customer['name']} - {customer['total_visits']} visits")
    
    def test_get_job_card_detail_payment_structure(self):
        """Verify payment breakdown structure"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/detail")
        
        assert response.status_code == 200
        payment = response.json()["data"]["payment"]
        
        # Validate payment fields (GST structure for India)
        assert "subtotal" in payment
        assert "cgst" in payment  # Central GST
        assert "sgst" in payment  # State GST
        assert "grand_total" in payment
        assert "amount_paid" in payment
        assert "balance_due" in payment
        assert "payment_status" in payment
        
        print(f"✓ Payment: ₹{payment['grand_total']} total, ₹{payment['amount_paid']} paid")
    
    def test_get_job_card_detail_invalid_id(self):
        """GET /api/job-cards/{invalid_id}/detail - should return 400 or 404"""
        response = requests.get(f"{BASE_URL}/api/job-cards/invalid_id/detail")
        
        assert response.status_code in [400, 404]
        print("✓ Invalid ID handled correctly")
    
    def test_get_job_card_detail_not_found(self):
        """GET /api/job-cards/{non_existent_id}/detail - should return 404"""
        response = requests.get(f"{BASE_URL}/api/job-cards/000000000000000000000000/detail")
        
        assert response.status_code == 404
        print("✓ Non-existent job card returns 404")


class TestJobCardInsightsAPI:
    """Test EKA-AI insights endpoint"""
    
    def test_get_insights_success(self):
        """GET /api/job-cards/{id}/insights - should return AI insights"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/insights")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        insights_data = data["data"]
        assert "insights" in insights_data
        assert "health_score" in insights_data
        assert "generated_at" in insights_data
        
        print(f"✓ Insights returned with {len(insights_data['insights'])} items")
    
    def test_insights_structure(self):
        """Verify insight item structure"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/insights")
        
        assert response.status_code == 200
        insights = response.json()["data"]["insights"]
        
        assert len(insights) > 0
        for insight in insights:
            assert "type" in insight
            assert "title" in insight
            assert "body" in insight
            assert "action" in insight
            assert insight["type"] in ["predictive", "alert", "savings"]
        
        print(f"✓ All {len(insights)} insights have valid structure")
    
    def test_health_score_structure(self):
        """Verify health score structure"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/insights")
        
        assert response.status_code == 200
        health = response.json()["data"]["health_score"]
        
        # Validate all health score categories
        assert "overall" in health
        assert "engine" in health
        assert "brakes" in health
        assert "tyres" in health
        assert "ac" in health
        assert "electrical" in health
        assert "body" in health
        
        # Scores should be 0-100
        for key, value in health.items():
            assert 0 <= value <= 100, f"{key} score should be 0-100, got {value}"
        
        print(f"✓ Health score: {health['overall']}% overall")


class TestJobCardNotesAPI:
    """Test internal notes endpoint"""
    
    def test_add_note_success(self):
        """POST /api/job-cards/{id}/notes - should add internal note"""
        note_data = {
            "text": "TEST_Note: Backend API verification test",
            "author": "Test Agent",
            "attachments": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/notes",
            json=note_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        note = data["data"]
        assert note["text"] == note_data["text"]
        assert note["author"] == note_data["author"]
        assert "id" in note
        assert "timestamp" in note
        
        print(f"✓ Note added with ID: {note['id']}")
    
    def test_add_note_empty_text(self):
        """POST with empty text should still work (may want to validate in future)"""
        note_data = {
            "text": "",
            "author": "Test Agent",
            "attachments": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/notes",
            json=note_data
        )
        
        # Should either succeed or return validation error
        assert response.status_code in [200, 400, 422]
        print(f"✓ Empty note handling: {response.status_code}")
    
    def test_get_notes(self):
        """GET /api/job-cards/{id}/notes - should return all notes"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/notes")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
        
        print(f"✓ Retrieved {len(data['data'])} notes")


class TestJobCardSignatureAPI:
    """Test signature endpoint"""
    
    def test_save_signature_success(self):
        """POST /api/job-cards/{id}/signature - should save signature"""
        signature_data = {
            "job_card_id": TEST_JOB_CARD_ID,  # Required in body
            "signature_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "customer_name": "Test Customer",
            "verified_via": "manual",
            "otp_verified": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/signature",
            json=signature_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["message"] == "Signature saved successfully"
        
        print("✓ Signature saved successfully")
    
    def test_save_signature_without_job_card_id_in_body(self):
        """Signature requires job_card_id in body (potential API issue)"""
        signature_data = {
            "signature_image": "data:image/png;base64,test",
            "customer_name": "Test Customer",
            "verified_via": "manual",
            "otp_verified": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/signature",
            json=signature_data
        )
        
        # Note: This returns 422 because job_card_id is required in body
        # even though it's in the URL path - this is a minor API design issue
        assert response.status_code == 422
        print("✓ Missing job_card_id in body returns 422 (as expected, but could be improved)")
    
    def test_save_signature_otp_verified(self):
        """POST /api/job-cards/{id}/signature with OTP verification"""
        signature_data = {
            "job_card_id": TEST_JOB_CARD_ID,
            "signature_image": "data:image/png;base64,iVBORw0KGgo=",
            "customer_name": "Amit Sharma",
            "verified_via": "otp",
            "otp_verified": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/signature",
            json=signature_data
        )
        
        assert response.status_code == 200
        assert response.json()["success"] == True
        
        print("✓ OTP-verified signature saved")


class TestJobCardTimelineAPI:
    """Test timeline endpoint"""
    
    def test_get_timeline(self):
        """GET /api/job-cards/{id}/timeline - should return activity timeline"""
        response = requests.get(f"{BASE_URL}/api/job-cards/{TEST_JOB_CARD_ID}/timeline")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
        
        print(f"✓ Retrieved {len(data['data'])} timeline entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
