import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Upload,
  CheckCircle,
  TrendingUp,
  Activity,
  BookOpen,
  Users,
  AlertTriangle,
  Clock,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Total Textbooks', value: '24', icon: BookOpen, color: '#3B82F6' },
  { label: 'Pending Validations', value: '156', icon: AlertTriangle, color: '#F59E0B' },
  { label: 'AI Accuracy', value: '94.2%', icon: TrendingUp, color: '#10B981' },
  { label: 'Active Students', value: '1,284', icon: Users, color: '#8B5CF6' },
];

const quickActions = [
  {
    title: 'Upload Content',
    description: 'Add textbooks & syllabus',
    icon: Upload,
    color: '#3B82F6',
    route: '/admin/upload',
  },
  {
    title: 'Validate AI Content',
    description: 'Review generated questions',
    icon: CheckCircle,
    color: '#10B981',
    route: '/admin/validate',
  },
  {
    title: 'Monitor Accuracy',
    description: 'Track AI performance',
    icon: TrendingUp,
    color: '#8B5CF6',
    route: '/admin/monitor',
  },
  {
    title: 'System Health',
    description: 'Check system status',
    icon: Activity,
    color: '#EF4444',
    route: '/admin/system',
  },
];

const recentActivity = [
  {
    id: 1,
    action: 'New textbook uploaded',
    details: 'Advanced Chemistry - 11th Grade',
    time: '5 minutes ago',
    icon: BookOpen,
  },
  {
    id: 2,
    action: 'AI content validated',
    details: '45 questions approved in Biology',
    time: '23 minutes ago',
    icon: CheckCircle,
  },
  {
    id: 3,
    action: 'Syllabus updated',
    details: 'Physics - 12th Grade (2024)',
    time: '1 hour ago',
    icon: Upload,
  },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}
              >
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <action.icon size={20} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>
                    {action.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Clock size={18} color="#9CA3AF" />
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <activity.icon size={16} color="#6B7280" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityDetails}>{activity.details}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
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
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

