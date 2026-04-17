import { apiClient } from './api';
import type { GeneratedQuestionItem } from './questionService';

export interface AdaptiveNextQuestionResponse {
  question_id: number;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  marks: number;
  options: unknown;
  correct_answer?: string;
  source: string;
}

export interface RevisionPlanDayFocus {
  day_index: number;
  topic: string;
  priority: string;
  suggested_practice_questions: number;
  rationale: string;
}

export interface RevisionPlanResponse {
  subject_id: number;
  horizon_days: number;
  accuracy_percentage: number | null;
  recent_trend: string;
  weak_topics: string[];
  strong_topics: string[];
  daily_focus: RevisionPlanDayFocus[];
  maintenance_topics: { topic: string; suggested_practice_questions: number; priority: string }[];
  strategies: string[];
}

export function mapAdaptiveToGeneratedItem(row: AdaptiveNextQuestionResponse): GeneratedQuestionItem {
  return {
    question_id: row.question_id,
    question_number: 1,
    question: row.question_text,
    marks: row.marks ?? 0,
    answer: row.correct_answer ?? '',
  };
}

export const adaptiveService = {
  getNextQuestion: async (
    subjectId: number,
    topicName?: string
  ): Promise<AdaptiveNextQuestionResponse> => {
    const q = new URLSearchParams({ subject_id: String(subjectId) });
    if (topicName?.trim()) q.set('topic_name', topicName.trim());
    return apiClient.get(`/adaptive/next-question?${q.toString()}`, true);
  },

  getRevisionPlan: async (
    subjectId: number,
    horizonDays: number = 7
  ): Promise<RevisionPlanResponse> => {
    const q = new URLSearchParams({
      subject_id: String(subjectId),
      horizon_days: String(Math.min(30, Math.max(1, horizonDays))),
    });
    return apiClient.get(`/adaptive/revision-plan?${q.toString()}`, true);
  },
};
