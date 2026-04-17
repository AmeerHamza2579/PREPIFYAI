import os
from typing import Optional

from app.core.config import settings
from app.utils.retriever import retrieve_context


class ChatbotService:
    @staticmethod
    def _get_groq_client():
        from groq import Groq

        key = (getattr(settings, "GROQ_API_KEY", None) or os.environ.get("GROQ_API_KEY") or "").strip()
        if not key:
            return None
        return Groq(api_key=key)

    @staticmethod
    def _build_query(message: str, subject: Optional[str], topic: Optional[str]) -> str:
        parts = []
        if subject:
            parts.append(f"Subject: {subject}")
        if topic:
            parts.append(f"Topic: {topic}")
        parts.append(f"Question: {message}")
        return " | ".join(parts)

    @staticmethod
    def ask(message: str, subject: Optional[str] = None, topic: Optional[str] = None, history=None) -> dict:
        query = ChatbotService._build_query(message, subject, topic)
        context = retrieve_context(topic or message, k=5)
        context_preview = (context or "")[:700]

        client = ChatbotService._get_groq_client()
        if client is None:
            fallback_reply = (
                "I can help with your study question. "
                "Right now the LLM key is not configured, so I am using textbook context only.\n\n"
                f"Based on available context: {context_preview[:500]}"
            )
            return {
                "reply": fallback_reply,
                "used_model": "fallback_context",
                "context_used": context_preview,
            }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are PrepifyAI study assistant. Explain in clear student-friendly language, "
                    "avoid fabricating facts, and stay grounded in provided context when possible."
                ),
            }
        ]

        for turn in (history or [])[-8:]:
            role = (turn.get("role") or "").strip().lower()
            content = (turn.get("content") or "").strip()
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

        messages.append(
            {
                "role": "user",
                "content": (
                    f"{query}\n\n"
                    f"Context:\n{context_preview}\n\n"
                    "Answer concisely, and if context is weak, say so."
                ),
            }
        )

        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3,
            max_tokens=700,
        )
        reply = (resp.choices[0].message.content or "").strip()

        return {
            "reply": reply or "I could not generate a response.",
            "used_model": "groq_llm",
            "context_used": context_preview,
        }
