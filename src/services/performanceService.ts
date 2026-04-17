import { apiClient } from './api';

export interface PerformanceSummary {
  total_attempts: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_time: number | null;
  strong_topics: string[];
  weak_topics: string[];
  subject_wise_performance: Record<string, number>;
  recent_trend: string;
}

export interface TopicPerformanceRow {
  topic_name: string;
  attempts: number;
  correct: number;
  accuracy: number;
  avg_score: number;
  avg_time: number;
}

export interface PerformanceByTopicResponse {
  topics: TopicPerformanceRow[];
}

export const performanceService = {
  getSummary: async (subjectId?: number): Promise<PerformanceSummary> => {
    const q =
      subjectId !== undefined ? `?subject_id=${encodeURIComponent(String(subjectId))}` : '';
    return apiClient.get(`/performance/summary${q}`, true);
  },

  getByTopic: async (subjectId: number): Promise<PerformanceByTopicResponse> => {
    return apiClient.get(
      `/performance/by-topic?subject_id=${encodeURIComponent(String(subjectId))}`,
      true
    );
  },
};
