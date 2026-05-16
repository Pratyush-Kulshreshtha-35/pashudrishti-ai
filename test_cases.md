# PashuDrishti AI - Project Test Cases

This document outlines the test cases for each module of the PashuDrishti AI project.

---

## 1. Authentication Module (Login & Registration)

### TC-AUTH-01: Valid Login
- **Test Case ID:** TC-AUTH-01
- **Test Case Title:** Verify login with valid credentials
- **Module Name:** Authentication
- **Test Scenario:** User enters correct email and password.
- **Preconditions:** User must have a registered account.
- **Test Steps:**
  1. Navigate to the login page.
  2. Enter a registered email (e.g., `user@example.com`).
  3. Enter the correct password.
  4. Click the "Login" button.
- **Test Data:** `email: user@example.com`, `password: CorrectPass123`
- **Expected Result:** User is successfully logged in and redirected to the dashboard.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** High
- **Severity:** Critical
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-AUTH-02: Invalid Login (Wrong Password)
- **Test Case ID:** TC-AUTH-02
- **Test Case Title:** Verify login failure with incorrect password
- **Module Name:** Authentication
- **Test Scenario:** User enters a valid email but an incorrect password.
- **Preconditions:** User must have a registered account.
- **Test Steps:**
  1. Navigate to the login page.
  2. Enter a registered email.
  3. Enter an incorrect password.
  4. Click the "Login" button.
- **Test Data:** `email: user@example.com`, `password: WrongPass123`
- **Expected Result:** Error message "Invalid login credentials" is displayed.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** High
- **Severity:** Major
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-AUTH-03: Registration with Invalid Characters
- **Test Case ID:** TC-AUTH-03
- **Test Case Title:** Verify registration fails with invalid characters in email
- **Module Name:** Authentication
- **Test Scenario:** User tries to register with special characters in the email field that are not allowed.
- **Preconditions:** None.
- **Test Steps:**
  1. Navigate to the login page.
  2. Enter an invalid email (e.g., `user#$@domain.com`).
  3. Enter a password.
  4. Click "Create account".
- **Test Data:** `email: user#$@domain.com`, `password: TestPass123`
- **Expected Result:** Error message indicating invalid email format or registration failure.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Major
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-AUTH-04: Logout Functionality
- **Test Case ID:** TC-AUTH-04
- **Test Case Title:** Verify user logout
- **Module Name:** Authentication
- **Test Scenario:** Logged-in user clicks the logout button.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Click the "Logout" button in the header.
- **Test Data:** None
- **Expected Result:** User session is cleared and redirected back to the login page.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Major
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-AUTH-05: Empty Field Validation (Login/Signup)
- **Test Case ID:** TC-AUTH-05
- **Test Case Title:** Verify alert when fields are empty
- **Module Name:** Authentication
- **Test Scenario:** User clicks Login or Signup without entering credentials.
- **Preconditions:** None.
- **Test Steps:**
  1. Leave Email and Password empty.
  2. Click "Login" or "Create account".
- **Test Data:** `email: ""`, `password: ""`
- **Expected Result:** Alert "Enter email and password" is shown.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Minor
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

---

## 2. Livestock Prediction Module (Disease & Breed)

### TC-PRED-01: Successful Image Analysis
- **Test Case ID:** TC-PRED-01
- **Test Case Title:** Verify AI analysis with a valid livestock image
- **Module Name:** Prediction
- **Test Scenario:** User uploads a valid JPG image of a cow.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Navigate to the Prediction/Dashboard page.
  2. Click on the upload zone and select a valid image file.
  3. Click "Analyze image".
- **Test Data:** `image: cow_healthy.jpg`
- **Expected Result:** Analysis results (Breed, Disease, Confidence) are displayed on the right panel.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** High
- **Severity:** Critical
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-PRED-02: Upload Without Image
- **Test Case ID:** TC-PRED-02
- **Test Case Title:** Verify alert when "Analyze image" is clicked without selecting a file
- **Module Name:** Prediction
- **Test Scenario:** User clicks analyze without picking a file first.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Navigate to the Prediction page.
  2. Directly click the "Analyze image" button.
- **Test Data:** None
- **Expected Result:** Alert "Please select an image" is shown.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Minor
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-PRED-03: Invalid File Type Upload
- **Test Case ID:** TC-PRED-03
- **Test Case Title:** Verify error when uploading non-image files
- **Module Name:** Prediction
- **Test Scenario:** User attempts to upload a PDF or text file for analysis.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Navigate to the Prediction page.
  2. Select a `.pdf` file.
  3. Click "Analyze image".
- **Test Data:** `file: document.pdf`
- **Expected Result:** System should either prevent selection (if input accept is strictly enforced) or display an "Analysis failed" error.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Minor
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

---

## 3. Chatbot Module

### TC-CHAT-01: Valid Message Submission
- **Test Case ID:** TC-CHAT-01
- **Test Case Title:** Verify chatbot response for valid health query
- **Module Name:** Chatbot
- **Test Scenario:** User asks a relevant question about livestock care.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Open the Chatbot interface.
  2. Type "How to treat Lumpy Skin Disease in cows?".
  3. Click the "Send" button.
- **Test Data:** `query: How to treat Lumpy Skin Disease?`
- **Expected Result:** Chatbot provides a detailed AI-generated response.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Medium
- **Severity:** Normal
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 

### TC-CHAT-02: Empty Message Submission
- **Test Case ID:** TC-CHAT-02
- **Test Case Title:** Verify behavior when sending an empty message
- **Module Name:** Chatbot
- **Test Scenario:** User clicks send without typing anything.
- **Preconditions:** User must be logged in.
- **Test Steps:**
  1. Open Chatbot interface.
  2. Leave text box empty.
  3. Click "Send".
- **Test Data:** `query: ""`
- **Expected Result:** Send button should be disabled or nothing should happen.
- **Actual Result:** 
- **Status (Pass/Fail):** 
- **Priority:** Low
- **Severity:** Minor
- **Tester Name:** 
- **Execution Date:** 
- **Remarks:** 
