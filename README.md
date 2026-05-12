
# PrepifyAI Backend

AI-Powered Preparation Assistant for FBISE Matric FSc and Entry Tests (MDCAT, ECAT)

## Features

- **User Management**: Registration, authentication, and profile management
- **Past Paper Upload**: Admin-only PDF upload with automatic question extraction and embedding generation
- **Question Generation**: AI-powered question generation from textbook content
- **Performance Tracking**: Comprehensive analytics and progress monitoring
- **Feedback System**: Quality control and continuous improvement
- **Prediction Engine**: Topic prediction based on past paper analysis
- **Admin Dashboard**: Content management and system monitoring

## Tech Stack

- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Primary database with pgvector extension
- **SQLAlchemy**: ORM with async support
- **Pinecone**: Vector database for semantic search
- **Tesseract**: OCR for document processing
- **sentence-transformers**: Embedding generation (all-MiniLM-L6-v2)
- **PyPDF2 & pdf2image**: PDF processing and text extraction
- **PyJWT**: JWT token authentication

## Setup

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (for pgvector PostgreSQL)
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Create virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment: `cp .env.example .env` and edit with your settings
6. Start Docker database:
   ```bash
   docker-compose up -d
   docker exec prepifyai_postgres psql -U postgres -d PrepifyAI_Main -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```
7. Initialize database schema:
   ```bash
   cd app
   python ../app/init_db_docker.py
   ```
8. Run: `uvicorn app.main:app --reload`

### Docker Database

The project uses containerized PostgreSQL with pgvector extension:
- **Container**: `pgvector/pgvector:pg16`
- **Port**: 5433 (mapped from 5432)
- **Database**: PrepifyAI_Main
- **Extension**: pgvector enabled for 384-dimensional embeddings


## Unit Testing

### Running Tests
```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_past_paper_upload.py -v
python -m pytest tests/test_auth_admin.py -v

# Run specific test case
python -m pytest tests/test_auth_admin.py::test_get_admin_user_success -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

### Test Files
- `test_auth_admin.py` - Authentication and admin authorization (9 tests)
- `test_past_paper_upload.py` - PDF upload, validation, embedding checks (11 tests)
- `test_past_paper_question.py` - Question management (7 tests)
- `test_past_paper_service.py` - Past paper service operations (11 tests)
- `test_user_service.py` - User authentication and management (13 tests)
- `test_performance_service.py` - Performance tracking (8 tests)

### Test Coverage
- **Total**: 61 tests, all passing 
- **Admin Auth**: JWT validation, role-based access control
- **Upload System**: Subject validation, embedding generation, file handling
- **Question Management**: CRUD operations for questions
- **Performance**: Analytics and tracking
- **Prediction Service**: DistilBERT topic prediction model loading and initialization


## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

- AWS Free Tier backend deployment guide: `AWS_FREE_TIER_DEPLOYMENT_GUIDE.md`
- Production environment template: `app/.env.production.example`

## Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Past Papers (Admin Only)
- `POST /api/v1/past-papers/upload` - Upload past paper PDF (extracts questions with embeddings)
- `GET /api/v1/past-papers/manage` - Get all past papers
- `GET /api/v1/past-papers/manage/{paper_id}` - Get specific past paper
- `PUT /api/v1/past-papers/manage/{paper_id}` - Update past paper
- `DELETE /api/v1/past-papers/manage/{paper_id}` - Delete past paper

### Questions
- `GET /api/v1/past-paper-questions` - Get all questions
- `GET /api/v1/past-paper-questions/{question_id}` - Get specific question
- `PUT /api/v1/past-paper-questions/{question_id}` - Update question
- `DELETE /api/v1/past-paper-questions/{question_id}` - Delete question
- `POST /api/v1/questions/generate` - Generate questions
- `POST /api/v1/questions/answer` - Submit answer

### Performance
- `GET /api/v1/performance/analytics` - User analytics

### Predictions (Topic Recommendation Engine)
- `GET /api/predictions/status` - Check if prediction service is ready
- `POST /api/predictions/topics` - Predict topics for a single question
- `POST /api/predictions/batch` - Predict topics for multiple questions
- `POST /api/predictions/recommendations` - Get topic recommendations for upcoming exam (uses ALL past papers)
- `GET /api/predictions/model-info` - Get information about trained DistilBERT models

### Admin
- `POST /api/v1/admin/upload-textbook` - Upload content
