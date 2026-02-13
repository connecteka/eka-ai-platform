#!/usr/bin/env python3
"""
EKA-AI Platform Backend API Testing
Tests all backend endpoints for the automobile intelligence system
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class EKAAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and "status" in data and data["status"] == "healthy":
                self.log_test("Health Check", True)
                return True
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}, Data: {data}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and "status" in data:
                self.log_test("Root Endpoint", True)
                return True
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_chat_endpoint(self):
        """Test /api/chat endpoint"""
        try:
            chat_payload = {
                "history": [
                    {
                        "role": "user",
                        "parts": [{"text": "Hello, I need help with vehicle diagnostics"}]
                    }
                ],
                "context": None,
                "status": "CREATED",
                "intelligence_mode": "FAST",
                "operating_mode": 0
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=chat_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and "response_content" in data:
                visual_text = data["response_content"].get("visual_text", "")
                if visual_text and len(visual_text) > 10:
                    self.log_test("AI Chat Endpoint", True)
                    return True
                else:
                    self.log_test("AI Chat Endpoint", False, f"Empty or short response: {visual_text[:100]}")
                    return False
            else:
                self.log_test("AI Chat Endpoint", False, f"Status: {response.status_code}, Data: {data}")
                return False
        except Exception as e:
            self.log_test("AI Chat Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_job_cards_crud(self):
        """Test Job Cards CRUD operations"""
        job_card_id = None
        
        # Test CREATE
        try:
            create_payload = {
                "customer_name": "Test Customer",
                "vehicle_registration": "MH01AB1234",
                "status": "Pending",
                "details": "Test job card for API testing",
                "phone": "9876543210",
                "email": "test@example.com",
                "vehicle_model": "Test Model",
                "estimated_cost": 5000.0
            }
            
            response = requests.post(
                f"{self.base_url}/api/job-cards",
                json=create_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get("success") and "data" in data:
                    job_card_id = data["data"]["id"]
                    self.log_test("Job Card CREATE", True)
                else:
                    self.log_test("Job Card CREATE", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Job Card CREATE", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Job Card CREATE", False, f"Exception: {str(e)}")
            return False

        # Test READ (Get All)
        try:
            response = requests.get(f"{self.base_url}/api/job-cards", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and isinstance(data.get("data"), list):
                    self.log_test("Job Card READ (All)", True)
                else:
                    self.log_test("Job Card READ (All)", False, f"Invalid response: {data}")
            else:
                self.log_test("Job Card READ (All)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Job Card READ (All)", False, f"Exception: {str(e)}")

        # Test READ (Get by ID)
        if job_card_id:
            try:
                response = requests.get(f"{self.base_url}/api/job-cards/{job_card_id}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "data" in data:
                        self.log_test("Job Card READ (By ID)", True)
                    else:
                        self.log_test("Job Card READ (By ID)", False, f"Invalid response: {data}")
                else:
                    self.log_test("Job Card READ (By ID)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Job Card READ (By ID)", False, f"Exception: {str(e)}")

        # Test UPDATE
        if job_card_id:
            try:
                update_payload = {
                    "status": "In-Progress",
                    "details": "Updated test job card"
                }
                
                response = requests.put(
                    f"{self.base_url}/api/job-cards/{job_card_id}",
                    json=update_payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_test("Job Card UPDATE", True)
                    else:
                        self.log_test("Job Card UPDATE", False, f"Update failed: {data}")
                else:
                    self.log_test("Job Card UPDATE", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Job Card UPDATE", False, f"Exception: {str(e)}")

        # Test DELETE
        if job_card_id:
            try:
                response = requests.delete(f"{self.base_url}/api/job-cards/{job_card_id}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_test("Job Card DELETE", True)
                    else:
                        self.log_test("Job Card DELETE", False, f"Delete failed: {data}")
                else:
                    self.log_test("Job Card DELETE", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Job Card DELETE", False, f"Exception: {str(e)}")

        return True

    def test_invoices_endpoints(self):
        """Test Invoice endpoints"""
        try:
            # Test CREATE Invoice
            invoice_payload = {
                "job_card_id": "test_job_card_123",
                "customer_name": "Test Customer",
                "amount": 5000.0,
                "cgst": 450.0,
                "sgst": 450.0,
                "igst": 0.0,
                "total_amount": 5900.0,
                "status": "Draft"
            }
            
            response = requests.post(
                f"{self.base_url}/api/invoices",
                json=invoice_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get("success") and "data" in data:
                    invoice_id = data["data"]["id"]
                    self.log_test("Invoice CREATE", True)
                    
                    # Test GET Invoices
                    get_response = requests.get(f"{self.base_url}/api/invoices", timeout=10)
                    if get_response.status_code == 200:
                        self.log_test("Invoice READ", True)
                    else:
                        self.log_test("Invoice READ", False, f"Status: {get_response.status_code}")
                    
                    return True
                else:
                    self.log_test("Invoice CREATE", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Invoice CREATE", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invoice CREATE", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/dashboard/metrics", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "metrics" in data:
                    metrics = data["metrics"]
                    required_fields = ["total_job_cards", "pending_jobs", "completed_jobs", "in_progress"]
                    
                    if all(field in metrics for field in required_fields):
                        self.log_test("Dashboard Metrics", True)
                        return True
                    else:
                        self.log_test("Dashboard Metrics", False, f"Missing fields in metrics: {metrics}")
                        return False
                else:
                    self.log_test("Dashboard Metrics", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Dashboard Metrics", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Dashboard Metrics", False, f"Exception: {str(e)}")
            return False

    def test_mg_fleet_endpoints(self):
        """Test MG Fleet endpoints"""
        try:
            # Test CREATE MG Contract
            contract_payload = {
                "customer_name": "Test Fleet Customer",
                "vehicle_registration": "MH01CD5678",
                "contract_type": "Monthly",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "monthly_km_limit": 2000,
                "monthly_fee": 15000.0
            }
            
            response = requests.post(
                f"{self.base_url}/api/mg/contracts",
                json=contract_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get("success"):
                    self.log_test("MG Contract CREATE", True)
                    
                    # Test GET MG Contracts
                    get_response = requests.get(f"{self.base_url}/api/mg/contracts", timeout=10)
                    if get_response.status_code == 200:
                        self.log_test("MG Contract READ", True)
                    else:
                        self.log_test("MG Contract READ", False, f"Status: {get_response.status_code}")
                    
                    return True
                else:
                    self.log_test("MG Contract CREATE", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("MG Contract CREATE", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("MG Contract CREATE", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting EKA-AI Backend API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 50)
        
        # Core endpoints
        self.test_root_endpoint()
        self.test_health_endpoint()
        
        # AI Chat
        self.test_chat_endpoint()
        
        # Job Cards CRUD
        self.test_job_cards_crud()
        
        # Invoices
        self.test_invoices_endpoints()
        
        # Dashboard
        self.test_dashboard_metrics()
        
        # MG Fleet
        self.test_mg_fleet_endpoints()
        
        # Summary
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if success_rate < 70:
            print("⚠️  WARNING: Low success rate detected!")
            return False
        elif success_rate == 100:
            print("🎉 All tests passed!")
            return True
        else:
            print("✅ Most tests passed with some issues")
            return True

def main():
    tester = EKAAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())