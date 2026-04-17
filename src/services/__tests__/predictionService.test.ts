import { predictionService } from '../predictionService';
import { apiClient } from '../api';

jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mocked = apiClient as jest.Mocked<typeof apiClient>;

describe('predictionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getStatus calls unauthenticated GET', async () => {
    mocked.get.mockResolvedValue({
      status: 'ready',
      available_classes: ['10'],
      device: 'cpu',
      models_loaded: 1,
      prediction_mode: 'distilbert',
    });
    const s = await predictionService.getStatus();
    expect(mocked.get).toHaveBeenCalledWith('/predictions/status', false);
    expect(s.status).toBe('ready');
  });

  it('predictTopics POSTs body with defaults', async () => {
    mocked.post.mockResolvedValue({
      predicted_topics: [],
      top_prediction: 'X',
      confidence: 0.5,
      distilbert_version: 'test',
    });
    await predictionService.predictTopics({
      class_level: '10',
      subject_id: 3,
      question_text: 'Define photosynthesis in plants.',
    });
    expect(mocked.post).toHaveBeenCalledWith(
      '/predictions/topics',
      expect.objectContaining({
        class_level: '10',
        subject_id: 3,
        question_text: 'Define photosynthesis in plants.',
        top_k: 5,
        confidence_threshold: 0.1,
      }),
      true
    );
  });
});
