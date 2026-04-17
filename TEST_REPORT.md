# Unit Testing Report for Backend Services

## Overview
This report documents the comprehensive unit testing setup and execution for the backend services in the PrepifyAI project. The testing focuses on PerformanceService, PastPaperQuestionService, UserService, and PastPaperService, using pytest with mocked AsyncSession to avoid actual database interactions and ensure isolation.

## Test Setup
- **Framework**: pytest with pytest-asyncio for async test support
- **Mocking**: unittest.mock for AsyncSession and other dependencies
- **Coverage**: All major service methods including success and error scenarios
- **Isolation**: No database calls or storage; all operations mocked

## Dependencies Added
- pytest==7.4.3
- pytest-asyncio==0.21.1

## Test Files Created

### 1. tests/test_performance_service.py
Unit tests for PerformanceService covering performance recording, answer evaluation, and analytics.

### 2. tests/test_past_paper_question.py
Unit tests for PastPaperQuestionService covering CRUD operations for past paper questions.

### 3. tests/test_user_service.py
Comprehensive unit tests for UserService covering user management operations.

### 4. tests/test_past_paper_service.py
Comprehensive unit tests for PastPaperService covering past paper management and analytics.

### 5. tests/__init__.py
Empty package initialization file for the tests directory.

### 6. conftest.py
Pytest configuration with event loop fixture for async tests.

## Test Execution Results

### Final Run Summary
- **Total Tests**: 61
- **Passed**: 61
- **Failed**: 0
- **Status**: All tests passing 

### Test Results by File

| Test File | Total Tests | Passed | Failed | Status |
|-----------|-------------|--------|--------|--------|
| test_auth_admin.py | 9 | 9 | 0 | All Passed  |
| test_past_paper_question.py | 7 | 7 | 0 | All Passed  |
| test_past_paper_service.py | 11 | 11 | 0 | All Passed  |
| test_past_paper_upload.py | 11 | 11 | 0 | All Passed  |
| test_performance_service.py | 8 | 8 | 0 | All Passed  |
| test_prediction_service.py | 2 | 2 | 0 | All Passed  |
| test_user_service.py | 13 | 13 | 0 | All Passed  |


## Detailed Test Coverage

### PerformanceService Tests

| Test Function | Purpose | How (Mocking Strategy) | Result |
|---------------|---------|------------------------|--------|
| test_record_performance | Test recording student performance | Mock AsyncSession add/commit/refresh operations |  Passed |
| test_evaluate_answer_correct_mcq | Test evaluating correct MCQ answer | Mock db.execute for question retrieval, mock record_performance |  Passed |
| test_evaluate_answer_incorrect_mcq | Test evaluating incorrect MCQ answer | Mock db.execute for question retrieval, mock record_performance |  Passed |
| test_evaluate_answer_short_question | Test evaluating short question answer | Mock db.execute for question retrieval, mock record_performance |  Passed |
| test_evaluate_answer_question_not_found | Test handling non-existent question | Mock db.execute to return None, expect ValueError |  Passed |
| test_get_user_analytics_with_performances | Test analytics with performance data | Mock db.execute to return performance list |  Passed |
| test_get_user_analytics_no_performances | Test analytics with no data | Mock db.execute to return empty list |  Passed |
| test_get_user_performance_history | Test retrieving performance history | Mock db.execute with date filtering |  Passed |

### PastPaperQuestionService Tests

| Test Function | Purpose | How (Mocking Strategy) | Result |
|---------------|---------|------------------------|--------|
| test_add_past_paper_question | Test adding new question | Mock AsyncSession add/commit/refresh, JSON embedding |  Passed |
| test_get_all_past_paper_questions | Test retrieving all questions | Mock db.execute with scalars().all() |  Passed |
| test_get_past_paper_question_by_id | Test retrieving question by ID | Mock db.execute scalar_one_or_none |  Passed |
| test_get_past_paper_question_by_id_not_found | Test handling non-existent question | Mock db.execute to return None |  Passed |
| test_update_past_paper_question | Test updating question | Mock db.execute for select, then commit/refresh |  Passed |
| test_update_past_paper_question_not_found | Test updating non-existent question | Mock db.execute to return None |  Passed |
| test_delete_past_paper_question | Test deleting question | Mock db.execute for select, then delete/commit |  Passed |
| test_delete_past_paper_question_not_found | Test deleting non-existent question | Mock db.execute to return None |  Passed |

### UserService Tests

| Test Function | Purpose | How (Mocking Strategy) | Result |
|---------------|---------|------------------------|--------|
| test_admin_register_success | Test admin user creation | Mock password hashing, db operations |  Passed |
| test_admin_login_success | Test admin login success | Patch verify_password, mock user retrieval |  Passed |
| test_admin_login_invalid_password | Test admin login failure | Patch verify_password to return False |  Passed |
| test_create_user | Test general user creation | Mock db operations, password hashing |  Passed |
| test_get_user_by_id | Test user retrieval by ID | Mock db.execute scalar_one_or_none |  Passed |
| test_get_user_by_id_not_found | Test user not found | Mock db.execute to return None |  Passed |
| test_authenticate_user_success | Test successful authentication | Patch verify_password, mock user retrieval |  Passed |
| test_authenticate_user_invalid_password | Test failed authentication | Patch verify_password to return False |  Passed |
| test_update_user | Test user information update | Mock get_user_by_id, db commit/refresh |  Passed |
| test_update_user_not_found | Test updating non-existent user | Mock get_user_by_id to return None |  Passed |
| test_get_users | Test retrieving all users | Mock db.execute scalars().all() |  Passed |
| test_deactivate_user | Test user deactivation | Mock get_user_by_id, db commit |  Passed |
| test_deactivate_user_not_found | Test deactivating non-existent user | Mock get_user_by_id to return None |  Passed |

### PastPaperService Tests

| Test Function | Purpose | How (Mocking Strategy) | Result |
|---------------|---------|------------------------|--------|
| test_get_all_past_papers | Test retrieving all papers | Mock db.execute scalars().unique().all() | Passed  |
| test_get_all_past_papers_with_filters | Test filtered paper retrieval | Mock db.execute with filter conditions | Passed  |
| test_get_past_paper_by_id | Test paper retrieval by ID | Mock db.execute scalar_one_or_none | Passed  |
| test_get_past_paper_by_id_not_found | Test paper not found | Mock db.execute to return None | Passed  |
| test_update_past_paper | Test paper information update | Mock db.execute for select, commit/refresh | Passed  |
| test_update_past_paper_not_found | Test updating non-existent paper | Mock db.execute to return None | Passed  |
| test_delete_past_paper | Test paper deletion | Mock db.execute for select, delete/commit | Passed  |
| test_delete_past_paper_not_found | Test deleting non-existent paper | Mock db.execute to return None | Passed  |
| test_get_paper_statistics | Test paper statistics calculation | Mock multiple db.execute calls for paper and questions | Passed  |
| test_get_topic_distribution | Test topic distribution analysis | Mock db.execute for papers and questions | Passed  |
| test_get_marks_by_topic | Test marks distribution by topic | Mock db.execute for papers and questions | Passed  |

## Mocking Strategy
- **AsyncSession**: Fully mocked to prevent database calls
- **Password verification**: Patched at service level for proper isolation
- **Database operations**: All add, commit, refresh, execute operations mocked
- **Query results**: Mocked result objects with proper chaining (scalars, unique, all, etc.)
- **External dependencies**: JSON handling, datetime operations mocked where needed

## Key Testing Patterns
1. **Fixture usage**: `mock_db` fixture for consistent AsyncSession mocking
2. **Async testing**: All tests marked with `@pytest.mark.asyncio`
3. **Mock verification**: Assertions on mock call counts and arguments
4. **Error scenarios**: Tests for not found cases and invalid inputs
5. **Data validation**: Assertions on returned object properties and types
6. **Edge cases**: Empty results, non-existent entities, validation errors

## Detailed Test Case Table

| Objective | Precondition | Steps | Test Data | Expected Result | Postcondition | Actual Result | Pass/Fail |
|-----------|--------------|-------|-----------|----------------|--------------|--------------|----------|
| Test adding a new past paper question | Mock AsyncSession db, question_data created | Mock db.add, commit, refresh; call add_past_paper_question; assert result properties; assert mock calls | PastPaperQuestionAdd(paper_id=1, source_chunk_id="1", question_text="What is 2+2?", question_type="MCQ", embedding=[0.1, 0.2, 0.3], topic="Math", marks=5.0) | result.paper_id == 1, result.question_text == "What is 2+2?", result.question_type == "MCQ", result.embedding == json.dumps([0.1, 0.2, 0.3]), result.topic == "Math", result.marks == 5.0, db.add called once, commit called once, refresh called once | Mock db operations verified | All assertions passed, mocks called correctly | Pass |
| Test getting all past paper questions | Mock db, mock_questions list | Mock db.execute to return mock_result with scalars().all() returning mock_questions; call get_all_past_paper_questions; assert len(result) == 2, assert result == mock_questions | mock_questions = [PastPaperQuestion(question_id=1, paper_id=1, source_chunk_id=1, question_text="Question 1", question_type="MCQ", embedding=json.dumps([0.1, 0.2]), topic="Topic1", marks=5.0), PastPaperQuestion(question_id=2, paper_id=1, source_chunk_id=2, question_text="Question 2", question_type="Short", embedding=json.dumps([0.3, 0.4]), topic="Topic2", marks=10.0)] | len(result) == 2, result == mock_questions | db.execute called once | As expected | Pass |
| Test getting past paper question by ID | Mock db, question_id = 1, mock_question | Mock db.execute to return mock_result with scalar_one_or_none returning mock_question; call get_past_paper_question_by_id; assert result == mock_question | question_id = 1, mock_question = PastPaperQuestion(question_id=1, paper_id=1, source_chunk_id=1, question_text="Question 1", question_type="MCQ", embedding=json.dumps([0.1, 0.2]), topic="Topic1", marks=5.0) | result == mock_question | db.execute called once | As expected | Pass |
| Test getting past paper question by ID when not found | Mock db, question_id = 999 | Mock db.execute to return mock_result with scalar_one_or_none returning None; call get_past_paper_question_by_id; assert result is None | question_id = 999 | result is None | db.execute called once | As expected | Pass |
| Test updating a past paper question | Mock db, question_id = 1, updates, mock_question | Mock db.execute for select, mock commit and refresh; call update_past_paper_question; assert result.question_text == "Updated Question", etc. | question_id = 1, updates = PastPaperQuestionUpdate(question_text="Updated Question", question_type="Short", embedding=[0.5, 0.6], topic="Updated Topic", marks=15.0), mock_question = PastPaperQuestion(...) | result.question_text == "Updated Question", result.question_type == "Short", result.embedding == json.dumps([0.5, 0.6]), result.topic == "Updated Topic", result.marks == 15.0, db.commit called once, db.refresh called once | Mock operations verified | As expected | Pass |
| Test updating a past paper question that doesn't exist | Mock db, question_id = 999, updates | Mock db.execute to return None; call update_past_paper_question; assert result is None | question_id = 999, updates = PastPaperQuestionUpdate(question_text="Updated") | result is None | db.execute called once | As expected | Pass |
| Test deleting a past paper question | Mock db, question_id = 1, mock_question | Mock db.execute for select, mock delete and commit; call delete_past_paper_question; assert result == mock_question | question_id = 1, mock_question = PastPaperQuestion(...) | result == mock_question, db.delete called once with mock_question, db.commit called once | Mock operations verified | As expected | Pass |
| Test deleting a past paper question that doesn't exist | Mock db, question_id = 999 | Mock db.execute to return None; call delete_past_paper_question; assert result is None | question_id = 999 | result is None | db.execute called once | As expected | Pass |
| Test adding a new past paper | Mock db, data | Mock db.add, commit, refresh; call PastPaperService.add_past_paper; assert result properties | data = PastPaperCreate(subject_id=1, year=2023, board="FBISE") | result.subject_id == 1, result.year == 2023, result.board == "FBISE", db.add called once, commit called once, refresh called once | Mock operations verified | As expected | Pass |
| Test getting all past papers | Mock db, mock_papers | Mock db.execute to return mock_result with scalars().unique().all() returning mock_papers; call PastPaperService.get_all_past_papers; assert len(result) == 2, assert result == mock_papers | mock_papers = [PastPaper(paper_id=1, subject_id=1, year=2023, board="FBISE"), PastPaper(paper_id=2, subject_id=1, year=2022, board="FBISE")] | len(result) == 2, result == mock_papers | db.execute called once | As expected | Pass |
| Test getting all past papers with subject and year filters | Mock db, subject_id = 1, year = 2023, mock_papers | Mock db.execute to return mock_result with scalars().unique().all() returning mock_papers; call PastPaperService.get_all_past_papers with filters; assert len(result) == 1, assert result[0].subject_id == 1, result[0].year == 2023 | subject_id = 1, year = 2023, mock_papers = [PastPaper(paper_id=1, subject_id=1, year=2023, board="FBISE")] | len(result) == 1, result[0].subject_id == 1, result[0].year == 2023 | db.execute called once | As expected | Pass |
| Test getting past paper by ID | Mock db, paper_id = 1, mock_paper | Mock db.execute to return mock_result with scalar_one_or_none returning mock_paper; call PastPaperService.get_past_paper_by_id; assert result == mock_paper | paper_id = 1, mock_paper = PastPaper(paper_id=1, subject_id=1, year=2023, board="FBISE") | result == mock_paper | db.execute called once | As expected | Pass |
| Test getting past paper by ID when not found | Mock db, paper_id = 999 | Mock db.execute to return mock_result with scalar_one_or_none returning None; call PastPaperService.get_past_paper_by_id; assert result is None | paper_id = 999 | result is None | db.execute called once | As expected | Pass |
| Test updating a past paper | Mock db, paper_id = 1, updates, mock_paper | Mock db.execute for select, mock commit and refresh; call PastPaperService.update_past_paper; assert result.year == 2024, result.board == "Updated Board" | paper_id = 1, updates = PastPaperUpdate(year=2024, board="Updated Board"), mock_paper = PastPaper(paper_id=1, subject_id=1, year=2023, board="FBISE") | result.year == 2024, result.board == "Updated Board", db.commit called once, db.refresh called once | Mock operations verified | As expected | Pass |
| Test updating a past paper that doesn't exist | Mock db, paper_id = 999, updates | Mock db.execute to return None; call PastPaperService.update_past_paper; assert result is None | paper_id = 999, updates = PastPaperUpdate(year=2024) | result is None | db.execute called once | As expected | Pass |
| Test deleting a past paper | Mock db, paper_id = 1, mock_paper | Mock db.execute for select, mock delete and commit; call PastPaperService.delete_past_paper; assert result is True | paper_id = 1, mock_paper = PastPaper(paper_id=1, subject_id=1, year=2023, board="FBISE") | result is True, db.delete called once with mock_paper, db.commit called once | Mock operations verified | As expected | Pass |
| Test deleting a past paper that doesn't exist | Mock db, paper_id = 999 | Mock db.execute to return None; call PastPaperService.delete_past_paper; assert result is False | paper_id = 999 | result is False | db.execute called once | As expected | Pass |
| Test getting paper statistics | Mock db, paper_id = 1, mock_paper, mock_questions | Mock db.execute for paper and questions; call PastPaperService.get_paper_statistics; assert result["paper_id"] == 1, etc. | paper_id = 1, mock_paper = PastPaper(...), mock_questions = [PastPaperQuestion(...)] | result["paper_id"] == 1, result["total_questions"] == 3, result["total_marks"] == 9.0, etc. | Mock operations verified | As expected | Pass |
| Test getting topic distribution | Mock db, subject_id = 1, mock_papers, mock_questions | Mock db.execute for papers and questions; call PastPaperService.get_topic_distribution; assert result["subject_id"] == 1, etc. | subject_id = 1, mock_papers = [...], mock_questions = [...] | result["subject_id"] == 1, result["total_topics"] == 2, etc. | Mock operations verified | As expected | Pass |
| Test getting marks by topic | Mock db, subject_id = 1, mock_papers, mock_questions | Mock db.execute for papers and questions; call PastPaperService.get_marks_by_topic; assert result["subject_id"] == 1, etc. | subject_id = 1, mock_papers = [...], mock_questions = [...] | result["subject_id"] == 1, result["total_marks"] == 35.0, etc. | Mock operations verified | As expected | Pass |
| Test recording performance | Mock db, performance_service, performance_data | Mock db.add, commit, refresh; call performance_service.record_performance; assert result properties | performance_data = PerformanceCreate(user_id=1, subject_id=1, question_id=1, user_answer="Answer", is_correct=True, time_taken=10.0, score_percentage=100.0) | result.user_id == 1, result.is_correct == True, db.add called once, etc. | Mock operations verified | As expected | Pass |
| Test evaluating correct MCQ answer | Mock db, performance_service, user_id = 1, answer_submission, mock_question | Mock db.execute for question, mock record_performance; call evaluate_answer; assert result.is_correct is True, etc. | user_id = 1, answer_submission = QuestionAnswerSubmission(question_id=1, user_answer="A", time_taken=5.0), mock_question = GeneratedQuestion(correct_answer="A", question_type="MCQ", ...) | result.is_correct is True, result.score_percentage == 100.0, record_performance called once | Mock operations verified | As expected | Pass |
| Test evaluating incorrect MCQ answer | Mock db, performance_service, user_id = 1, answer_submission, mock_question | Mock db.execute for question, mock record_performance; call evaluate_answer; assert result.is_correct is False, etc. | user_id = 1, answer_submission = QuestionAnswerSubmission(question_id=1, user_answer="B", time_taken=5.0), mock_question = GeneratedQuestion(correct_answer="A", question_type="MCQ", ...) | result.is_correct is False, result.score_percentage == 0.0, record_performance called once | Mock operations verified | As expected | Pass |
| Test evaluating short question answer | Mock db, performance_service, user_id = 1, answer_submission, mock_question | Mock db.execute for question, mock record_performance; call evaluate_answer; assert result.is_correct is True | user_id = 1, answer_submission = QuestionAnswerSubmission(question_id=1, user_answer="The answer is correct", time_taken=10.0), mock_question = GeneratedQuestion(correct_answer="correct", question_type="Short", ...) | result.is_correct is True, result.score_percentage == 100.0, record_performance called once | Mock operations verified | As expected | Pass |
| Test evaluating answer when question not found | Mock db, performance_service, user_id = 1, answer_submission | Mock db.execute to return None; call evaluate_answer; expect ValueError | user_id = 1, answer_submission = QuestionAnswerSubmission(question_id=999, user_answer="Answer", time_taken=5.0) | raises ValueError with message "Question not found" | db.execute called once | As expected | Pass |
| Test getting user analytics with performances | Mock db, performance_service, user_id = 1, mock_performances | Mock db.execute to return mock_performances; call get_user_analytics; assert result.total_attempts == 2, etc. | user_id = 1, mock_performances = [StudentPerformance(...), ...] | result.total_attempts == 2, result.correct_answers == 1, result.accuracy_percentage == 50.0, etc. | db.execute called once | As expected | Pass |
| Test getting user analytics with no performances | Mock db, performance_service, user_id = 1 | Mock db.execute to return empty list; call get_user_analytics; assert result.total_attempts == 0, etc. | user_id = 1 | result.total_attempts == 0, result.correct_answers == 0, result.accuracy_percentage == 0.0, etc. | db.execute called once | As expected | Pass |
| Test getting user performance history | Mock db, performance_service, user_id = 1, days = 30 | Mock db.execute to return mock_performances; call get_user_performance_history; assert len(result) == 1 | user_id = 1, days = 30, mock_performances = [StudentPerformance(...)] | len(result) == 1, result[0].user_id == 1 | db.execute called once | As expected | Pass |
| Test admin registration | Mock db, user_service, admin_data | Mock password hash, db operations; call create_user; assert result properties | admin_data = UserCreate(name="Admin User", email="admin@example.com", password="admin123", role="admin", class_level=None) | result.name == "Admin User", result.email == "admin@example.com", result.role == "admin", password_hash == "hashed_pw", db operations called | Mock operations verified | As expected | Pass |
| Test admin login success | Mock db, user_service, email, password, mock_admin_user | Patch verify_password to True; mock get_user_by_email; call authenticate_user; assert result == mock_admin_user | email = "admin@example.com", password = "adminpassword123", mock_admin_user = User(...) | result == mock_admin_user, get_user_by_email called, verify_password called | Mock operations verified | As expected | Pass |
| Test admin login invalid password | Mock db, user_service, email, password, mock_admin_user | Patch verify_password to False; mock get_user_by_email; call authenticate_user; assert result is None | email = "admin@example.com", password = "wrongpassword", mock_admin_user = User(...) | result is None, get_user_by_email called, verify_password called | Mock operations verified | As expected | Pass |
| Test creating a new user | Mock db, user_service, user_data | Mock db operations; call create_user; assert result properties | user_data = UserCreate(name="Test User", email="test@example.com", password="password123", role="student", class_level="10") | result.name == "Test User", result.email == "test@example.com", result.role == "student", result.class_level == "10", db operations called | Mock operations verified | As expected | Pass |
| Test getting user by ID | Mock db, user_service, user_id = 1, mock_user | Mock db.execute to return mock_user; call get_user_by_id; assert result == mock_user | user_id = 1, mock_user = User(...) | result == mock_user, db.execute called once | db.execute called once | As expected | Pass |
| Test getting user by ID when not found | Mock db, user_service, user_id = 999 | Mock db.execute to return None; call get_user_by_id; assert result is None | user_id = 999 | result is None, db.execute called once | db.execute called once | As expected | Pass |
| Test successful user authentication | Mock db, user_service, email, password, mock_user | Patch verify_password to True; mock get_user_by_email; call authenticate_user; assert result == mock_user | email = "test@example.com", password = "password123", mock_user = User(...) | result == mock_user, get_user_by_email called, verify_password called | Mock operations verified | As expected | Pass |
| Test authentication with invalid password | Mock db, user_service, email, password, mock_user | Patch verify_password to False; mock get_user_by_email; call authenticate_user; assert result is None | email = "test@example.com", password = "wrong_password", mock_user = User(...) | result is None, get_user_by_email called, verify_password called | Mock operations verified | As expected | Pass |
| Test updating user information | Mock db, user_service, user_id = 1, update_data, mock_user | Mock get_user_by_id to return mock_user, mock db commit and refresh; call update_user; assert result.name == "Updated Name", etc. | user_id = 1, update_data = UserUpdate(name="Updated Name", email="updated@example.com"), mock_user = User(...) | result.name == "Updated Name", result.email == "updated@example.com", db.commit called once, db.refresh called once | Mock operations verified | As expected | Pass |
| Test updating user that doesn't exist | Mock db, user_service, user_id = 999, update_data | Mock get_user_by_id to return None; call update_user; assert result is None | user_id = 999, update_data = UserUpdate(name="Updated Name") | result is None | get_user_by_id called once | As expected | Pass |
| Test retrieving all users | Mock db, user_service, mock_users | Mock db.execute to return mock_users; call get_users; assert len(result) == 2, assert result == mock_users | mock_users = [User(user_id=1, ...), User(user_id=2, ...)] | len(result) == 2, result == mock_users | db.execute called once | As expected | Pass |
| Test deactivating a user | Mock db, user_service, user_id = 1, mock_user | Mock get_user_by_id to return mock_user, mock db commit; call deactivate_user; assert result is True, assert mock_user.is_active == 0 | user_id = 1, mock_user = User(is_active=1, ...) | result is True, mock_user.is_active == 0, db.commit called once | Mock operations verified | As expected | Pass |
| Test deactivating a user that doesn't exist | Mock db, user_service, user_id = 999 | Mock get_user_by_id to return None; call deactivate_user; assert result is False | user_id = 999 | result is False | get_user_by_id called once | As expected | Pass |

## Recommendation Engine Enhancement

The `/recommendations` endpoint has been upgraded to:

### Previous Implementation
- Accepted a list of questions as query parameters
- Predicted topics for provided questions only
- Limited to user-provided data

### Updated Implementation 
- **Fully Automated**: No need to provide questions
- **Comprehensive Analysis**: Analyzes ALL past papers for the given class and subject
- **Intelligent Aggregation**: Uses confidence-weighted prediction scoring
- **Rich Recommendations**: Returns top 15 topics with textbook materials
- **Detailed Reporting**: Includes:
  - Number of past papers analyzed
  - Total questions processed
  - Unique topics identified
  - Topic frequency and confidence scores
  - Matched textbook chapters with page numbers

### Request/Response Example

**Request:**
```bash
POST /api/predictions/recommendations?class_level=10&subject_id=1
```

**Response:**
```json
{
  "class_level": "10",
  "subject_id": 1,
  "past_papers_analyzed": 5,
  "total_questions_analyzed": 87,
  "unique_topics_found": 12,
  "recommendations": [
    {
      "topic_name": "Photosynthesis",
      "prediction_score": 4.85,
      "frequency": 8,
      "avg_confidence": 0.92,
      "chapters": [
        {
          "chapter_name": "Chapter 5: Plant Nutrition",
          "chunk_id": "chunk_123",
          "page_start": 45,
          "page_end": 52,
          "content_preview": "Photosynthesis is the process..."
        }
      ]
    }
  ]
}
```

## Running Tests
To execute the test suite:
```bash
python -m pytest tests/ -v
```

For coverage report (if pytest-cov is installed):
```bash
python -m pytest tests/ --cov=app --cov-report=html
```

For specific test file:
```bash
python -m pytest tests/test_prediction_service.py -v
```
