"""
Service for handling past paper uploads with PDF processing and question extraction
"""

import os
import tempfile
import logging
from typing import Optional, Dict, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import PastPaper, PastPaperQuestion, Subject
from app.schemas.past_paper_upload import PastPaperUploadRequest
from app.services.embeddingsGen import RobustPastPaperProcessor
from app.core.embedding_storage import embedding_to_storage_format
from app.core.config import settings

logger = logging.getLogger(__name__)


class PastPaperUploadService:
    """Service for managing past paper uploads and question extraction"""

    @staticmethod
    async def validate_class_and_subject(
        db: AsyncSession,
        class_level: str,
        board: str,
        subject_name: str
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """
        Validate if class exists and subject exists for that class.
        
        Returns:
            Tuple of (is_valid, subject_id, error_message)
        """
        try:
            # Check if subject exists with matching class_level, board, and subject_name
            stmt = select(Subject).where(
                Subject.class_level == class_level,
                Subject.board == board,
                Subject.subject_name == subject_name
            )
            result = await db.execute(stmt)
            subject = result.scalar_one_or_none()

            if not subject:
                error_msg = (
                    f"Subject '{subject_name}' not found for "
                    f"class {class_level}, board {board}"
                )
                logger.warning(error_msg)
                return False, None, error_msg

            logger.info(
                f"Validated subject: {subject.subject_name} "
                f"(ID: {subject.subject_id}) for class {class_level}"
            )
            return True, subject.subject_id, None

        except Exception as e:
            error_msg = f"Error validating class and subject: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg

    @staticmethod
    async def process_past_paper_pdf(
        db: AsyncSession,
        file_path: str,
        upload_data: PastPaperUploadRequest
    ) -> Dict:
        """
        Process a PDF file and extract questions with embeddings.
        
        Steps:
        1. Validate class and subject exist
        2. Extract text from PDF using OCR if needed
        3. Parse questions (MCQ, Short, Long)
        4. Generate embeddings for each question
        5. Save to database
        
        Returns:
            Dictionary with processed data and statistics
        """
        try:
            # Step 1: Validate class and subject
            logger.info(
                f"Validating class {upload_data.class_level} "
                f"and subject {upload_data.subject_name}"
            )
            is_valid, subject_id, error_msg = await PastPaperUploadService.validate_class_and_subject(
                db,
                upload_data.class_level,
                upload_data.board,
                upload_data.subject_name
            )

            if not is_valid:
                raise ValueError(error_msg)

            # Step 2: Initialize processor and extract questions
            logger.info(f"Initializing PDF processor for file: {file_path}")
            processor = RobustPastPaperProcessor()

            logger.info("Processing PDF and extracting questions...")
            processed_data = processor.process_single_paper(
                file_path,
                paper_id=1,  # Temporary, will be replaced with DB ID
                output_dir=None  # Don't save to file, we're storing in DB
            )

            if not processed_data or not processed_data.get("questions"):
                raise ValueError("No questions could be extracted from the PDF")

            # Validate that all questions have embeddings
            logger.info("Validating embeddings for all questions...")
            for idx, q in enumerate(processed_data["questions"], start=1):
                if not q.get("embedding"):
                    raise ValueError(
                        f"Question {idx} does not have an embedding. "
                        "All questions must have embeddings."
                    )
            logger.info("All questions have valid embeddings")

            # Step 3: Create PastPaper record
            logger.info(f"Creating past paper record in database...")
            past_paper = PastPaper(
                subject_id=subject_id,
                year=upload_data.year,
                board=upload_data.board
            )
            db.add(past_paper)
            await db.flush()  # Flush to get the paper_id
            await db.commit()
            await db.refresh(past_paper)

            paper_id = past_paper.paper_id
            logger.info(f"Created past paper with ID: {paper_id}")

            # Step 4: Process and save questions
            logger.info(f"Processing {len(processed_data['questions'])} questions...")
            questions_to_save = []
            
            for idx, q in enumerate(processed_data["questions"], start=1):
                past_paper_question = PastPaperQuestion(
                    paper_id=paper_id,
                    question_text=q.get("question_text", ""),
                    question_type=q.get("question_type", "unknown"),
                    marks=q.get("marks", 1),
                    embedding=embedding_to_storage_format(q["embedding"])  # Convert to storage format (pgvector or JSON)
                )
                questions_to_save.append(past_paper_question)

            db.add_all(questions_to_save)
            await db.commit()
            logger.info(f"Saved {len(questions_to_save)} questions to database")

            # Step 5: Prepare response
            stats = processed_data.get("stats", {})
            response = {
                "paper_id": paper_id,
                "subject_id": subject_id,
                "class_level": upload_data.class_level,
                "board": upload_data.board,
                "subject_name": upload_data.subject_name,
                "year": upload_data.year,
                "total_questions": stats.get("total_questions", 0),
                "mcqs": stats.get("mcqs", 0),
                "short_questions": stats.get("short_questions", 0),
                "long_questions": stats.get("long_questions", 0),
                "questions": [
                    {
                        "question_text": q.get("question_text", ""),
                        "question_type": q.get("question_type", "unknown"),
                        "marks": q.get("marks", 1),
                        "embedding": q["embedding"]  # Mandatory
                    }
                    for q in processed_data["questions"]
                ]
            }

            logger.info(f"Past paper processing completed successfully")
            return response

        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Error processing past paper PDF: {str(e)}")
            raise

    @staticmethod
    def save_uploaded_file(uploaded_file) -> str:
        """
        Save uploaded file to temporary location.
        
        Returns:
            Path to saved file
        """
        try:
            # Validate file size before writing to disk.
            uploaded_file.file.seek(0, 2)
            file_size = uploaded_file.file.tell()
            uploaded_file.file.seek(0)
            if file_size > settings.MAX_FILE_SIZE:
                max_mb = settings.MAX_FILE_SIZE // (1024 * 1024)
                raise ValueError(
                    f"File is too large ({file_size // (1024 * 1024)} MB). "
                    f"Maximum allowed size is {max_mb} MB."
                )

            # Create temp directory if it doesn't exist
            temp_dir = tempfile.gettempdir()
            upload_dir = os.path.join(temp_dir, "past_papers")
            os.makedirs(upload_dir, exist_ok=True)

            # Save file
            file_path = os.path.join(upload_dir, uploaded_file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(uploaded_file.file.read())

            logger.info(f"File saved to: {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            raise

    @staticmethod
    def cleanup_temp_file(file_path: str) -> None:
        """Remove temporary file after processing"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Error cleaning up temporary file: {str(e)}")
