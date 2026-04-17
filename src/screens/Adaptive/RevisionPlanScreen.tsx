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
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import { colors, radii } from '../../theme/colors';
import { subjectService, Subject } from '../../services/subjectService';
import { adaptiveService, RevisionPlanResponse } from '../../services/adaptiveService';

const HORIZONS = [3, 7, 14, 30];

export default function RevisionPlanScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [horizon, setHorizon] = useState(7);
  const [plan, setPlan] = useState<RevisionPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const loadSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const list = await subjectService.getSubjects();
      setSubjects(list);
      setSubjectId((prev) => (prev === null && list.length ? list[0].subject_id : prev));
    } catch (e: unknown) {
      Alert.alert('Subjects', e instanceof Error ? e.message : 'Could not load');
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const loadPlan = async () => {
    if (subjectId == null) return;
    setLoading(true);
    setPlan(null);
    try {
      const p = await adaptiveService.getRevisionPlan(subjectId, horizon);
      setPlan(p);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not load plan';
      if (/401|login|unauthor/i.test(msg)) {
        Alert.alert('Sign in required', 'Log in to see your revision plan.');
      } else {
        Alert.alert('Revision plan', msg);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Revision plan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loadingSubjects ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.label}>Subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.subject_id}
                    onPress={() => setSubjectId(s.subject_id)}
                    style={[styles.chip, subjectId === s.subject_id && styles.chipOn]}
                  >
                    <Text
                      style={[styles.chipText, subjectId === s.subject_id && styles.chipTextOn]}
                      numberOfLines={1}
                    >
                      {s.subject_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.label}>Plan length (days)</Text>
            <View style={styles.horizonRow}>
              {HORIZONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setHorizon(d)}
                  style={[styles.hChip, horizon === d && styles.hChipOn]}
                >
                  <Text style={[styles.hChipTxt, horizon === d && styles.hChipTxtOn]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={loadPlan}
            disabled={loading || subjectId == null}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CalendarDays size={20} color="#fff" />
                <Text style={styles.btnTxt}>Build plan</Text>
              </>
            )}
          </TouchableOpacity>

          {plan && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Overview</Text>
                {plan.accuracy_percentage != null && (
                  <Text style={styles.summaryLine}>
                    Accuracy: {plan.accuracy_percentage.toFixed(1)}%
                  </Text>
                )}
                <Text style={styles.summaryLine}>Trend: {plan.recent_trend}</Text>
              </View>

              {plan.strategies.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Strategies</Text>
                  {plan.strategies.map((s, i) => (
                    <Text key={i} style={styles.bullet}>
                      • {s}
                    </Text>
                  ))}
                </View>
              )}

              <Text style={styles.sectionTitle}>Daily focus</Text>
              {plan.daily_focus.length === 0 ? (
                <Text style={styles.muted}>No weak topics yet — keep practicing.</Text>
              ) : (
                plan.daily_focus.map((d, i) => (
                  <View key={`${d.topic}-${i}`} style={styles.rowCard}>
                    <Text style={styles.rowTopic}>{d.topic}</Text>
                    <Text style={styles.rowMeta}>
                      Day {(d.day_index % plan.horizon_days) + 1} · {d.priority} · ~{d.suggested_practice_questions} Q
                    </Text>
                    <Text style={styles.rowRationale}>{d.rationale}</Text>
                  </View>
                ))
              )}

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Maintenance</Text>
              {plan.maintenance_topics.length === 0 ? (
                <Text style={styles.muted}>—</Text>
              ) : (
                plan.maintenance_topics.map((m) => (
                  <View key={m.topic} style={styles.rowCard}>
                    <Text style={styles.rowTopic}>{m.topic}</Text>
                    <Text style={styles.rowMeta}>
                      {m.priority} · ~{m.suggested_practice_questions} Q
                    </Text>
                  </View>
                ))
              )}
            </>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textSubtle, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextOn: { color: colors.text },
  horizonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  hChipTxt: { color: colors.text, fontWeight: '600' },
  hChipTxtOn: { color: '#fff' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.lg,
    marginBottom: 20,
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  summaryLine: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  bullet: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: 4 },
  rowCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTopic: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textSubtle, marginTop: 4 },
  rowRationale: { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 18 },
  muted: { color: colors.textMuted, fontSize: 14 },
});
