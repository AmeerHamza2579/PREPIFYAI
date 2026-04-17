import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Cpu,
  BookOpen,
  Hash,
  RefreshCw,
  ChevronRight,
} from 'lucide-react-native';
import { colors, radii } from '../../theme/colors';
import { a11yIconButton } from '../../theme/a11y';
import { subjectService, Subject } from '../../services/subjectService';
import {
  predictionService,
  TopicPredictionResponse,
  PredictionStatus,
} from '../../services/predictionService';

const CLASS_OPTIONS = ['9', '10', '11', '12'] as const;
const TOP_K_OPTIONS = [3, 5, 8] as const;
const THRESHOLD_PRESETS: { label: string; value: number }[] = [
  { label: 'More topics', value: 0.05 },
  { label: 'Balanced', value: 0.1 },
  { label: 'Stricter', value: 0.2 },
];

export default function PredictionScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [classLevel, setClassLevel] = useState<string>('10');
  const [questionText, setQuestionText] = useState('');
  const [topK, setTopK] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(0.1);
  const [status, setStatus] = useState<PredictionStatus | null>(null);
  const [result, setResult] = useState<TopicPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [st, subs] = await Promise.all([
        predictionService.getStatus(),
        subjectService.getSubjects(),
      ]);
      setStatus(st);
      setSubjects(subs);
      setSubjectId((prev) => (prev === null && subs.length ? subs[0].subject_id : prev));
    } catch (e: unknown) {
      Alert.alert('Load failed', e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const selected = subjects.find((s) => s.subject_id === subjectId);

  useEffect(() => {
    if (!selected?.class_level) return;
    const cl = String(selected.class_level).trim();
    if (CLASS_OPTIONS.includes(cl as (typeof CLASS_OPTIONS)[number])) {
      setClassLevel(cl);
    }
  }, [selected?.subject_id, selected?.class_level]);

  const modelReady = status?.status === 'ready' || status?.status === 'fallback_ready';
  const charCount = questionText.trim().length;
  const minChars = 10;

  const runPredict = async () => {
    if (charCount < minChars) {
      Alert.alert('Question', `Enter at least ${minChars} characters.`);
      return;
    }
    if (subjectId == null) {
      Alert.alert('Subject', 'Select a subject.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await predictionService.predictTopics({
        class_level: classLevel.trim(),
        subject_id: subjectId,
        question_text: questionText.trim(),
        top_k: topK,
        confidence_threshold: threshold,
      });
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Prediction failed';
      if (/401|403|login|unauthor/i.test(msg)) {
        Alert.alert('Sign in required', 'Log in as a student to run topic prediction.');
      } else {
        Alert.alert('Prediction', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setQuestionText('');
  };

  const statusBadge = useMemo(() => {
    if (!status) return null;
    const isFallback = status.prediction_mode?.includes('fallback');
    return (
      <View style={[styles.badge, isFallback ? styles.badgeWarn : styles.badgeOk]}>
        <Text style={[styles.badgeTxt, isFallback ? styles.badgeTxtWarn : styles.badgeTxtOk]}>
          {isFallback ? 'Fallback mode' : 'Model active'}
        </Text>
      </View>
    );
  }, [status]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.55 }}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            {...a11yIconButton('Go back')}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerKicker}>PrepifyAI</Text>
            <Text style={styles.headerTitle}>Topic prediction</Text>
          </View>
          <TouchableOpacity
            onPress={loadMeta}
            style={styles.iconBtn}
            disabled={loadingMeta}
            {...a11yIconButton('Refresh model status')}
          >
            <RefreshCw size={20} color={loadingMeta ? colors.textSubtle : colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['rgba(99,102,241,0.25)', 'rgba(14,165,233,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroIconWrap}>
              <Brain size={28} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.heroTitle}>DistilBERT topic ranker</Text>
            <Text style={styles.heroBody}>
              Paste any exam-style question. The API scores which syllabus topics best match your text.
            </Text>
            {loadingMeta ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />
            ) : (
              <View style={styles.heroMetaRow}>
                {statusBadge}
                <View style={styles.heroMetaItem}>
                  <Cpu size={14} color={colors.textSubtle} />
                  <Text style={styles.heroMetaTxt} numberOfLines={1}>
                    {status?.device ?? '—'} · {status?.models_loaded ?? 0} model(s)
                  </Text>
                </View>
              </View>
            )}
            {status?.available_classes?.length ? (
              <Text style={styles.heroFoot}>
                Loaded classes:&nbsp;
                <Text style={styles.heroFootEm}>{status.available_classes.join(', ')}</Text>
              </Text>
            ) : null}
          </LinearGradient>

          {loadingMeta ? null : (
            <>
              <Text style={styles.sectionTitle}>
                <Hash size={16} color={colors.accent} /> Inputs
              </Text>

              <View style={styles.card}>
                <Text style={styles.label}>Class (model checkpoint)</Text>
                <View style={styles.rowChips}>
                  {CLASS_OPTIONS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setClassLevel(c)}
                      style={[styles.pill, classLevel === c && styles.pillOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: classLevel === c }}
                      accessibilityLabel={`Class ${c}`}
                    >
                      <Text style={[styles.pillTxt, classLevel === c && styles.pillTxtOn]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>Subject</Text>
                {subjects.length === 0 ? (
                  <Text style={styles.emptySubj}>
                    No subjects in the API. Seed subjects or check your connection.
                  </Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContent}
                  >
                    {subjects.map((s) => (
                      <TouchableOpacity
                        key={s.subject_id}
                        onPress={() => setSubjectId(s.subject_id)}
                        style={[styles.subjectChip, subjectId === s.subject_id && styles.subjectChipOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: subjectId === s.subject_id }}
                        accessibilityLabel={`Subject ${s.subject_name}`}
                      >
                        <BookOpen
                          size={16}
                          color={subjectId === s.subject_id ? colors.accent : colors.textSubtle}
                        />
                        <Text
                          style={[
                            styles.subjectChipTxt,
                            subjectId === s.subject_id && styles.subjectChipTxtOn,
                          ]}
                          numberOfLines={1}
                        >
                          {s.subject_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {selected ? (
                  <Text style={styles.metaLine}>
                    {selected.board} · Class {selected.class_level} · ID {selected.subject_id}
                  </Text>
                ) : null}
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>How many topic suggestions?</Text>
                <View style={styles.rowChips}>
                  {TOP_K_OPTIONS.map((k) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setTopK(k)}
                      style={[styles.pill, topK === k && styles.pillOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: topK === k }}
                    >
                      <Text style={[styles.pillTxt, topK === k && styles.pillTxtOn]}>Top {k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.label, { marginTop: 16 }]}>Confidence cutoff</Text>
                <View style={styles.rowChips}>
                  {THRESHOLD_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.label}
                      onPress={() => setThreshold(p.value)}
                      style={[
                        styles.pillWide,
                        Math.abs(threshold - p.value) < 0.001 && styles.pillOn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillTxtSmall,
                          Math.abs(threshold - p.value) < 0.001 && styles.pillTxtOn,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.questionHead}>
                  <Text style={styles.label}>Question text</Text>
                  <Text
                    style={[styles.counter, charCount >= minChars ? styles.counterOk : styles.counterWarn]}
                  >
                    {charCount}/{minChars}+
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder={
                    'e.g. Explain the role of ATP synthase in chemiosmosis.\n\nPaste full past-paper stems for best results.'
                  }
                  placeholderTextColor={colors.textSubtle}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Exam question for prediction"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={runPredict}
                disabled={loading || subjects.length === 0}
                {...a11yIconButton('Run prediction')}
              >
                <LinearGradient
                  colors={[colors.primary, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.ctaGradient, loading && styles.ctaDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Sparkles size={22} color="#fff" />
                      <Text style={styles.ctaTxt}>Run prediction</Text>
                      <ChevronRight size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {result ? (
                <>
                  <Text style={styles.sectionTitle}>
                    <Sparkles size={16} color={colors.success} /> Results
                  </Text>
                  <View style={styles.resultShell}>
                    <View style={styles.topPrediction}>
                      <Text style={styles.topLabel}>Best match</Text>
                      <Text style={styles.topTopic}>{result.top_prediction}</Text>
                      <View style={styles.meterTrack}>
                        <LinearGradient
                          colors={[colors.success, colors.accent]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.meterFill,
                            { width: `${Math.min(100, Math.max(8, result.confidence * 100))}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.topConf}>
                        {(result.confidence * 100).toFixed(1)}% confidence · {result.distilbert_version}
                      </Text>
                    </View>

                    <Text style={styles.rankHeader}>All ranked topics</Text>
                    {result.predicted_topics.map((t, idx) => {
                      const pct = t.confidence * 100;
                      return (
                        <View key={`${t.label_id}-${t.topic_name}-${idx}`} style={styles.rankRow}>
                          <View style={styles.rankLeft}>
                            <View style={styles.rankNum}>
                              <Text style={styles.rankNumTxt}>{idx + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.rankName}>{t.topic_name}</Text>
                              <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: `${Math.min(100, pct)}%` }]} />
                              </View>
                            </View>
                          </View>
                          <Text style={styles.rankPct}>{pct.toFixed(0)}%</Text>
                        </View>
                      );
                    })}

                    <TouchableOpacity onPress={clearResults} style={styles.clearLink}>
                      <Text style={styles.clearLinkTxt}>Clear & new question</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}

              {!modelReady && status ? (
                <View style={styles.warnBanner}>
                  <Text style={styles.warnTxt}>
                    Model status is not “ready”. Predictions may use keyword fallback or fail — check
                    /predictions/status on the server and_pretrained folder.
                  </Text>
                </View>
              ) : null}
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
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerKicker: { color: colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  heroCard: {
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(34,211,238,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  heroBody: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroMetaTxt: { color: colors.textMuted, fontSize: 12, flex: 1 },
  heroFoot: { color: colors.textSubtle, fontSize: 11, marginTop: 12 },
  heroFootEm: { color: colors.accent, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.sm },
  badgeOk: { backgroundColor: 'rgba(52,211,153,0.2)' },
  badgeWarn: { backgroundColor: 'rgba(251,191,36,0.2)' },
  badgeTxt: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  badgeTxtOk: { color: colors.success },
  badgeTxtWarn: { color: colors.warning },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillWide: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillOn: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  pillTxt: { color: colors.textMuted, fontWeight: '700', fontSize: 15 },
  pillTxtSmall: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  pillTxtOn: { color: colors.text },
  chipsContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200,
  },
  subjectChipOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  subjectChipTxt: { color: colors.textMuted, fontWeight: '600', fontSize: 14, flexShrink: 1 },
  subjectChipTxtOn: { color: colors.text },
  metaLine: { color: colors.textSubtle, fontSize: 12, marginTop: 10 },
  emptySubj: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  questionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
  },
  counterOk: { color: colors.success },
  counterWarn: { color: colors.warning },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    color: colors.text,
    backgroundColor: colors.bgElevated,
    fontSize: 15,
    lineHeight: 22,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: radii.lg,
    marginBottom: 8,
  },
  ctaDisabled: { opacity: 0.75 },
  ctaTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  resultShell: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  topPrediction: {
    padding: 20,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  topTopic: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 14 },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: 10,
  },
  meterFill: { height: '100%', borderRadius: 4 },
  topConf: { color: colors.textSubtle, fontSize: 12 },
  rankHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  rankNum: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumTxt: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  rankName: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  rankPct: { color: colors.accent, fontWeight: '800', fontSize: 15, marginLeft: 8 },
  clearLink: { padding: 16, alignItems: 'center' },
  clearLinkTxt: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  warnBanner: {
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    marginBottom: 24,
  },
  warnTxt: { color: colors.warning, fontSize: 12, lineHeight: 18 },
});
