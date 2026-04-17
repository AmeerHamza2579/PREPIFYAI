import { apiClient } from './api';

export type DifficultyUi = 'Easy' | 'Medium' | 'Hard';

export interface GeneratedQuestionItem {
  question_id: number;
  question_number: number;
  question: string;
  marks: number;
  answer: string;
}

/** Chunk previews returned with POST /questions/generate-questions/ (RAG transparency). */
export interface RetrievalSourceItem {
  chunk_index: number;
  preview: string;
  topic?: string | null;
  source_tag?: string | null;
}

export interface GenerateQuestionsResult {
  questions: GeneratedQuestionItem[];
  retrieval_sources: RetrievalSourceItem[];
}

export function mergeRetrievalSources(...lists: RetrievalSourceItem[][]): RetrievalSourceItem[] {
  const seen = new Set<string>();
  const out: RetrievalSourceItem[] = [];
  for (const list of lists) {
    for (const s of list) {
      const k = `${s.chunk_index}:${(s.preview || '').slice(0, 64)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

export interface GenerateQuestionsPayload {
  board: string;
  class_level: string;
  subject: string;
  topic: string;
  difficulty: DifficultyUi;
  qtype: 'MCQ' | 'Short' | 'Long';
  exam_type?: 'board' | 'mdcat' | 'ecat';
  num_questions: number;
}

function difficultyToApi(d: DifficultyUi): 'easy' | 'medium' | 'hard' {
  if (d === 'Easy') return 'easy';
  if (d === 'Hard') return 'hard';
  return 'medium';
}

function qtypeToApi(q: 'MCQ' | 'Short' | 'Long'): string {
  if (q === 'MCQ') return 'mcq';
  if (q === 'Long') return 'long';
  return 'short';
}

/**
 * Maps backend POST /questions/generate-questions/
 */
export const questionService = {
  generateQuestions: async (
    payload: GenerateQuestionsPayload
  ): Promise<GenerateQuestionsResult> => {
    const body = {
      board: payload.board,
      class_level: payload.class_level,
      subject: payload.subject,
      topic: payload.topic,
      difficulty: difficultyToApi(payload.difficulty),
      qtype: qtypeToApi(payload.qtype),
      exam_type: payload.exam_type ?? 'board',
      num_questions: payload.num_questions,
    };

    const res = await apiClient.post('/questions/generate-questions/', body, false);
    const list = res?.questions;
    const rawSources = res?.retrieval_sources;
    const retrieval_sources = Array.isArray(rawSources)
      ? (rawSources as RetrievalSourceItem[])
      : [];
    if (!Array.isArray(list)) {
      return { questions: [], retrieval_sources };
    }
    return { questions: list as GeneratedQuestionItem[], retrieval_sources };
  },

  /** POST /questions/submit-answer/ — requires auth; records performance + grading. */
  submitAnswer: async (params: {
    question_id: number;
    user_answer: string;
    time_taken?: number;
    mode?: 'auto' | 'key' | 'ai';
  }): Promise<QuestionAnswerResult> => {
    return apiClient.post(
      '/questions/submit-answer/',
      {
        question_id: params.question_id,
        user_answer: params.user_answer.trim(),
        time_taken: params.time_taken,
        mode: params.mode ?? 'auto',
      },
      true
    );
  },

  /** POST /questions/explain-answer/ — richer tutor-style explanation (Groq when configured). */
  explainAnswer: async (
    question_id: number,
    student_answer?: string
  ): Promise<ExplainAnswerResult> => {
    return apiClient.post(
      '/questions/explain-answer/',
      {
        question_id,
        student_answer: student_answer?.trim() ? student_answer.trim() : null,
      },
      true
    );
  },
};

export interface QuestionAnswerResult {
  is_correct: boolean;
  score_percentage: number;
  score_marks?: number | null;
  max_marks?: number | null;
  explanation?: string | null;
  correct_answer: string;
  gamification?: unknown;
}

export interface ExplainAnswerResult {
  question_id: number;
  model_answer: string;
  explanation: string;
  missing_points: string[];
}
