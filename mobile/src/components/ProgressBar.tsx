import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  showPercentage = true,
  height = 8,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[styles.fill, { width: `${clampedProgress}%`, backgroundColor: color, height }]}
        />
      </View>
      {showPercentage && <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  percentage: {
    marginLeft: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 36,
  },
});

export default ProgressBar;
