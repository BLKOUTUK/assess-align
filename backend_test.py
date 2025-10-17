#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Assess & Align
Tests all API endpoints and functionality including Claude Sonnet 4 integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class AssessAlignAPITester:
    def __init__(self, base_url="https://assess-equity.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_request_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict = None, headers: Dict = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            if success:
                self.log_test(name, True)
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")

            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_equity_questions(self):
        """Test equity questions endpoint"""
        success, data = self.run_test("Get Equity Questions", "GET", "equity-questions", 200)
        
        if success and data:
            questions = data if isinstance(data, list) else []
            if len(questions) == 7:
                print(f"   ✓ Found all 7 equity questions")
                # Verify question structure
                required_fields = ['id', 'question', 'category', 'order']
                for i, q in enumerate(questions):
                    missing_fields = [field for field in required_fields if field not in q]
                    if missing_fields:
                        self.log_test(f"Question {i+1} Structure", False, f"Missing fields: {missing_fields}")
                    else:
                        print(f"   ✓ Question {i+1}: {q['category']}")
            else:
                self.log_test("Equity Questions Count", False, f"Expected 7 questions, got {len(questions)}")
        
        return success, data

    def test_create_research_request(self):
        """Test creating a research request"""
        test_data = {
            "title": "Test Mental Health Research Study",
            "email_content": "Dear Community Leaders,\n\nWe are conducting a study on mental health outcomes in Black communities. We would like to partner with your organization to recruit participants for our research.\n\nThe study involves:\n- 2-hour interviews\n- Psychological assessments\n- Follow-up surveys\n\nWe can offer £50 compensation per participant.\n\nPlease let us know if you're interested in collaborating.\n\nBest regards,\nDr. Test Researcher",
            "researcher_name": "Dr. Test Researcher",
            "institution": "Test University"
        }
        
        success, data = self.run_test("Create Research Request", "POST", "research-requests", 200, test_data)
        
        if success and data:
            self.created_request_id = data.get('id')
            print(f"   ✓ Created request with ID: {self.created_request_id}")
            
            # Verify response structure
            required_fields = ['id', 'title', 'email_content', 'status', 'created_at']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                self.log_test("Request Response Structure", False, f"Missing fields: {missing_fields}")
            else:
                print(f"   ✓ Response has all required fields")
        
        return success, data

    def test_get_research_requests(self):
        """Test getting all research requests"""
        success, data = self.run_test("Get All Research Requests", "GET", "research-requests", 200)
        
        if success and data:
            requests_list = data if isinstance(data, list) else []
            print(f"   ✓ Found {len(requests_list)} research requests")
            
            if self.created_request_id and requests_list:
                found_request = any(req.get('id') == self.created_request_id for req in requests_list)
                if found_request:
                    print(f"   ✓ Found our created request in the list")
                else:
                    self.log_test("Find Created Request", False, "Created request not found in list")
        
        return success, data

    def test_get_specific_request(self):
        """Test getting a specific research request"""
        if not self.created_request_id:
            self.log_test("Get Specific Request", False, "No request ID available")
            return False, {}
        
        success, data = self.run_test("Get Specific Request", "GET", f"research-requests/{self.created_request_id}", 200)
        
        if success and data:
            if data.get('id') == self.created_request_id:
                print(f"   ✓ Retrieved correct request")
            else:
                self.log_test("Request ID Match", False, f"Expected {self.created_request_id}, got {data.get('id')}")
        
        return success, data

    def test_submit_assessment(self):
        """Test submitting assessment responses"""
        if not self.created_request_id:
            self.log_test("Submit Assessment", False, "No request ID available")
            return False, {}
        
        # First get the equity questions to create proper responses
        _, questions_data = self.test_equity_questions()
        if not questions_data:
            self.log_test("Submit Assessment", False, "Could not get equity questions")
            return False, {}
        
        questions = questions_data if isinstance(questions_data, list) else []
        
        # Create assessment responses
        assessment_responses = []
        sample_responses = [
            "The research primarily benefits the academic institution and researchers, with limited direct benefit to Black communities. There's no clear plan for sharing results or resources with participants.",
            "Black communities are not involved in research design or methodology. They are positioned as subjects rather than partners in the research process.",
            "Only £50 compensation is offered, which seems inadequate for 2+ hours of participation. No other resources or support mentioned for community organizations.",
            "No clear plan mentioned for sharing findings with Black communities in accessible formats or ensuring community access to results.",
            "No mechanisms mentioned for ongoing engagement or accountability beyond data collection. Appears to be a one-time extractive interaction.",
            "The research maintains traditional power imbalances with researchers as experts and community members as subjects. No effort to address historical research exploitation.",
            "No safeguards mentioned to prevent harm or stereotyping. The approach seems to treat mental health as individual rather than considering systemic factors."
        ]
        
        for i, question in enumerate(questions[:7]):  # Ensure we only use 7 questions
            response_text = sample_responses[i] if i < len(sample_responses) else f"Assessment response for question {i+1}"
            assessment_responses.append({
                "question_id": question['id'],
                "question_text": question['question'],
                "response": response_text
            })
        
        assessment_data = {
            "request_id": self.created_request_id,
            "responses": assessment_responses
        }
        
        success, data = self.run_test("Submit Assessment", "POST", "assessments/submit", 200, assessment_data)
        
        if success and data:
            print(f"   ✓ Assessment submitted successfully")
        
        return success, data

    def test_generate_feedback(self):
        """Test AI feedback generation with Claude Sonnet 4"""
        if not self.created_request_id:
            self.log_test("Generate Feedback", False, "No request ID available")
            return False, {}
        
        feedback_data = {
            "request_id": self.created_request_id
        }
        
        print("   ⏳ Generating AI feedback (this may take 10-30 seconds)...")
        success, data = self.run_test("Generate AI Feedback", "POST", "feedback/generate", 200, feedback_data)
        
        if success and data:
            feedback = data.get('feedback', '')
            if feedback and len(feedback) > 100:  # Reasonable feedback length
                print(f"   ✓ Generated feedback ({len(feedback)} characters)")
                print(f"   ✓ Feedback preview: {feedback[:150]}...")
                
                # Check for key feedback sections
                feedback_lower = feedback.lower()
                sections_found = []
                if 'strength' in feedback_lower:
                    sections_found.append('Strengths')
                if 'improvement' in feedback_lower or 'concern' in feedback_lower:
                    sections_found.append('Areas for Improvement')
                if 'recommend' in feedback_lower:
                    sections_found.append('Recommendations')
                
                if sections_found:
                    print(f"   ✓ Feedback contains sections: {', '.join(sections_found)}")
                else:
                    self.log_test("Feedback Structure", False, "Feedback missing expected sections")
            else:
                self.log_test("Feedback Content", False, f"Feedback too short or empty: {len(feedback)} chars")
        
        return success, data

    def test_analytics_summary(self):
        """Test analytics summary endpoint"""
        success, data = self.run_test("Get Analytics Summary", "GET", "analytics/summary", 200)
        
        if success and data:
            required_fields = ['total_requests', 'completed_assessments', 'recent_requests_this_month']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Analytics Structure", False, f"Missing fields: {missing_fields}")
            else:
                print(f"   ✓ Total requests: {data.get('total_requests', 0)}")
                print(f"   ✓ Completed assessments: {data.get('completed_assessments', 0)}")
                print(f"   ✓ Recent requests: {data.get('recent_requests_this_month', 0)}")
        
        return success, data

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Assess & Align Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        self.test_root_endpoint()
        self.test_equity_questions()
        self.test_create_research_request()
        self.test_get_research_requests()
        self.test_get_specific_request()
        self.test_submit_assessment()
        self.test_generate_feedback()  # This tests Claude Sonnet 4 integration
        self.test_analytics_summary()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("❌ SOME TESTS FAILED")
            return 1

def main():
    tester = AssessAlignAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())