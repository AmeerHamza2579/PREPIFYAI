# Backend Deployment & Optimization Notes

## Run locally

```powershell
cd "c:\Users\user\Desktop\FYP-Backend-main"
.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

## Recommended production command

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

## Environment

- Ensure `DATABASE_URL` and `GROQ_API_KEY` are set.
- Optional: set `BOOKS_CHUNKS_PATH` for retriever context file.

## Optimizations already included

- Lazy Groq client initialization.
- Retriever warmup thread on app startup.
- Reduced retriever context `k` for faster generation.
- Semantic + keyword scoring for short answers with partial marks.

## Suggested next optimizations

- Cache generated question batches per `(subject, topic, difficulty, exam_type)`.
- Add DB indexes:
  - `student_performance(user_id, subject_id, attempted_on)`
  - `generated_questions(subject_id, difficulty_level, created_at)`
- Add request-level timeouts/retries for external LLM calls.

## Migration + smoke checklist

1. Apply migrations:

```powershell
cd "c:\Users\user\Desktop\FYP-Backend-main"
.\venv\Scripts\python -m alembic -c app/alembic.ini upgrade head
```

2. Restart API server.
3. Verify in `/docs`:
   - `/api/v1/questions/generate-questions/`
   - `/api/v1/questions/submit-answer/`
   - `/api/v1/questions/explain-answer/`
   - `/api/v1/performance/*`
   - `/api/v1/adaptive/next-question`
   - `/api/v1/trends/*`
   - `/api/v1/sync/*`

