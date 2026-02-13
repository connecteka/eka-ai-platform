"""
Test suite for WhatsApp Notifications (MOCKED) and Voice Transcription features.
Tests notification send, job card updates, notification history, and voice service status.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("VITE_API_URL", "https://garage-job-portal.preview.emergentagent.com")


class TestNotificationStatus:
    """Test GET /api/notifications/status - returns mocked provider status"""
    
    def test_notification_status_returns_mocked(self):
        response = requests.get(f"{BASE_URL}/api/notifications/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "enabled" in data
        assert data["provider"] == "mocked"  # MOCKED notifications
        assert "twilio_configured" in data
        assert data["message"] is not None
        print(f"✓ Notification status: provider={data['provider']}, enabled={data['enabled']}")


class TestNotificationSend:
    """Test POST /api/notifications/send - sends mocked notification"""
    
    def test_send_notification_mocked(self):
        payload = {
            "phone_number": "+919999999999",
            "message": "Test notification from pytest",
            "notification_type": "job_created"
        }
        response = requests.post(f"{BASE_URL}/api/notifications/send", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["mocked"] is True  # Must be mocked
        assert data["status"] == "mocked_delivered"
        assert "message_id" in data
        print(f"✓ Send notification: success={data['success']}, mocked={data['mocked']}")
    
    def test_send_notification_all_types(self):
        """Test all notification types"""
        notification_types = [
            "job_created",
            "status_update", 
            "approval_required",
            "pdi_complete",
            "ready_for_pickup",
            "invoice_generated"
        ]
        
        for ntype in notification_types:
            payload = {
                "phone_number": "+919999999999",
                "message": f"Test {ntype} notification",
                "notification_type": ntype
            }
            response = requests.post(f"{BASE_URL}/api/notifications/send", json=payload)
            assert response.status_code == 200
            assert response.json()["success"] is True
        
        print(f"✓ All {len(notification_types)} notification types work")


class TestNotificationTest:
    """Test POST /api/notifications/test - sends mocked test notification"""
    
    def test_send_test_notification(self):
        response = requests.post(
            f"{BASE_URL}/api/notifications/test",
            params={"phone_number": "+919999999999"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["mocked"] is True
        assert data["message"] == "Test notification sent"
        print(f"✓ Test notification sent successfully, mocked={data['mocked']}")


class TestNotificationJobCardUpdate:
    """Test POST /api/notifications/job-card-update/{id} - triggers notification on job card update"""
    
    @pytest.fixture
    def job_card_with_phone(self):
        """Create a job card with phone number for testing"""
        payload = {
            "customer_name": "TEST_NotificationJobCard",
            "vehicle_registration": "TEST_REG_001",
            "phone": "+919876543210",
            "status": "CREATED",
            "vehicle_model": "Test Vehicle"
        }
        response = requests.post(f"{BASE_URL}/api/job-cards", json=payload)
        assert response.status_code == 201
        job_card = response.json()["data"]
        yield job_card
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/job-cards/{job_card['id']}")
    
    def test_job_card_update_notification_with_phone(self, job_card_with_phone):
        job_card_id = job_card_with_phone["id"]
        
        response = requests.post(f"{BASE_URL}/api/notifications/job-card-update/{job_card_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["notification_sent"] is True
        assert data["mocked"] is True
        assert "TEST_REG_001" in data["message"]  # Vehicle reg in message
        print(f"✓ Job card notification sent for status={data['status']}")
    
    def test_job_card_update_notification_without_phone(self):
        """Test with a job card without phone - should return success=false"""
        # Create job card without phone
        payload = {
            "customer_name": "TEST_NoPhoneJobCard",
            "vehicle_registration": "TEST_REG_002",
            "status": "CREATED"
        }
        create_resp = requests.post(f"{BASE_URL}/api/job-cards", json=payload)
        assert create_resp.status_code == 201
        job_card_id = create_resp.json()["data"]["id"]
        
        try:
            response = requests.post(f"{BASE_URL}/api/notifications/job-card-update/{job_card_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["success"] is False
            assert data["notification_sent"] is False
            assert "No phone number" in data["message"]
            print("✓ No phone number case handled correctly")
        finally:
            requests.delete(f"{BASE_URL}/api/job-cards/{job_card_id}")
    
    def test_job_card_update_notification_invalid_id(self):
        """Test with invalid job card ID"""
        response = requests.post(f"{BASE_URL}/api/notifications/job-card-update/invalidid123")
        assert response.status_code == 400
        print("✓ Invalid job card ID returns 400")


class TestJobCardTransitionWithNotification:
    """Test POST /api/job-cards/{id}/transition triggers notification (background task)"""
    
    @pytest.fixture
    def job_card_for_transition(self):
        payload = {
            "customer_name": "TEST_TransitionJobCard",
            "vehicle_registration": "TEST_TRANS_001",
            "phone": "+919876543210",
            "status": "CREATED"
        }
        response = requests.post(f"{BASE_URL}/api/job-cards", json=payload)
        assert response.status_code == 201
        job_card = response.json()["data"]
        yield job_card
        requests.delete(f"{BASE_URL}/api/job-cards/{job_card['id']}")
    
    def test_transition_triggers_notification(self, job_card_for_transition):
        job_card_id = job_card_for_transition["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{job_card_id}/transition",
            json={"new_status": "DIAGNOSED"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["notification_queued"] is True
        assert data["data"]["status"] == "DIAGNOSED"
        print(f"✓ Transition to DIAGNOSED queued notification")
    
    def test_transition_can_skip_notification(self, job_card_for_transition):
        job_card_id = job_card_for_transition["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/job-cards/{job_card_id}/transition?send_notification=false",
            json={"new_status": "ESTIMATED"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["notification_queued"] is False
        print("✓ Transition can skip notification with send_notification=false")


class TestNotificationHistory:
    """Test GET /api/notifications/history - returns notification logs"""
    
    def test_get_notification_history(self):
        response = requests.get(f"{BASE_URL}/api/notifications/history")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "notifications" in data
        assert isinstance(data["notifications"], list)
        assert "count" in data
        print(f"✓ Notification history: {data['count']} records")
    
    def test_notification_history_with_limit(self):
        response = requests.get(f"{BASE_URL}/api/notifications/history?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["notifications"]) <= 5
        print(f"✓ History limit works: returned {len(data['notifications'])} records")
    
    def test_notification_history_filter_by_phone(self):
        response = requests.get(
            f"{BASE_URL}/api/notifications/history",
            params={"phone_number": "+919876543210"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # All returned notifications should have this phone
        for notif in data["notifications"]:
            if notif.get("phone_number"):
                # Phone may have spaces or different formats
                assert "9876543210" in notif["phone_number"].replace(" ", "")
        print("✓ History filter by phone works")


class TestVoiceStatus:
    """Test GET /api/voice/status - returns voice service enabled with whisper-1"""
    
    def test_voice_status_enabled(self):
        response = requests.get(f"{BASE_URL}/api/voice/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["enabled"] is True  # EMERGENT_LLM_KEY is configured
        assert data["model"] == "whisper-1"
        assert data["provider"] == "openai"
        assert data["max_file_size_mb"] == 25
        assert "webm" in data["supported_formats"]
        assert data["message"] == "Voice transcription is ready"
        print(f"✓ Voice service enabled: model={data['model']}, provider={data['provider']}")


class TestVoiceSupportedLanguages:
    """Test GET /api/voice/supported-languages - returns language list"""
    
    def test_supported_languages(self):
        response = requests.get(f"{BASE_URL}/api/voice/supported-languages")
        assert response.status_code == 200
        
        data = response.json()
        assert "languages" in data
        languages = data["languages"]
        assert len(languages) >= 10  # Should have many languages
        
        # Check for English
        english = next((l for l in languages if l["code"] == "en"), None)
        assert english is not None
        assert english["name"] == "English"
        
        # Check for Hindi (important for Indian market)
        hindi = next((l for l in languages if l["code"] == "hi"), None)
        assert hindi is not None
        assert hindi["name"] == "Hindi"
        
        print(f"✓ Supported languages: {len(languages)} languages available")


class TestLoginStillWorks:
    """Verify login functionality still works after new features"""
    
    def test_login_with_valid_credentials(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testuser@test.com", "password": "test123456"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["user"]["email"] == "testuser@test.com"
        print("✓ Login still works with test credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
