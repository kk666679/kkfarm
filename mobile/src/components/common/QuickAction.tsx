import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, disabled && styles.iconDisabled]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconDisabled: {
    backgroundColor: colors.textSecondary + '15',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  labelDisabled: {
    color: colors.textSecondary,
  },
});

export default QuickAction;
