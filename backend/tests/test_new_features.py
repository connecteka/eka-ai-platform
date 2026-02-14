"""
EKA-AI New Features Tests
Tests for Chat Sessions, PDF Generation, and File Upload endpoints
"""
import pytest
import requests
import os
import io
from datetime import datetime

# Get base URL from environment
BASE_URL = os.environ.get('VITE_API_URL', 'https://eka-chat-preview.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

print(f"Testing NEW FEATURES API at: {API_URL}")


class TestChatSessions:
    """Chat Sessions CRUD tests"""
    
    created_session_ids = []
    
    def test_create_chat_session(self):
        """Test POST /api/chat/sessions creates new session"""
        payload = {
            "title": "TEST_Session_Title",
            "context": {"test": True}
        }
        
        response = requests.post(f"{API_URL}/chat/sessions", json=payload)
        assert response.status_code == 201, f"Create session failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "session_id" in data
        assert "data" in data
        assert data["data"]["title"] == payload["title"]
        
        self.__class__.created_session_ids.append(data["session_id"])
        print(f"Created chat session: {data['session_id']}")
        return data["session_id"]
    
    def test_create_session_with_default_title(self):
        """Test session created with default title when none provided"""
        payload = {}
        
        response = requests.post(f"{API_URL}/chat/sessions", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["data"]["title"] == "New Conversation"
        
        self.__class__.created_session_ids.append(data["session_id"])
        print(f"Created session with default title: {data['session_id']}")
    
    def test_list_chat_sessions(self):
        """Test GET /api/chat/sessions returns list"""
        response = requests.get(f"{API_URL}/chat/sessions")
        assert response.status_code == 200, f"List sessions failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        
        print(f"Found {len(data['sessions'])} chat sessions")
    
    def test_get_single_session(self):
        """Test GET /api/chat/sessions/{id} returns session"""
        # First create a session
        create_response = requests.post(f"{API_URL}/chat/sessions", json={"title": "TEST_Single_Session"})
        session_id = create_response.json()["session_id"]
        self.__class__.created_session_ids.append(session_id)
        
        # Then fetch it
        response = requests.get(f"{API_URL}/chat/sessions/{session_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["data"]["session_id"] == session_id
        
        print(f"Fetched session: {session_id}")
    
    def test_add_message_to_session(self):
        """Test POST /api/chat/sessions/{id}/messages adds message"""
        # Create a session
        create_response = requests.post(f"{API_URL}/chat/sessions", json={"title": "TEST_Message_Session"})
        session_id = create_response.json()["session_id"]
        self.__class__.created_session_ids.append(session_id)
        
        # Add a user message
        message_payload = {
            "session_id": session_id,
            "role": "user",
            "content": "TEST: Hello EKA-AI"
        }
        response = requests.post(f"{API_URL}/chat/sessions/{session_id}/messages", json=message_payload)
        assert response.status_code == 200, f"Add message failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert data["message"]["role"] == "user"
        assert data["message"]["content"] == "TEST: Hello EKA-AI"
        
        # Verify message was added by fetching session
        get_response = requests.get(f"{API_URL}/chat/sessions/{session_id}")
        session_data = get_response.json()["data"]
        assert len(session_data["messages"]) >= 1
        
        print(f"Added message to session: {session_id}")
    
    def test_add_message_updates_session_title(self):
        """Test adding first user message updates session title"""
        # Create a session with default title
        create_response = requests.post(f"{API_URL}/chat/sessions", json={})
        session_id = create_response.json()["session_id"]
        self.__class__.created_session_ids.append(session_id)
        
        # Add a user message
        message_payload = {
            "session_id": session_id,
            "role": "user",
            "content": "TEST: This is my question about vehicle repair"
        }
        requests.post(f"{API_URL}/chat/sessions/{session_id}/messages", json=message_payload)
        
        # Verify title was updated
        get_response = requests.get(f"{API_URL}/chat/sessions/{session_id}")
        session_data = get_response.json()["data"]
        assert session_data["title"] != "New Conversation"
        
        print(f"Session title updated: {session_data['title']}")
    
    def test_delete_chat_session(self):
        """Test DELETE /api/chat/sessions/{id} removes session"""
        # Create a session
        create_response = requests.post(f"{API_URL}/chat/sessions", json={"title": "TEST_Delete_Session"})
        session_id = create_response.json()["session_id"]
        
        # Delete it
        response = requests.delete(f"{API_URL}/chat/sessions/{session_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        # Verify deletion
        get_response = requests.get(f"{API_URL}/chat/sessions/{session_id}")
        assert get_response.status_code == 404
        
        print(f"Deleted session: {session_id}")
    
    def test_add_message_to_nonexistent_session_fails(self):
        """Test adding message to non-existent session returns 404"""
        message_payload = {
            "session_id": "nonexistent-session-id",
            "role": "user",
            "content": "This should fail"
        }
        response = requests.post(f"{API_URL}/chat/sessions/nonexistent-session-id/messages", json=message_payload)
        assert response.status_code == 404
        
        print("Non-existent session message add correctly returns 404")
    
    @pytest.fixture(scope="class", autouse=True)
    def cleanup_sessions(self, request):
        """Cleanup created sessions after tests"""
        yield
        for session_id in self.created_session_ids:
            try:
                requests.delete(f"{API_URL}/chat/sessions/{session_id}")
                print(f"Cleaned up test session: {session_id}")
            except:
                pass


class TestPDFGeneration:
    """PDF Invoice Generation tests"""
    
    created_invoice_ids = []
    
    def test_generate_pdf_for_invoice(self):
        """Test GET /api/invoices/{id}/pdf returns PDF"""
        # First create an invoice
        invoice_payload = {
            "job_card_id": "test-job-card-pdf",
            "customer_name": "TEST_PDF_Customer",
            "amount": 10000.0,
            "cgst": 900.0,
            "sgst": 900.0,
            "igst": 0,
            "total_amount": 11800.0,
            "status": "Draft"
        }
        
        create_response = requests.post(f"{API_URL}/invoices", json=invoice_payload)
        assert create_response.status_code == 201
        invoice_id = create_response.json()["data"]["id"]
        self.__class__.created_invoice_ids.append(invoice_id)
        
        # Now download PDF
        response = requests.get(f"{API_URL}/invoices/{invoice_id}/pdf")
        assert response.status_code == 200, f"PDF generation failed: {response.text}"
        
        # Check content type
        assert response.headers.get("content-type") == "application/pdf"
        
        # Check content-disposition header
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp
        assert "invoice" in content_disp.lower()
        
        # Check PDF content (should start with %PDF)
        assert response.content[:4] == b"%PDF", "Response is not a valid PDF"
        
        print(f"PDF generated for invoice: {invoice_id}, size: {len(response.content)} bytes")
    
    def test_pdf_contains_invoice_details(self):
        """Test PDF content contains invoice information"""
        # Create an invoice with specific details
        invoice_payload = {
            "job_card_id": "test-job-card-details",
            "customer_name": "TEST_PDF_Details_Customer",
            "amount": 25000.0,
            "cgst": 2250.0,
            "sgst": 2250.0,
            "igst": 0,
            "total_amount": 29500.0,
            "status": "Draft"
        }
        
        create_response = requests.post(f"{API_URL}/invoices", json=invoice_payload)
        invoice_id = create_response.json()["data"]["id"]
        invoice_number = create_response.json()["data"]["invoice_number"]
        self.__class__.created_invoice_ids.append(invoice_id)
        
        # Download PDF
        response = requests.get(f"{API_URL}/invoices/{invoice_id}/pdf")
        assert response.status_code == 200
        
        # PDF should be non-empty and valid
        assert len(response.content) > 1000, "PDF seems too small"
        assert response.content[:4] == b"%PDF"
        
        print(f"PDF with details generated: {invoice_number}, size: {len(response.content)} bytes")
    
    def test_pdf_for_nonexistent_invoice_fails(self):
        """Test PDF for non-existent invoice returns 404"""
        response = requests.get(f"{API_URL}/invoices/000000000000000000000000/pdf")
        assert response.status_code in [400, 404], f"Expected 400/404, got {response.status_code}"
        
        print("Non-existent invoice PDF correctly returns error")
    
    def test_pdf_for_invalid_id_fails(self):
        """Test PDF for invalid invoice ID returns 400"""
        response = requests.get(f"{API_URL}/invoices/invalid-id/pdf")
        assert response.status_code == 400
        
        print("Invalid invoice ID correctly returns 400")


class TestFileUpload:
    """File Upload API tests"""
    
    created_file_ids = []
    
    def test_upload_text_file(self):
        """Test POST /api/files/upload with text file"""
        # Create a simple text file
        file_content = b"TEST: This is a test file content for EKA-AI testing"
        files = {
            "file": ("test_document.txt", io.BytesIO(file_content), "text/plain")
        }
        
        response = requests.post(f"{API_URL}/files/upload", files=files)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "file_id" in data
        assert "url" in data
        assert data["file"]["original_name"] == "test_document.txt"
        assert data["file"]["file_type"] == "document"
        
        self.__class__.created_file_ids.append(data["file_id"])
        print(f"Uploaded text file: {data['file_id']}")
    
    def test_upload_image_file(self):
        """Test POST /api/files/upload with image file"""
        # Create a simple PNG file (1x1 transparent pixel)
        png_content = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
        ])
        files = {
            "file": ("test_image.png", io.BytesIO(png_content), "image/png")
        }
        
        response = requests.post(f"{API_URL}/files/upload", files=files)
        assert response.status_code == 200, f"Image upload failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert data["file"]["file_type"] == "image"
        assert data["file"]["extension"] == "png"
        
        self.__class__.created_file_ids.append(data["file_id"])
        print(f"Uploaded image file: {data['file_id']}")
    
    def test_upload_with_job_card_id(self):
        """Test upload with job_card_id parameter"""
        file_content = b"TEST: File associated with job card"
        files = {
            "file": ("job_document.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "job_card_id": "test-job-card-123",
            "category": "service-records"
        }
        
        response = requests.post(f"{API_URL}/files/upload", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["file"]["job_card_id"] == "test-job-card-123"
        assert result["file"]["category"] == "service-records"
        
        self.__class__.created_file_ids.append(result["file_id"])
        print(f"Uploaded file with job_card_id: {result['file_id']}")
    
    def test_list_files(self):
        """Test GET /api/files returns file list"""
        response = requests.get(f"{API_URL}/files")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "files" in data
        assert isinstance(data["files"], list)
        assert "count" in data
        
        print(f"Listed {data['count']} files")
    
    def test_list_files_with_filter(self):
        """Test GET /api/files with category filter"""
        response = requests.get(f"{API_URL}/files?category=chat-attachment")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        print(f"Listed {data['count']} files with category filter")
    
    def test_download_file(self):
        """Test GET /api/files/{id} downloads file"""
        # First upload a file
        file_content = b"TEST: File content for download test"
        files = {
            "file": ("download_test.txt", io.BytesIO(file_content), "text/plain")
        }
        
        upload_response = requests.post(f"{API_URL}/files/upload", files=files)
        file_id = upload_response.json()["file_id"]
        self.__class__.created_file_ids.append(file_id)
        
        # Download the file
        response = requests.get(f"{API_URL}/files/{file_id}")
        assert response.status_code == 200
        
        # Check content matches
        assert response.content == file_content
        
        print(f"Downloaded file: {file_id}")
    
    def test_delete_file(self):
        """Test DELETE /api/files/{id} removes file"""
        # Upload a file
        file_content = b"TEST: File to be deleted"
        files = {
            "file": ("delete_test.txt", io.BytesIO(file_content), "text/plain")
        }
        
        upload_response = requests.post(f"{API_URL}/files/upload", files=files)
        file_id = upload_response.json()["file_id"]
        
        # Delete it
        response = requests.delete(f"{API_URL}/files/{file_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        # Verify deletion
        get_response = requests.get(f"{API_URL}/files/{file_id}")
        assert get_response.status_code == 404
        
        print(f"Deleted file: {file_id}")
    
    def test_upload_disallowed_extension_fails(self):
        """Test upload with disallowed file extension fails"""
        file_content = b"TEST: This is a fake executable"
        files = {
            "file": ("malicious.exe", io.BytesIO(file_content), "application/octet-stream")
        }
        
        response = requests.post(f"{API_URL}/files/upload", files=files)
        assert response.status_code == 400
        
        print("Disallowed file extension correctly rejected")
    
    def test_download_nonexistent_file_fails(self):
        """Test download of non-existent file returns 404"""
        response = requests.get(f"{API_URL}/files/nonexistent-file-id")
        assert response.status_code == 404
        
        print("Non-existent file download correctly returns 404")
    
    @pytest.fixture(scope="class", autouse=True)
    def cleanup_files(self, request):
        """Cleanup created files after tests"""
        yield
        for file_id in self.created_file_ids:
            try:
                requests.delete(f"{API_URL}/files/{file_id}")
                print(f"Cleaned up test file: {file_id}")
            except:
                pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
