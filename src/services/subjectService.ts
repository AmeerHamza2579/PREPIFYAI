import { apiClient } from './api';

/**
 * Subject data from backend
 */
export interface Subject {
  subject_id: number;
  class_level: string;
  board: string;
  subject_name: string;
  book_version: string;
}

/**
 * Subject filters
 */
export interface SubjectFilters {
  class_level?: string;
  board?: string;
}

/**
 * Subject Service - Handles subject-related API calls
 */
export const subjectService = {
  /**
   * List subjects. With no `filters`, returns every row (all boards and class levels).
   * Pass `class_level` and/or `board` only when you need a narrowed list.
   */
  getSubjects: async (filters?: SubjectFilters): Promise<Subject[]> => {
    const params = new URLSearchParams();

    if (filters?.class_level) {
      params.append('class_level', filters.class_level);
    }
    if (filters?.board) {
      params.append('board', filters.board);
    }

    const qs = params.toString();
    const path = qs ? `/subjects?${qs}` : '/subjects';
    return await apiClient.get(path, false);
  },

  /**
   * Get subject by ID
   */
  getSubject: async (subjectId: number): Promise<Subject> => {
    return await apiClient.get(`/subjects/${subjectId}`, false);
  },

  /**
   * Full catalog (same as `getSubjects()` with no filters).
   */
  getSubjectsForUser: async (): Promise<Subject[]> => {
    return subjectService.getSubjects();
  },
};

