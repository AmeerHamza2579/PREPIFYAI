import React, { useCallback, useEffect, useState } from 'react';
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
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { colors, radii } from '../../theme/colors';
import { subjectService, Subject } from '../../services/subjectService';
import {
  adaptiveService,
  mapAdaptiveToGeneratedItem,
  AdaptiveNextQuestionResponse,
} from '../../services/adaptiveService';
import QuestionPracticeCard from '../../components/QuestionPracticeCard';

export default function AdaptiveNextScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [next, setNext] = useState<AdaptiveNextQuestionResponse | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const loadSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const list = await subjectService.getSubjects();
      setSubjects(list);
      setSubjectId((prev) => (prev === null && list.length ? list[0].subject_id : prev));
    } catch (e: unknown) {
      Alert.alert('Subjects', e instanceof Error ? e.message : 'Could not load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const fetchNext = async () => {
    if (subjectId == null) {
      Alert.alert('Subject', 'Select a subject first.');
      return;
    }
    setLoadingNext(true);
    setNext(null);
    try {
      const row = await adaptiveService.getNextQuestion(subjectId);
      setNext(row);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not load question';
      if (/401|login|unauthor/i.test(msg)) {
        Alert.alert('Sign in required', 'Log in to use adaptive practice.');
      } else {
        Alert.alert('Adaptive', msg);
      }
    } finally {
      setLoadingNext(false);
    }
  };

  const selected = subjects.find((s) => s.subject_id === subjectId);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smart practice</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            One question at a time, chosen from your recent accuracy. Sign in to submit answers.
          </Text>

          {loadingSubjects ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.label}>Subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.subject_id}
                    onPress={() => setSubjectId(s.subject_id)}
                    style={[
                      styles.chip,
                      subjectId === s.subject_id && styles.chipOn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        subjectId === s.subject_id && styles.chipTextOn,
                      ]}
                      numberOfLines={1}
                    >
                      {s.subject_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {selected && (
                <Text style={styles.meta}>
                  {selected.board} · Class {selected.class_level}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryWrap}
            onPress={fetchNext}
            disabled={loadingNext || subjectId == null}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd]}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loadingNext ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.primaryTxt}>Get next question</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {next && (
            <QuestionPracticeCard
              item={mapAdaptiveToGeneratedItem(next)}
              index={0}
              accentColor={colors.accent}
              presentation={next.question_type === 'MCQ' ? 'mcq' : 'freeform'}
            />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scroll: { padding: 20, paddingBottom: 48 },
  lead: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textSubtle, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  chipsRow: { flexGrow: 0, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200,
  },
  chipOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextOn: { color: colors.text },
  meta: { color: colors.textSubtle, fontSize: 12 },
  primaryWrap: { marginBottom: 20, borderRadius: radii.lg, overflow: 'hidden' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
