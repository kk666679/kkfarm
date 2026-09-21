import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.donut}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor: item.color,
                  width: `${percentage}%`,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.center}>
        <Text style={styles.centerValue}>{total}</Text>
        <Text style={styles.centerLabel}>Total</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donut: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.border,
  },
  segment: {
    height: '100%',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    ...typography.h2,
    color: colors.text,
  },
  centerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DonutChart;
