# app/utils/retriever.py – FAISS + SentenceTransformer context retrieval (PrepifyAI pipeline)
import json
import logging
import os

# Path to books_chunks.json (set BOOKS_CHUNKS_PATH env to override)
_BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.environ.get(
    "BOOKS_CHUNKS_PATH",
    os.path.join(_BASE, "FYP_JSON_DATASET", "FYP_JSON_DATASET", "books_chunks.json"),
)

_chunks = []
_texts = []
_index = None
_model = None
_use_faiss = False


def warmup():
    """Call from app startup (e.g. in a background thread) to preload model + FAISS so first request is fast."""
    _ensure_faiss_loaded()


def _ensure_faiss_loaded():
    """Build FAISS index from books_chunks.json when available (lazy load)."""
    global _chunks, _texts, _index, _model, _use_faiss
    if _index is not None:
        return
    if _use_faiss:
        return
    if not os.path.isfile(DATA_PATH):
        return
    try:
        import faiss
        from sentence_transformers import SentenceTransformer
    except ImportError:
        return
    try:
        # Suppress verbose HF/transformers load output (BertModel LOAD REPORT, progress bars)
        logging.getLogger("transformers").setLevel(logging.ERROR)
        logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
        _prev = os.environ.get("TRANSFORMERS_VERBOSITY")
        os.environ["TRANSFORMERS_VERBOSITY"] = "error"
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _chunks = json.load(f)
            _texts = [c.get("text", "") for c in _chunks if c.get("text")]
            if not _texts:
                return
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            embeddings = _model.encode(_texts, convert_to_numpy=True, show_progress_bar=False)
            dimension = embeddings.shape[1]
            _index = faiss.IndexFlatL2(dimension)
            _index.add(embeddings)
            _use_faiss = True
        finally:
            if _prev is None:
                os.environ.pop("TRANSFORMERS_VERBOSITY", None)
            else:
                os.environ["TRANSFORMERS_VERBOSITY"] = _prev
    except Exception:
        _use_faiss = True  # so we don't retry on error


def retrieve_context_and_sources(topic: str, k: int = 5) -> tuple[str, list[dict]]:
    """
    One FAISS encode + search: returns (context string for LLM, source previews for API).
    Avoids doubling retrieval work when both RAG context and transparency previews are needed.
    """
    _ensure_faiss_loaded()
    topic_q = (topic or "").strip() or "general"
    k = max(1, min(int(k), 50))

    if _index is not None and _texts and _model is not None:
        query_embedding = _model.encode([topic_q], convert_to_numpy=True)
        _, I = _index.search(query_embedding, min(k, len(_texts)))
        texts_sel: list[str] = []
        sources: list[dict] = []
        for idx in I[0]:
            i = int(idx)
            if i < 0 or i >= len(_texts):
                continue
            t = _texts[i]
            if (t or "").strip():
                texts_sel.append(t)
            chunk_obj = _chunks[i] if i < len(_chunks) else None
            tstrip = (t or "").strip()
            if not tstrip:
                continue
            preview = tstrip[:280] + ("…" if len(tstrip) > 280 else "")
            meta = chunk_obj if isinstance(chunk_obj, dict) else {}
            sources.append(
                {
                    "chunk_index": i,
                    "preview": preview,
                    "topic": meta.get("topic") or meta.get("topic_name"),
                    "source_tag": meta.get("source") or meta.get("book") or meta.get("chapter_name"),
                }
            )
        ctx = "\n".join(texts_sel) if texts_sel else f"Topic: {topic_q}."
        if not sources:
            sources.append(
                {
                    "chunk_index": -1,
                    "preview": f"No indexed book chunks loaded. Topic query: {topic_q[:120]}",
                    "topic": None,
                    "source_tag": None,
                }
            )
        return ctx, sources

    ctx = retrieve_context(topic_q, k=k)
    srcs = list_retrieval_sources(topic_q, k=k)
    return ctx, srcs


def retrieve_context(topic: str, k: int = 8) -> str:
    """
    Retrieve context for the topic using FAISS + SentenceTransformer when books_chunks.json exists.
    Otherwise return topic-only fallback.
    """
    _ensure_faiss_loaded()
    if _index is not None and _texts and _model is not None:
        query_embedding = _model.encode([topic], convert_to_numpy=True)
        _, I = _index.search(query_embedding, min(k, len(_texts)))
        context = [_texts[idx] for idx in I[0] if idx < len(_texts)]
        return "\n".join(context) if context else f"Topic: {topic}."
    # Fallback: simple file read without FAISS
    if os.path.isfile(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            texts = [c.get("text", "") for c in chunks if c.get("text")][:k]
            return "\n".join(texts) if texts else f"Topic: {topic}."
        except Exception:
            pass
    return f"Topic: {topic}. (Add books_chunks.json at {DATA_PATH} for context.)"


def list_retrieval_sources(topic: str, k: int = 5) -> list[dict]:
    """
    Return lightweight previews of chunks used for RAG (transparency in API/UI).
    Each item: chunk_index, preview (~280 chars), optional topic/source_tag from JSON.
    """
    _ensure_faiss_loaded()
    out: list[dict] = []

    def _append_meta(idx: int, text: str, chunk_obj: dict | None) -> None:
        text = (text or "").strip()
        if not text:
            return
        preview = text[:280] + ("…" if len(text) > 280 else "")
        meta = chunk_obj or {}
        out.append(
            {
                "chunk_index": int(idx),
                "preview": preview,
                "topic": meta.get("topic") or meta.get("topic_name"),
                "source_tag": meta.get("source") or meta.get("book") or meta.get("chapter_name"),
            }
        )

    if _index is not None and _texts and _model is not None:
        query_embedding = _model.encode([topic], convert_to_numpy=True)
        _, I = _index.search(query_embedding, min(k, len(_texts)))
        for idx in I[0]:
            if idx >= len(_texts):
                continue
            chunk_obj = _chunks[idx] if idx < len(_chunks) else None
            if isinstance(chunk_obj, dict):
                _append_meta(int(idx), _texts[idx], chunk_obj)
            else:
                _append_meta(int(idx), _texts[idx], None)
        return out

    if os.path.isfile(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            for i, c in enumerate(chunks[:k]):
                if not isinstance(c, dict):
                    continue
                t = c.get("text", "")
                _append_meta(i, str(t), c)
        except Exception:
            pass

    if not out:
        out.append(
            {
                "chunk_index": -1,
                "preview": f"No indexed book chunks loaded. Topic query: {topic[:120]}",
                "topic": None,
                "source_tag": None,
            }
        )
    return out
