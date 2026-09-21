import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing } from '@/theme';
import type { MetricDataPoint, MetricType } from '@/types';

interface MetricChartProps {
  data: MetricDataPoint[];
  metricType: MetricType;
  warningThreshold?: number;
  errorThreshold?: number;
  timeRange?: '1h' | '6h' | '24h';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let VictoryChart: any, VictoryLine: any, VictoryAxis: any, VictoryTheme: any;
try {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const victory = require('victory-native');
    VictoryChart = victory.VictoryChart;
    VictoryLine = victory.VictoryLine;
    VictoryAxis = victory.VictoryAxis;
    VictoryTheme = victory.VictoryTheme;
  }
} catch {
  // victory-native is not available on web
}

const formatXAxis = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getYDomain = (values: number[]) => {
  if (!values.length) return [0, 100];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 10;
  return [Math.max(0, min - padding), max + padding];
};

const NativeMetricChart: React.FC<MetricChartProps> = ({
  data,
  metricType,
  warningThreshold,
  errorThreshold,
  timeRange = '1h',
}) => {
  const values = data.map(d => d.value);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metricType.toUpperCase()}</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        height={200}
        width={300}
        domain={{ y: getYDomain(values) }}
        padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
      >
        <VictoryAxis
          tickFormat={formatXAxis}
          style={{ tickLabels: { fontSize: 10, fill: colors.textSecondary } }}
        />
        <VictoryAxis
          dependentAxis
          style={{ tickLabels: { fontSize: 10, fill: colors.textSecondary } }}
        />
        <VictoryLine
          data={data}
          x="timestamp"
          y="value"
          style={{
            data: { stroke: colors.primary, strokeWidth: 2 },
          }}
        />
        {warningThreshold !== undefined && (
          <VictoryLine
            data={[
              { x: data[0]?.timestamp || 0, y: warningThreshold },
              { x: data[data.length - 1]?.timestamp || 0, y: warningThreshold },
            ]}
            style={{ data: { stroke: colors.warning, strokeDasharray: '5,5' } }}
          />
        )}
        {errorThreshold !== undefined && (
          <VictoryLine
            data={[
              { x: data[0]?.timestamp || 0, y: errorThreshold },
              { x: data[data.length - 1]?.timestamp || 0, y: errorThreshold },
            ]}
            style={{ data: { stroke: colors.error, strokeDasharray: '5,5' } }}
          />
        )}
      </VictoryChart>
    </View>
  );
};

const WebMetricChart: React.FC<MetricChartProps> = ({ data, metricType }) => {
  const values = data.map(d => d.value);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metricType.toUpperCase()}</Text>
      {data.map((point, index) => (
        <Text key={index} style={styles.webDataPoint}>
          {formatXAxis(point.timestamp)}: {point.value.toFixed(1)}
        </Text>
      ))}
      {values.length > 0 && (
        <Text style={styles.webSummary}>
          Min: {Math.min(...values).toFixed(1)} / Max: {Math.max(...values).toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  webDataPoint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  webSummary: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});

export default WebMetricChart;
