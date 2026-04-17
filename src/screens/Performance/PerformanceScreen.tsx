import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Target, Clock, BookMarked } from 'lucide-react-native';
import { colors, radii } from '../../theme/colors';
import {
  performanceService,
  PerformanceSummary,
  TopicPerformanceRow,
} from '../../services/performanceService';
import { subjectService, Subject } from '../../services/subjectService';

export default function PerformanceScreen() {
  const router = useRouter();
  const [data, setData] = useState<PerformanceSummary | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicSubjectId, setTopicSubjectId] = useState<number | null>(null);
  const [topics, setTopics] = useState<TopicPerformanceRow[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setError(null);
    try {
      const s = await performanceService.getSummary();
      setData(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load performance');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const list = await subjectService.getSubjects();
      setSubjects(list);
      setTopicSubjectId((prev) => {
        if (prev !== null) return prev;
        return list.length ? list[0].subject_id : null;
      });
    } catch {
      setSubjects([]);
    }
  }, []);

  const loadTopics = useCallback(async (subjectId: number) => {
    setTopicsLoading(true);
    try {
      const res = await performanceService.getByTopic(subjectId);
      setTopics(res.topics || []);
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadSummary(), loadSubjects()]);
  }, [loadSummary, loadSubjects]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (topicSubjectId != null) {
      loadTopics(topicSubjectId);
    } else {
      setTopics([]);
    }
  }, [topicSubjectId, loadTopics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    if (topicSubjectId != null) await loadTopics(topicSubjectId);
    setRefreshing(false);
  }, [loadAll, loadTopics, topicSubjectId]);

  const trendColor =
    data?.recent_trend === 'improving'
      ? colors.success
      : data?.recent_trend === 'declining'
        ? colors.danger
        : colors.warning;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
          }
        >
          {loading && !data ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.muted}>Loading your stats…</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.card}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadAll} style={styles.retry}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {data ? (
            <>
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>Accuracy</Text>
                <Text style={styles.heroValue}>
                  {data.accuracy_percentage.toFixed(1)}%
                </Text>
                <View style={styles.heroRow}>
                  <View style={styles.miniStat}>
                    <Target size={18} color={colors.accent} />
                    <Text style={styles.miniVal}>{data.total_attempts}</Text>
                    <Text style={styles.miniLbl}>Attempts</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <TrendingUp size={18} color={colors.success} />
                    <Text style={styles.miniVal}>{data.correct_answers}</Text>
                    <Text style={styles.miniLbl}>Correct</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Clock size={18} color={colors.warning} />
                    <Text style={styles.miniVal}>
                      {data.average_time != null ? `${data.average_time.toFixed(0)}s` : '—'}
                    </Text>
                    <Text style={styles.miniLbl}>Avg time</Text>
                  </View>
                </View>
                <View style={[styles.trendPill, { borderColor: trendColor + '55' }]}>
                  <Text style={[styles.trendText, { color: trendColor }]}>
                    Trend: {data.recent_trend}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>By topic</Text>
              <Text style={styles.sectionHint}>
                Pick a subject to see accuracy and attempts per topic you have practiced.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContent}
              >
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.subject_id}
                    onPress={() => setTopicSubjectId(s.subject_id)}
                    style={[
                      styles.chip,
                      topicSubjectId === s.subject_id && styles.chipOn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        topicSubjectId === s.subject_id && styles.chipTextOn,
                      ]}
                      numberOfLines={1}
                    >
                      {s.subject_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {topicsLoading ? (
                <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
              ) : (
                <View style={styles.card}>
                  {topics.length === 0 ? (
                    <Text style={styles.muted}>
                      No attempts for this subject yet — practice questions to populate this list.
                    </Text>
                  ) : (
                    topics.map((t) => (
                      <View key={t.topic_name} style={styles.topicRow}>
                        <BookMarked size={16} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.topicName}>{t.topic_name}</Text>
                          <Text style={styles.topicSub}>
                            {t.correct}/{t.attempts} correct · avg score {t.avg_score}% · ~{t.avg_time}s
                          </Text>
                        </View>
                        <Text style={styles.topicPct}>{t.accuracy.toFixed(0)}%</Text>
                      </View>
                    ))
                  )}
                </View>
              )}

              <Text style={styles.sectionTitle}>Subjects</Text>
              <View style={styles.card}>
                {Object.keys(data.subject_wise_performance || {}).length === 0 ? (
                  <Text style={styles.muted}>Answer practice questions to see subject breakdown.</Text>
                ) : (
                  Object.entries(data.subject_wise_performance).map(([name, pct]) => (
                    <View key={name} style={styles.subjectRow}>
                      <BookMarked size={18} color={colors.primary} />
                      <Text style={styles.subjectName}>{name}</Text>
                      <Text style={styles.subjectPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={styles.sectionTitle}>Strong topics</Text>
              <View style={styles.card}>
                {data.strong_topics.length === 0 ? (
                  <Text style={styles.muted}>No data yet — keep practicing!</Text>
                ) : (
                  data.strong_topics.map((t) => (
                    <View key={t} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{t}</Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={styles.sectionTitle}>Focus areas</Text>
              <View style={styles.card}>
                {data.weak_topics.length === 0 ? (
                  <Text style={styles.muted}>No weak topics detected.</Text>
                ) : (
                  data.weak_topics.map((t) => (
                    <View key={t} style={[styles.topicChip, styles.topicChipWeak]}>
                      <Text style={styles.topicChipText}>{t}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: { padding: 20, paddingBottom: 48 },
  center: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  muted: { color: colors.textMuted, fontSize: 14 },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  heroValue: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  miniStat: { alignItems: 'center', flex: 1 },
  miniVal: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 6 },
  miniLbl: { color: colors.textSubtle, fontSize: 11, marginTop: 2 },
  trendPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.bgElevated,
  },
  trendText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  chipsScroll: { marginBottom: 12, maxHeight: 48 },
  chipsContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 180,
  },
  chipOn: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextOn: { color: colors.text },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topicName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  topicSub: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
  topicPct: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  subjectName: { flex: 1, color: colors.text, fontSize: 15 },
  subjectPct: { color: colors.accent, fontWeight: '700', fontSize: 15 },
  topicChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  topicChipWeak: { backgroundColor: 'rgba(248,113,113,0.12)' },
  topicChipText: { color: colors.text, fontSize: 13 },
  errorText: { color: colors.danger, marginBottom: 8 },
  retry: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
