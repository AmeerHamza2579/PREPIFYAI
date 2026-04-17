import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
} from 'lucide-react-native';

const stats = [
  {
    label: 'Overall Accuracy',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: Target,
    color: '#10B981',
  },
  {
    label: 'Total Predictions',
    value: '2,850',
    change: '+245',
    trend: 'up',
    icon: Activity,
    color: '#3B82F6',
  },
  {
    label: 'Approval Rate',
    value: '94.2%',
    change: '+1.8%',
    trend: 'up',
    icon: Award,
    color: '#8B5CF6',
  },
  {
    label: 'Avg Confidence',
    value: '91.0%',
    change: '-0.5%',
    trend: 'down',
    icon: TrendingUp,
    color: '#F59E0B',
  },
];

const subjectPerformance = [
  { subject: 'Computer', accuracy: 96, total: 450, approved: 432 },
  { subject: 'Biology', accuracy: 94, total: 380, approved: 357 },
  { subject: 'Chemistry', accuracy: 92, total: 420, approved: 386 },
  { subject: 'Physics', accuracy: 95, total: 510, approved: 484 },
];

export default function MonitorAccuracyScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Monitor Accuracy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: `${stat.color}15` },
                    ]}
                  >
                    <stat.icon size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.statChange}>
                    {stat.trend === 'up' ? (
                      <TrendingUp size={14} color="#10B981" />
                    ) : (
                      <TrendingDown size={14} color="#EF4444" />
                    )}
                    <Text
                      style={[
                        styles.statChangeText,
                        { color: stat.trend === 'up' ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {stat.change}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Performance by Subject */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance by Subject</Text>
            <View style={styles.card}>
              {subjectPerformance.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.performanceRow,
                    index !== subjectPerformance.length - 1 && styles.performanceRowBorder,
                  ]}
                >
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceSubject}>{item.subject}</Text>
                    <Text style={styles.performanceStats}>
                      {item.approved}/{item.total} questions
                    </Text>
                  </View>
                  <View style={styles.performanceRight}>
                    <View
                      style={[
                        styles.accuracyBadge,
                        {
                          backgroundColor:
                            item.accuracy >= 95
                              ? '#D1FAE5'
                              : item.accuracy >= 90
                              ? '#DBEAFE'
                              : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.accuracyText,
                          {
                            color:
                              item.accuracy >= 95
                                ? '#065F46'
                                : item.accuracy >= 90
                                ? '#1E40AF'
                                : '#92400E',
                          },
                        ]}
                      >
                        {item.accuracy}%
                      </Text>
                    </View>
                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${item.accuracy}%`,
                            backgroundColor:
                              item.accuracy >= 95
                                ? '#10B981'
                                : item.accuracy >= 90
                                ? '#3B82F6'
                                : '#F59E0B',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Difficulty Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
            <View style={styles.card}>
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyInfo}>
                  <View style={[styles.difficultyDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.difficultyLabel}>Easy</Text>
                </View>
                <Text style={styles.difficultyPercentage}>45%</Text>
              </View>
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyInfo}>
                  <View style={[styles.difficultyDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.difficultyLabel}>Medium</Text>
                </View>
                <Text style={styles.difficultyPercentage}>35%</Text>
              </View>
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyInfo}>
                  <View style={[styles.difficultyDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.difficultyLabel}>Hard</Text>
                </View>
                <Text style={styles.difficultyPercentage}>20%</Text>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationCard}>
              <TrendingUp size={20} color="#F59E0B" />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>
                  Improve Hard Question Quality
                </Text>
                <Text style={styles.recommendationText}>
                  Consider generating more Hard difficulty questions to balance distribution and challenge advanced students.
                </Text>
              </View>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  performanceRow: {
    paddingVertical: 12,
  },
  performanceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  performanceInfo: {
    marginBottom: 8,
  },
  performanceSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  performanceStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  performanceRight: {
    alignItems: 'flex-end',
  },
  accuracyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  difficultyPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
});

