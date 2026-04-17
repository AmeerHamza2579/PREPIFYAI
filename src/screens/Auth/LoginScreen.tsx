import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { colors, radii } from '../../theme/colors';
import { Sparkles } from 'lucide-react-native';
import { emailDomainTypoHint } from '../../utils/emailHints';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = (profile: { id?: string; sub?: string; name?: string; email?: string; picture?: string }) => {
    loginWithGoogle(profile);
    router.replace('/(tabs)');
  };

  const handleLogin = async () => {
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    const typo = emailDomainTypoHint(emailTrimmed);
    if (typo) {
      Alert.alert('Check your email', typo);
      return;
    }
    setLoading(true);
    try {
      await login(emailTrimmed, password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, '#1e1b4b', colors.bg]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.brandIcon}>
                <Sparkles color="#fff" size={28} />
              </LinearGradient>
              <Text style={styles.title}>PrepifyAI</Text>
              <Text style={styles.subtitle}>Sign in to continue your prep journey</Text>
            </View>

            <View style={styles.card}>
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu.pk"
                keyboardType="email-address"
                autoComplete="off"
                textContentType="none"
                appearance="dark"
              />
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="off"
                textContentType="none"
                appearance="dark"
              />
              <View style={{ marginTop: 8 }}>
                <PrimaryButton
                  title="Sign in"
                  onPress={handleLogin}
                  loading={loading}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleSignInButton onSuccess={handleGoogleSuccess} variant="dark" />

              <View style={styles.footer}>
                <Text style={styles.footerMuted}>New here? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.link}>Create account</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.adminBtn} onPress={() => router.push('/admin/login')}>
                <Text style={styles.adminText}>Admin sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  brand: { alignItems: 'center', marginBottom: 28 },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(22,24,50,0.92)',
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 14, color: colors.textSubtle, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerMuted: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  adminBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
  },
  adminText: { color: colors.textSubtle, fontSize: 13, fontWeight: '600' },
});
