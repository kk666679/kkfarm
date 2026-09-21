import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button` as keyof typeof styles],
      ...styles[`${variant}Button` as keyof typeof styles],
    };

    if (disabled || loading) {
      return { ...base, opacity: 0.5 };
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`${size}Text` as keyof typeof styles],
      ...styles[`${variant}Text` as keyof typeof styles],
    };
  };

  const accessibilityLabel = loading ? `${title} loading` : title;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'secondary' ? colors.primary : colors.surface}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]} accessibilityRole="text">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mediumButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  largeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    ...typography.caption,
  },
  mediumText: {
    ...typography.body,
  },
  largeText: {
    ...typography.h3,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.surface,
  },
  outlineText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.surface,
  },
});

export default Button;
