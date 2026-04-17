import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Atom,
  FlaskConical,
  Microscope,
  Monitor,
  AlertCircle,
  Sigma,
} from 'lucide-react-native';
import { subjectService } from '../../services/subjectService';

// Icon and color configuration for subjects
const subjectConfig: {
  [key: string]: {
    icon: any;
    color: string;
    bgColor: string;
  };
} = {
  'Computer': {
    icon: Monitor,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  'Computer Science': {
    icon: Monitor,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  'Biology': {
    icon: Microscope,
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  'Chemistry': {
    icon: FlaskConical,
    color: '#8B5CF6',
    bgColor: '#E9D5FF',
  },
  'Physics': {
    icon: Atom,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  'Mathematics': {
    icon: Sigma,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  'Math': {
    icon: Sigma,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
};

/** When subject_name is not an exact map key (e.g. "MDCAT Biology", "ECAT English"). */
const DEFAULT_SUBJECT_STYLE = {
  icon: BookOpen,
  color: '#4B5563',
  bgColor: '#F3F4F6',
};

/** Longer phrases first so "Computer Science" wins over "Computer". */
const SUBJECT_KEYWORD_TO_CONFIG_KEY = [
  'Computer Science',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Computer',
  'Math',
] as const;

function resolveSubjectStyle(subjectName: string) {
  const trimmed = subjectName.trim();
  if (subjectConfig[trimmed]) {
    return subjectConfig[trimmed];
  }
  const lower = trimmed.toLowerCase();
  for (const key of SUBJECT_KEYWORD_TO_CONFIG_KEY) {
    if (lower.includes(key.toLowerCase())) {
      return subjectConfig[key];
    }
  }
  return DEFAULT_SUBJECT_STYLE;
}

// UI-formatted subject
interface UISubject {
  id: number;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  board: string;
  classLevel: string;
}

export default function SubjectSelectionScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<UISubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  /**
   * Fetch subjects from backend
   */
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // No filters: API returns every subject row (all class_level + board values).
      const backendSubjects = await subjectService.getSubjects();

      const uiSubjects: UISubject[] = backendSubjects
        .map((subject) => {
          const config = resolveSubjectStyle(subject.subject_name);
          return {
            id: subject.subject_id,
            name: subject.subject_name,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            board: subject.board,
            classLevel: subject.class_level,
          };
        })
        .sort((a, b) => {
          const byBoard = a.board.localeCompare(b.board);
          if (byBoard !== 0) return byBoard;
          const ca = parseInt(String(a.classLevel), 10);
          const cb = parseInt(String(b.classLevel), 10);
          let byClass = 0;
          if (Number.isFinite(ca) && Number.isFinite(cb) && ca !== cb) {
            byClass = ca - cb;
          } else {
            byClass = String(a.classLevel).localeCompare(String(b.classLevel));
          }
          if (byClass !== 0) return byClass;
          return a.name.localeCompare(b.name);
        });

      setSubjects(uiSubjects);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      setError(error.message || 'Failed to load subjects');
      
      // Show error alert
      Alert.alert(
        'Error Loading Subjects',
        'Could not load subjects. Please check your connection and try again.',
        [
          {
            text: 'Retry',
            onPress: fetchSubjects,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject: UISubject) => {
    // Navigate to question type selection with subject info
    router.push({
      pathname: '/prepare-with-ai/question-type',
      params: {
        subjectId: String(subject.id),
        subjectName: subject.name,
        board: subject.board,
        classLevel: subject.classLevel,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prepare with AI</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <BookOpen size={24} color="#2563EB" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Select Your Subject</Text>
              <Text style={styles.infoText}>
                Board exams (FBISE, etc.), MDCAT, and ECAT subjects from your
                catalog — tap a card to practice with that book’s content.
              </Text>
            </View>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading subjects...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <AlertCircle size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Failed to Load Subjects</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={fetchSubjects}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Subjects Grid */}
          {!loading && !error && subjects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All subjects (every class)</Text>
              <View style={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <Pressable
                    key={`${subject.id}-${subject.board}-${subject.classLevel}`}
                    onPress={() => handleSubjectSelect(subject)}
                    style={({ pressed }) => [
                      styles.subjectCard,
                      pressed && styles.subjectCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.subjectIconContainer,
                        { backgroundColor: subject.bgColor },
                      ]}
                    >
                      <subject.icon size={32} color={subject.color} />
                    </View>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectDescription}>
                      {subject.board} • Class {subject.classLevel}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* No Subjects State */}
          {!loading && !error && subjects.length === 0 && (
            <View style={styles.emptyContainer}>
              <BookOpen size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Subjects Available</Text>
              <Text style={styles.emptyText}>
                No subjects in the catalog yet. Please contact support.
              </Text>
            </View>
          )}

          {/* Tips Section */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>
                • Choose topics you need to practice
              </Text>
              <Text style={styles.tipItem}>
                • Start with easier difficulty levels
              </Text>
              <Text style={styles.tipItem}>
                • Review explanations for wrong answers
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  subjectCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  subjectIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subjectDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

