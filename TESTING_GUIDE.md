# Testing Guide

## Test Coverage Overview

The project has comprehensive unit tests covering all critical functionality.

### Test Statistics
- **Total Tests**: 59
- **Pass Rate**: 100% 
- **Test Files**: 6
- **Lines of Test Code**: 1200+

---

## Test Files

### 1. `test_auth_admin.py` (9 tests)
Tests authentication and admin authorization.

**Tests**:
-  JWT token creation
-  Valid token authentication
-  Invalid token rejection
-  Non-existent user handling
-  Admin user access grant
-  Student user access denial
-  Non-admin role access denial
-  Upload endpoint admin requirement
-  Upload endpoint admin allowance

**Key Coverage**:
- JWT token validation
- Role-based access control (RBAC)
- 403 Forbidden for non-admin users
- 401 Unauthorized for invalid tokens

### 2. `test_past_paper_upload.py` (11 tests)
Tests the PDF upload and question extraction pipeline.

**Tests**:
-  Subject validation success
-  Subject not found handling
-  Database error handling
-  Invalid subject PDF processing rejection
-  No questions extracted handling
-  **Embedding validation (mandatory check)**
-  Successful PDF processing with embeddings
-  File saving to temp location
-  Temp file cleanup
-  Non-existent file cleanup
-  Error handling during cleanup

**Key Coverage**:
- Class/subject validation
- **Mandatory embedding requirement**
- PDF processing pipeline
- File operations and cleanup
- Error messages and validation

### 3. `test_past_paper_question.py` (7 tests)
Tests question management operations.

**Tests**:
-  Get all questions
-  Get question by ID
-  Get non-existent question (404)
-  Update question
-  Update non-existent question (404)
-  Delete question
-  Delete non-existent question (404)

**Key Coverage**:
- CRUD operations for questions
- Database queries
- Error handling for missing records

### 4. `test_past_paper_service.py` (11 tests)
Tests past paper service operations.

**Tests**:
-  Get all past papers
-  Get past papers with filters
-  Get past paper by ID
-  Get non-existent past paper (404)
-  Update past paper
-  Update non-existent past paper (404)
-  Delete past paper
-  Delete non-existent past paper (404)
-  Get paper statistics
-  Get topic distribution
-  Get marks by topic

**Key Coverage**:
- Complete CRUD operations
- Filtering and querying
- Analytics calculations
- Statistics generation

### 5. `test_user_service.py` (13 tests)
Tests user authentication and management.

**Tests**:
-  Admin registration
-  Admin login success
-  Admin login invalid password
-  Create user
-  Get user by ID
-  Get non-existent user (404)
-  Authenticate user success
-  Authenticate user invalid password
-  Update user
-  Update non-existent user (404)
-  Get all users
-  Deactivate user
-  Deactivate non-existent user (404)

**Key Coverage**:
- User authentication
- Admin management
- Password hashing
- User CRUD operations

### 6. `test_performance_service.py` (8 tests)
Tests performance tracking and analytics.

**Tests**:
-  Record performance
-  Evaluate correct MCQ answer
-  Evaluate incorrect MCQ answer
-  Evaluate short question
-  Evaluate non-existent question (404)
-  Get user analytics with data
-  Get user analytics without data
-  Get user performance history

**Key Coverage**:
- Performance recording
- Answer evaluation
- Analytics calculation
- History tracking

---

## Running Tests

### All Tests
```bash
python -m pytest tests/ -v
```

### Specific Test File
```bash
python -m pytest tests/test_auth_admin.py -v
python -m pytest tests/test_past_paper_upload.py -v
```

### Specific Test
```bash
python -m pytest tests/test_auth_admin.py::test_get_admin_user_success -v
```

### With Coverage Report
```bash
python -m pytest tests/ --cov=app --cov-report=html
# Opens coverage report in htmlcov/index.html
```

### Quiet Output
```bash
python -m pytest tests/ -q
```

### Stop on First Failure
```bash
python -m pytest tests/ -x
```

### Show Print Statements
```bash
python -m pytest tests/ -v -s
```

---

## Test Implementation Details

### Mocking Patterns

**AsyncMock for Async Functions**:
```python
@pytest.mark.asyncio
async def test_async_function(mock_db):
    mock_db.execute = AsyncMock(return_value=...)
    result = await service.method(mock_db)
    assert result == expected
```

**Mocking Database Queries**:
```python
mock_result = MagicMock()
mock_result.scalar_one_or_none.return_value = mock_subject
mock_db.execute.return_value = mock_result
```

**Patching External Services**:
```python
with patch('app.services.past_paper_upload.RobustPastPaperProcessor') as mock_processor:
    mock_instance = MagicMock()
    mock_instance.process_single_paper.return_value = {...}
    mock_processor.return_value = mock_instance
```

### Fixtures

**Mock Database**:
```python
@pytest.fixture
def mock_db():
    return AsyncMock(spec=AsyncSession)
```

**Mock Users**:
```python
@pytest.fixture
def mock_admin_user():
    return User(
        user_id=1,
        role="admin",
        email="admin@example.com"
    )
```

---

## Critical Tests

### Admin Authorization 
```bash
python -m pytest tests/test_auth_admin.py::test_upload_endpoint_requires_admin -v
```
Ensures only admins can upload past papers.

### Embedding Validation 
```bash
python -m pytest tests/test_past_paper_upload.py::test_process_past_paper_pdf_missing_embedding -v
```
Ensures all questions have mandatory embeddings.

### Subject Validation 
```bash
python -m pytest tests/test_past_paper_upload.py::test_validate_class_and_subject_not_found -v
```
Ensures subject existence before processing.

---

## Test-Driven Development

### Before Making Changes
1. Run relevant tests to confirm they pass
2. Identify which tests would fail if change is made
3. Make the change
4. Run tests again to verify

### Example Workflow
```bash
# Before change
python -m pytest tests/test_auth_admin.py -v
# All tests pass 

# Make change to security logic
# vi app/core/security.py

# After change
python -m pytest tests/test_auth_admin.py -v
# Verify tests still pass 
```

---

## Debugging Tests

### Print Debug Info
```bash
python -m pytest tests/test_file.py::test_name -v -s
# -s shows print statements
```

### Verbose Traceback
```bash
python -m pytest tests/test_file.py::test_name -v --tb=long
```

### Drop into Debugger
```python
import pdb; pdb.set_trace()

@pytest.mark.asyncio
async def test_example():
    # code...
    pdb.set_trace()  # Debug here
    # code...
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - run: pip install -r app/requirements.txt
      - run: python -m pytest tests/ -v
```

---

## Best Practices

1. **Always Mock External Services**
   - Don't call real APIs in tests
   - Don't write to actual files
   - Don't use real database

2. **Use Fixtures for Setup**
   - Reusable test data
   - Consistent mocking
   - Clean test code

3. **Test One Thing**
   - Each test tests one behavior
   - Clear test names
   - Easy to debug failures

4. **Test Edge Cases**
   - Invalid input
   - Missing data
   - Error conditions
   - Boundary values

5. **Keep Tests Fast**
   - Mock slow operations
   - Use unit tests (not integration tests)
   - Parallel test execution

6. **Document Complex Tests**
   - Add comments for unclear logic
   - Explain mocking strategy
   - Document expected behavior

---

## Test Metrics

### Code Coverage Goals
- **Target**: 80%+ coverage
- **Current**: See `htmlcov/index.html` after running with `--cov`

### Test Execution Time
- **Total**: ~12 seconds (all 59 tests)
- **Per Test**: ~200ms average
- **Target**: Keep under 30 seconds

### Test Reliability
- **Flakiness**: 0% (deterministic)
- **Isolation**:  Each test is independent
- **Repeatability**:  Same results every run

---

## Troubleshooting

### Import Errors
```
ImportError: cannot import name 'function'
```
**Solution**: Ensure function exists in service file and hasn't been renamed/deleted

### Mock Attribute Errors
```
AttributeError: Mock object has no attribute 'X'
```
**Solution**: Add attribute to mock before using it
```python
mock_obj = MagicMock()
mock_obj.file = MagicMock()
```

### Async Test Failures
```
RuntimeError: no running event loop
```
**Solution**: Add `@pytest.mark.asyncio` decorator to async tests

### Database Transaction Errors
```
sqlalchemy.exc.InvalidRequestError
```
**Solution**: Use AsyncMock for db operations, don't use real database

---

## Running Tests Locally vs CI

### Local Machine
```bash
# Activate venv
python -m pytest tests/ -v
```

### Docker Container
```bash
docker run -it -v $(pwd):/app myapp python -m pytest tests/ -v
```

### GitHub Actions
Automatically runs on push/PR to main branch

---

## Test Reports

### Generate HTML Report
```bash
python -m pytest tests/ --cov=app --cov-report=html
# Open: htmlcov/index.html
```

### Generate JSON Report
```bash
python -m pytest tests/ --json-report --json-report-file=report.json
```

### Terminal Summary
```bash
python -m pytest tests/ -v --tb=short
```

Shows summary of passes/failures/errors

---

## What to Test Next

1. **Integration Tests**
   - Full API endpoint testing
   - Database transactions
   - Real file uploads

2. **Load Testing**
   - Multiple concurrent uploads
   - Database performance
   - Memory usage

3. **End-to-End Tests**
   - Full user workflows
   - Admin panels
   - Client applications

---

**Last Updated**: December 10, 2025  
**Test Framework**: pytest + pytest-asyncio  
**Database**: AsyncSession (mocked in tests)
