import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Animated,
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
} from '../../services/questionService';
import { usePrepParams } from '../../hooks/usePrepParams';
import { colors, radii } from '../../theme/colors';
import { extractMcqCorrectLetter, parseMcqFromText } from '../../utils/mcqParse';

function MCQOptionButton(props: {
  letter: string;
  text: string;
  status: 'idle' | 'correct' | 'wrong';
  disabled: boolean;
  onPress: () => void;
}) {
  const { letter, text, status, disabled, onPress } = props;
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'idle') return;
    anim.setValue(1);
    Animated.spring(anim, {
      toValue: 1.02,
      friction: 4,
      useNativeDriver: false,
    }).start();
  }, [status, anim]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => {
        const base = [styles.optionBtn, { transform: [{ scale: anim }] as any }];
        const bg =
          status === 'correct'
            ? 'rgba(52, 211, 153, 0.18)'
            : status === 'wrong'
              ? 'rgba(248, 113, 113, 0.18)'
              : colors.bgElevated;
        const border =
          status === 'correct'
            ? colors.success
            : status === 'wrong'
              ? colors.danger
              : colors.border;
        return [
          ...base,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity: disabled ? 0.92 : 1,
          },
        ];
      }}
    >
      <Text style={styles.optionLetter}>
        {letter}.
      </Text>
      <Text style={styles.optionText}>{text}</Text>
    </Pressable>
  );
}

export default function GenerateMCQsScreen() {
  const router = useRouter();
  const { subjectName, board, classLevel } = usePrepParams();

  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('8');
  const [difficulty, setDifficulty] = useState<DifficultyUi>('Medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<Record<number, string>>({});
  const [lockedMap, setLockedMap] = useState<Record<number, boolean>>({});

  const difficulties: DifficultyUi[] = ['Easy', 'Medium', 'Hard'];

  const generateQuestions = async () => {
    if (!topic.trim()) {
      Alert.alert('Topic', 'Enter a topic to generate questions.');
      return;
    }
    const requested = Number.parseInt(numQuestions, 10);
    if (!Number.isFinite(requested) || requested < 1 || requested > 50) {
      Alert.alert('Question count', 'Enter a valid number between 1 and 50.');
      return;
    }
    setLoading(true);
    try {
      const { questions: list } = await questionService.generateQuestions({
        board,
        class_level: classLevel,
        subject: subjectName,
        topic: topic.trim(),
        difficulty,
        qtype: 'MCQ',
        exam_type: 'board',
        num_questions: requested,
      });
      setQuestions(list);
      if (list.length === 0) {
        Alert.alert('No questions', 'Try another topic or check the API / GROQ_API_KEY on the server.');
        return;
      }
      setSelectedLetters({});
      setLockedMap({});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      Alert.alert('Could not generate', msg);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setQuestions([]);
    setTopic('');
    setNumQuestions('8');
    setDifficulty('Medium');
    setSelectedLetters({});
    setLockedMap({});
  };

  const onSelectOption = (questionId: number, letter: string) => {
    if (lockedMap[questionId]) return;
    setSelectedLetters((prev) => ({ ...prev, [questionId]: letter }));
    setLockedMap((prev) => ({ ...prev, [questionId]: true }));
  };

  const summary = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    let score = 0;
    for (const q of questions) {
      const parsed = parseMcqFromText(q.question);
      if (!parsed) continue;
      const correctLetter = extractMcqCorrectLetter(q.answer ?? '', parsed.options);
      const selected = selectedLetters[q.question_id];
      if (!selected) continue;
      attempted += 1;
      if (correctLetter && selected === correctLetter) {
        correct += 1;
        score += q.marks && q.marks > 0 ? q.marks : 1;
      }
    }
    return { attempted, correct, score, total: questions.length };
  }, [questions, selectedLetters]);

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
            <Text style={styles.headerTitle}>MCQs</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.panel}>
            <InputField
              label="Topic"
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g. Photosynthesis, chemical bonding…"
              appearance="dark"
            />
            <InputField
              label="How many MCQs?"
              value={numQuestions}
              onChangeText={setNumQuestions}
              placeholder="8"
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
              title={loading ? 'Generating…' : 'Generate MCQs'}
              onPress={generateQuestions}
              disabled={loading || !topic.trim()}
              loading={loading}
              color={colors.primary}
            />
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingTxt}>Generating via backend…</Text>
            </View>
          )}

          {questions.length > 0 && !loading && (
            <View style={styles.quizWrap}>
              <View style={styles.resultsHead}>
                <Text style={styles.resultsTitle}>
                  MCQs ({questions.length})
                </Text>
                <TouchableOpacity onPress={clearResults} style={styles.clearBtn}>
                  <Trash2 size={18} color={colors.danger} />
                  <Text style={styles.clearTxt}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.resultBox}>
                <Text style={styles.resultBig}>Score: {summary.score} pts</Text>
                <Text style={styles.resultSmall}>
                  Correct: {summary.correct} / {summary.total} | Attempted: {summary.attempted}
                </Text>
              </View>

              {questions.map((q, idx) => {
                const parsed = parseMcqFromText(q.question);
                const options = parsed?.options.filter((o) => ['A', 'B', 'C', 'D'].includes(o.letter)) ?? [];
                const correctLetter = parsed ? extractMcqCorrectLetter(q.answer ?? '', parsed.options) : null;
                const selectedLetter = selectedLetters[q.question_id] ?? null;
                const locked = !!lockedMap[q.question_id];

                return (
                  <View style={styles.card} key={q.question_id}>
                    <Text style={styles.practiceHint}>Question {idx + 1}</Text>
                    <Text style={styles.qText}>{parsed?.stem ? parsed.stem : q.question}</Text>

                    {options.length > 0 ? (
                      <View style={styles.optionsWrap}>
                        {options.map((opt) => {
                          const isSelected = selectedLetter === opt.letter;
                          const isCorrectOpt = !!correctLetter && opt.letter === correctLetter;
                          const status: 'idle' | 'correct' | 'wrong' =
                            !locked ? 'idle' : isCorrectOpt ? 'correct' : isSelected ? 'wrong' : 'idle';
                          return (
                            <MCQOptionButton
                              key={`${q.question_id}-${opt.letter}`}
                              letter={opt.letter}
                              text={opt.text}
                              status={status}
                              disabled={locked}
                              onPress={() => onSelectOption(q.question_id, opt.letter)}
                            />
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.errorTxt}>Could not parse MCQ options. Please regenerate questions.</Text>
                    )}

                    {locked && (
                      <Text style={[styles.feedbackTxt, selectedLetter === correctLetter ? styles.ok : styles.bad]}>
                        {selectedLetter === correctLetter ? 'Correct!' : 'Incorrect'}
                      </Text>
                    )}
                  </View>
                );
              })}
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
  resultsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearTxt: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  quizWrap: { paddingBottom: 40 },
  practiceHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  qText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 14,
  },

  optionsWrap: {
    gap: 10 as any,
    marginBottom: 8,
  },

  optionBtn: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },

  optionLetter: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '900',
    minWidth: 26,
  },

  optionText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    fontWeight: '600',
  },

  feedbackTxt: { fontSize: 14, fontWeight: '900', marginTop: 8, marginBottom: 10 },
  ok: { color: colors.success },
  bad: { color: colors.danger },

  nextWrap: { marginTop: 10 },

  progressRow: { height: 10, marginTop: 12, backgroundColor: colors.bgElevated, borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.primaryMuted },

  errorTxt: { color: colors.warning, fontSize: 13, marginTop: 10, fontWeight: '700' },

  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  resultBig: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  resultSmall: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
});
