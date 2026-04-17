import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import {
  questionService,
  GeneratedQuestionItem,
  DifficultyUi,
  RetrievalSourceItem,
  mergeRetrievalSources,
} from '../../services/questionService';
import { usePrepParams } from '../../hooks/usePrepParams';
import { colors, radii } from '../../theme/colors';
import QuestionPracticeCard from '../../components/QuestionPracticeCard';

export default function PracticeSetupScreen() {
  const router = useRouter();
  const { subjectName, board, classLevel } = usePrepParams();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyUi>('Medium');
  const [mcqCount, setMcqCount] = useState('8');
  const [shortCount, setShortCount] = useState('8');
  const [longCount, setLongCount] = useState('4');
  const [loading, setLoading] = useState(false);

  const [mcqs, setMcqs] = useState<GeneratedQuestionItem[]>([]);
  const [shortQuestions, setShortQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [longQuestions, setLongQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [retrievalSources, setRetrievalSources] = useState<RetrievalSourceItem[]>([]);

  const difficulties: DifficultyUi[] = ['Easy', 'Medium', 'Hard'];

  const parseCount = (label: string, value: string): number | null => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n < 0 || n > 50) {
      Alert.alert(label, 'Enter a valid number between 0 and 50.');
      return null;
    }
    return n;
  };

  const generateAll = async () => {
    if (!topic.trim()) {
      Alert.alert('Topic', 'Enter a topic first.');
      return;
    }

    const mcq = parseCount('MCQs count', mcqCount);
    if (mcq === null) return;
    const short = parseCount('Short questions count', shortCount);
    if (short === null) return;
    const long = parseCount('Long questions count', longCount);
    if (long === null) return;

    if (mcq + short + long === 0) {
      Alert.alert('Question counts', 'Set at least one question count greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const jobs: Promise<{ questions: GeneratedQuestionItem[]; retrieval_sources: RetrievalSourceItem[] }>[] = [];

      if (mcq > 0) {
        jobs.push(
          questionService.generateQuestions({
            board,
            class_level: classLevel,
            subject: subjectName,
            topic: topic.trim(),
            difficulty,
            qtype: 'MCQ',
            exam_type: 'board',
            num_questions: mcq,
          })
        );
      } else {
        jobs.push(Promise.resolve({ questions: [], retrieval_sources: [] }));
      }

      if (short > 0) {
        jobs.push(
          questionService.generateQuestions({
            board,
            class_level: classLevel,
            subject: subjectName,
            topic: topic.trim(),
            difficulty,
            qtype: 'Short',
            exam_type: 'board',
            num_questions: short,
          })
        );
      } else {
        jobs.push(Promise.resolve({ questions: [], retrieval_sources: [] }));
      }

      if (long > 0) {
        jobs.push(
          questionService.generateQuestions({
            board,
            class_level: classLevel,
            subject: subjectName,
            topic: topic.trim(),
            difficulty,
            qtype: 'Long',
            exam_type: 'board',
            num_questions: long,
          })
        );
      } else {
        jobs.push(Promise.resolve({ questions: [], retrieval_sources: [] }));
      }

      const [mcqRes, shortRes, longRes] = await Promise.all(jobs);

      setMcqs(mcqRes.questions);
      setShortQuestions(shortRes.questions);
      setLongQuestions(longRes.questions);
      setRetrievalSources(
        mergeRetrievalSources(mcqRes.retrieval_sources, shortRes.retrieval_sources, longRes.retrieval_sources)
      );

      if (mcqRes.questions.length + shortRes.questions.length + longRes.questions.length === 0) {
        Alert.alert('No questions', 'Try a different topic or check backend generation settings.');
      }
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setTopic('');
    setDifficulty('Medium');
    setMcqCount('8');
    setShortCount('8');
    setLongCount('4');
    setMcqs([]);
    setShortQuestions([]);
    setLongQuestions([]);
    setRetrievalSources([]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.gradientStart, colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerSub}>{subjectName}</Text>
            <Text style={styles.headerTitle}>Practice Setup</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.panel}>
            <InputField
              label="Topic"
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g. Photosynthesis, chemical bonding..."
              appearance="dark"
            />
            <InputField
              label="MCQs count"
              value={mcqCount}
              onChangeText={setMcqCount}
              placeholder="8"
              keyboardType="number-pad"
              appearance="dark"
            />
            <InputField
              label="Short questions count"
              value={shortCount}
              onChangeText={setShortCount}
              placeholder="8"
              keyboardType="number-pad"
              appearance="dark"
            />
            <InputField
              label="Long questions count"
              value={longCount}
              onChangeText={setLongCount}
              placeholder="4"
              keyboardType="number-pad"
              appearance="dark"
            />
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.diffRow}>
              {difficulties.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.diffBtn, difficulty === level && styles.diffBtnOn]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[styles.diffTxt, difficulty === level && styles.diffTxtOn]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <PrimaryButton
              title={loading ? 'Generating…' : 'Generate Practice Set'}
              onPress={generateAll}
              disabled={loading || !topic.trim()}
              loading={loading}
              color={colors.primary}
            />
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingTxt}>Generating your practice set…</Text>
            </View>
          )}

          {(mcqs.length > 0 || shortQuestions.length > 0 || longQuestions.length > 0) && !loading && (
            <View style={styles.results}>
              <View style={styles.resultsHead}>
                <Text style={styles.resultsTitle}>
                  Practice set ({mcqs.length + shortQuestions.length + longQuestions.length})
                </Text>
                <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                  <Trash2 size={18} color={colors.danger} />
                  <Text style={styles.clearTxt}>Clear</Text>
                </TouchableOpacity>
              </View>

              {mcqs.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>MCQs ({mcqs.length})</Text>
                  {mcqs.map((q, i) => (
                    <QuestionPracticeCard
                      key={`mcq-${q.question_id}`}
                      item={q}
                      index={i}
                      accentColor={colors.primary}
                      retrievalSources={retrievalSources}
                    />
                  ))}
                </>
              )}

              {shortQuestions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Short Questions ({shortQuestions.length})</Text>
                  {shortQuestions.map((q, i) => (
                    <QuestionPracticeCard
                      key={`short-${q.question_id}`}
                      item={q}
                      index={i}
                      accentColor={colors.success}
                      retrievalSources={retrievalSources}
                    />
                  ))}
                </>
              )}

              {longQuestions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Long Questions ({longQuestions.length})</Text>
                  {longQuestions.map((q, i) => (
                    <QuestionPracticeCard
                      key={`long-${q.question_id}`}
                      item={q}
                      index={i}
                      accentColor="#8B5CF6"
                      retrievalSources={retrievalSources}
                    />
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerSub: { color: colors.textMuted, fontSize: 12 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  scroll: { flex: 1, paddingHorizontal: 18 },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  diffBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
  },
  diffBtnOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  diffTxt: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  diffTxtOn: { color: colors.text },
  loadingBox: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  loadingTxt: { color: colors.textMuted, fontSize: 14 },
  results: { paddingBottom: 40 },
  resultsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearTxt: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
});

