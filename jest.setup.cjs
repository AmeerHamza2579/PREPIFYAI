/* Minimal shims so importing apiClient does not pull native binaries in Node tests. */
jest.mock('react-native', () => ({
  Platform: { OS: 'web', select: (s) => s.web ?? s.default },
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: { hostUri: undefined },
    manifest: undefined,
  },
}));
