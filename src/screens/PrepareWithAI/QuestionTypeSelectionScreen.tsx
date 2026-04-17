import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  ScrollText,
  FileStack,
  SlidersHorizontal,
} from 'lucide-react-native';

const questionTypes = [
  {
    id: 'setup',
    name: 'Practice Setup',
    shortName: 'Setup',
    icon: SlidersHorizontal,
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    description: 'Choose MCQ, short, and long counts in one screen',
    route: '/prepare-with-ai/practice-setup',
  },
  {
    id: 'mcqs',
    name: 'Multiple Choice Questions',
    shortName: 'MCQs',
    icon: CheckSquare,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: 'Practice with multiple choice questions',
    route: '/prepare-with-ai/generate-mcqs',
  },
  {
    id: 'short',
    name: 'Short Questions',
    shortName: 'Short Q',
    icon: FileText,
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'Brief answer questions for quick practice',
    route: '/prepare-with-ai/generate-short',
  },
  {
    id: 'long',
    name: 'Long Questions',
    shortName: 'Long Q',
    icon: ScrollText,
    color: '#8B5CF6',
    bgColor: '#E9D5FF',
    description: 'Detailed questions for in-depth understanding',
    route: '/prepare-with-ai/generate-long',
  },
  {
    id: 'paper',
    name: 'Complete Paper',
    shortName: 'Full Paper',
    icon: FileStack,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: 'Generate a full practice exam paper',
    route: '/prepare-with-ai/generate-paper',
  },
];

export default function QuestionTypeSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { subjectName, subjectId, board, classLevel } = params;

  const handleTypeSelect = (route: string) => {
    router.push({
      pathname: route as never,
      params: {
        subjectName,
        subjectId,
        board: board ?? 'FBISE',
        classLevel: classLevel ?? '10',
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Prepare with AI</Text>
            <Text style={styles.headerTitle}>{subjectName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.bannerText}>
              Choose the type of questions you want to practice
            </Text>
          </View>

          {/* Question Types Grid */}
          <View style={styles.typesContainer}>
            {questionTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => handleTypeSelect(type.route)}
                style={({ pressed }) => [
                  styles.typeCard,
                  { borderLeftColor: type.color, borderLeftWidth: 4 },
                  pressed && styles.typeCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.typeIconContainer,
                    { backgroundColor: type.bgColor },
                  ]}
                >
                  <type.icon size={28} color={type.color} />
                </View>
                <View style={styles.typeContent}>
                  <Text style={styles.typeName}>{type.name}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
                <ArrowLeft
                  size={20}
                  color="#9CA3AF"
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </Pressable>
            ))}
          </View>

          {/* Features Section */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>✨ What you can do</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  Select specific topics to focus on
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  Choose difficulty level (Easy, Medium, Hard)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  Get instant AI-generated questions
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  View detailed explanations for answers
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
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
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  typesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeContent: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  featuresCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#14532D',
    flex: 1,
    lineHeight: 18,
  },
});

