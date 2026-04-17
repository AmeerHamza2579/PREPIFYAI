import pytest
from unittest.mock import AsyncMock, MagicMock, patch, mock_open
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from io import BytesIO

from app.services.past_paper_upload import PastPaperUploadService
from app.schemas.past_paper_upload import PastPaperUploadRequest
from app.models import Subject, PastPaper, PastPaperQuestion


@pytest.fixture
def mock_db():
    """Fixture to mock AsyncSession"""
    db = AsyncMock(spec=AsyncSession)
    return db


@pytest.fixture
def sample_upload_request():
    """Fixture for sample upload request"""
    return PastPaperUploadRequest(
        class_level="10",
        board="FBISE",
        subject_name="Biology",
        year=2023
    )


@pytest.fixture
def mock_subject():
    """Fixture for mock subject"""
    return Subject(
        subject_id=1,
        class_level="10",
        board="FBISE",
        subject_name="Biology"
    )


@pytest.mark.asyncio
async def test_validate_class_and_subject_success(mock_db, mock_subject):
    """Test successful validation of class and subject"""
    # Mock the database query result
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_subject
    mock_db.execute.return_value = mock_result

    is_valid, subject_id, error_msg = await PastPaperUploadService.validate_class_and_subject(
        mock_db,
        class_level="10",
        board="FBISE",
        subject_name="Biology"
    )

    assert is_valid is True
    assert subject_id == 1
    assert error_msg is None


@pytest.mark.asyncio
async def test_validate_class_and_subject_not_found(mock_db):
    """Test validation failure when subject not found"""
    # Mock the database query result - no subject found
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    is_valid, subject_id, error_msg = await PastPaperUploadService.validate_class_and_subject(
        mock_db,
        class_level="10",
        board="FBISE",
        subject_name="InvalidSubject"
    )

    assert is_valid is False
    assert subject_id is None
    assert "not found" in error_msg


@pytest.mark.asyncio
async def test_validate_class_and_subject_database_error(mock_db):
    """Test validation handles database errors"""
    # Mock database error
    mock_db.execute.side_effect = Exception("Database connection error")

    is_valid, subject_id, error_msg = await PastPaperUploadService.validate_class_and_subject(
        mock_db,
        class_level="10",
        board="FBISE",
        subject_name="Biology"
    )

    assert is_valid is False
    assert subject_id is None
    assert "Error validating" in error_msg


@pytest.mark.asyncio
async def test_process_past_paper_pdf_invalid_subject(mock_db, sample_upload_request):
    """Test that processing fails when subject doesn't exist"""
    # Mock validation failure
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    with pytest.raises(ValueError) as exc_info:
        await PastPaperUploadService.process_past_paper_pdf(
            mock_db,
            "/fake/path/test.pdf",
            sample_upload_request
        )

    assert "not found" in str(exc_info.value)


@pytest.mark.asyncio
async def test_process_past_paper_pdf_no_questions(mock_db, sample_upload_request, mock_subject):
    """Test that processing fails when no questions are extracted"""
    # Mock successful validation
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_subject
    mock_db.execute.return_value = mock_result

    # Mock processor to return no questions
    with patch('app.services.past_paper_upload.RobustPastPaperProcessor') as mock_processor:
        mock_processor_instance = MagicMock()
        mock_processor_instance.process_single_paper.return_value = {
            "questions": []
        }
        mock_processor.return_value = mock_processor_instance

        with pytest.raises(ValueError) as exc_info:
            await PastPaperUploadService.process_past_paper_pdf(
                mock_db,
                "/fake/path/test.pdf",
                sample_upload_request
            )

        assert "No questions could be extracted" in str(exc_info.value)


@pytest.mark.asyncio
async def test_process_past_paper_pdf_missing_embedding(mock_db, sample_upload_request, mock_subject):
    """Test that processing fails when a question has no embedding"""
    # Mock successful validation
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_subject
    mock_db.execute.return_value = mock_result

    # Mock processor to return questions without embeddings
    with patch('app.services.past_paper_upload.RobustPastPaperProcessor') as mock_processor:
        mock_processor_instance = MagicMock()
        mock_processor_instance.process_single_paper.return_value = {
            "questions": [
                {
                    "question_text": "What is photosynthesis?",
                    "question_type": "short",
                    "marks": 2,
                    "embedding": None  # Missing embedding
                }
            ],
            "stats": {"total_questions": 1}
        }
        mock_processor.return_value = mock_processor_instance

        with pytest.raises(ValueError) as exc_info:
            await PastPaperUploadService.process_past_paper_pdf(
                mock_db,
                "/fake/path/test.pdf",
                sample_upload_request
            )

        assert "does not have an embedding" in str(exc_info.value)


@pytest.mark.asyncio
async def test_process_past_paper_pdf_success(mock_db, sample_upload_request, mock_subject):
    """Test successful PDF processing with valid embeddings"""
    # Mock successful validation
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_subject
    mock_db.execute.return_value = mock_result

    # Mock database operations
    mock_db.add = MagicMock()
    mock_db.add_all = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.flush = AsyncMock()
    mock_db.refresh = AsyncMock()

    # Mock past paper with ID
    def set_paper_id(obj):
        obj.paper_id = 123

    mock_db.refresh.side_effect = set_paper_id

    # Mock processor with valid questions
    with patch('app.services.past_paper_upload.RobustPastPaperProcessor') as mock_processor:
        mock_processor_instance = MagicMock()
        mock_processor_instance.process_single_paper.return_value = {
            "questions": [
                {
                    "question_text": "What is photosynthesis?",
                    "question_type": "short",
                    "marks": 2,
                    "embedding": [0.1, 0.2, 0.3, 0.4]  # Valid embedding
                },
                {
                    "question_text": "Define cell",
                    "question_type": "mcq",
                    "marks": 1,
                    "embedding": [0.5, 0.6, 0.7, 0.8]  # Valid embedding
                }
            ],
            "stats": {
                "total_questions": 2,
                "mcqs": 1,
                "short_questions": 1,
                "long_questions": 0
            }
        }
        mock_processor.return_value = mock_processor_instance

        result = await PastPaperUploadService.process_past_paper_pdf(
            mock_db,
            "/fake/path/test.pdf",
            sample_upload_request
        )

        # Assertions
        assert result["paper_id"] == 123
        assert result["subject_id"] == 1
        assert result["total_questions"] == 2
        assert result["mcqs"] == 1
        assert result["short_questions"] == 1
        assert len(result["questions"]) == 2
        
        # Verify embeddings are stored as lists (pgvector format)
        assert isinstance(result["questions"][0]["embedding"], list)
        assert len(result["questions"][0]["embedding"]) == 4  # Test embedding size
        
        # Verify database operations
        mock_db.add.assert_called_once()
        mock_db.add_all.assert_called_once()
        assert mock_db.commit.call_count == 2


def test_save_uploaded_file():
    """Test saving uploaded file to temp location"""
    # Create mock file
    mock_file = MagicMock()
    mock_file.filename = "test_paper.pdf"
    mock_file.file = MagicMock()
    mock_file.file.read.return_value = b"PDF content"

    with patch('builtins.open', mock_open()) as mock_file_open:
        with patch('os.makedirs') as mock_makedirs:
            result_path = PastPaperUploadService.save_uploaded_file(mock_file)

            assert "test_paper.pdf" in result_path
            mock_makedirs.assert_called_once()
            mock_file_open.assert_called_once()


def test_cleanup_temp_file():
    """Test cleaning up temporary file"""
    fake_path = "/fake/path/test.pdf"

    with patch('os.path.exists', return_value=True):
        with patch('os.remove') as mock_remove:
            PastPaperUploadService.cleanup_temp_file(fake_path)
            mock_remove.assert_called_once_with(fake_path)


def test_cleanup_temp_file_not_exists():
    """Test cleaning up non-existent file doesn't raise error"""
    fake_path = "/fake/path/nonexistent.pdf"

    with patch('os.path.exists', return_value=False):
        with patch('os.remove') as mock_remove:
            PastPaperUploadService.cleanup_temp_file(fake_path)
            mock_remove.assert_not_called()


def test_cleanup_temp_file_error_handling():
    """Test cleanup handles errors gracefully"""
    fake_path = "/fake/path/test.pdf"

    with patch('os.path.exists', return_value=True):
        with patch('os.remove', side_effect=Exception("Permission denied")):
            # Should not raise exception
            PastPaperUploadService.cleanup_temp_file(fake_path)
