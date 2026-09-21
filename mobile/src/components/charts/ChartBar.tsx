import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, maxValue, color = colors.primary }) => {
  const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[styles.bar, { height: `${Math.max(barHeight, 2)}%`, backgroundColor: color }]}
        />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    width: (screenWidth - spacing.lg * 4) / 6,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
  },
  value: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default ChartBar;
