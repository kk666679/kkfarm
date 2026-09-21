import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

const SecuritySettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Security</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>HTTPS</Text>
          <Text style={styles.itemValue}>Required in production</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Certificate Pinning</Text>
          <Text style={styles.itemValue}>Disabled</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Token Storage</Text>
          <Text style={styles.itemValue}>Keychain / Keystore</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Inactivity Timeout</Text>
          <Text style={styles.itemValue}>30 days</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Clear All Cached Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLabel: {
    ...typography.body,
    color: colors.text,
  },
  itemValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actions: {
    padding: spacing.lg,
  },
  dangerButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SecuritySettingsScreen;
