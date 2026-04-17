import { apiClient } from './api';

export interface TopicPrediction {
  topic_name: string;
  confidence: number;
  label_id: number;
}

export interface TopicPredictionResponse {
  predicted_topics: TopicPrediction[];
  top_prediction: string;
  confidence: number;
  distilbert_version: string;
}

export interface PredictionStatus {
  status: string;
  available_classes: string[];
  device: string;
  models_loaded: number;
  prediction_mode: string;
}

export const predictionService = {
  getStatus: async (): Promise<PredictionStatus> => {
    return apiClient.get('/predictions/status', false);
  },

  /**
   * POST /predictions/topics — requires student auth.
   */
  predictTopics: async (params: {
    class_level: string;
    subject_id: number;
    question_text: string;
    top_k?: number;
    confidence_threshold?: number;
  }): Promise<TopicPredictionResponse> => {
    return apiClient.post(
      '/predictions/topics',
      {
        class_level: params.class_level,
        subject_id: params.subject_id,
        question_text: params.question_text,
        top_k: params.top_k ?? 5,
        confidence_threshold: params.confidence_threshold ?? 0.1,
      },
      true
    );
  },
};
