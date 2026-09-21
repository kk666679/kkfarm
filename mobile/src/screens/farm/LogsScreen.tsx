import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/types';
import { useFarmStore, useDeviceStore, useNetworkStore } from '@/stores';
import { useLogsQuery } from '@/query';
import { FilterChip, LoadingSpinner, EmptyState } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { Device } from '@/types';
import type { LogLevel } from '@/types';

type Props = NativeStackScreenProps<FarmStackParamList, 'Logs'>;

const LogsScreen: React.FC<Props> = ({ navigation }) => {
  const { devices } = useDeviceStore();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: logsData, refetch: refetchLogs } = useLogsQuery(selectedDeviceId || '', {
    filter: searchText || undefined,
    maxLines: 200,
  });

  const logLines = logsData?.lines || [];
  const displayLogs = logLines.map((line, index) => ({
    id: `log-${index}`,
    timestamp: new Date().toISOString(),
    level: 'info' as LogLevel,
    source: selectedDeviceId || 'system',
    message: line,
    metadata: {},
  }));

  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLogs();
    setRefreshing(false);
  };

  const filteredLogs = displayLogs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const renderLog = ({ item }: { item: any }) => (
    <View style={[styles.logItem, item.level === 'error' && styles.logItemError]}>
      <Text style={styles.logTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={[styles.logLevel, { color: getLevelColor(item.level) }]}>
        {item.level.toUpperCase()}
      </Text>
      <Text style={styles.logSource}>{item.source}</Text>
      <Text style={styles.logMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Logs</Text>
        <Text style={styles.count}>{filteredLogs.length} entries</Text>
      </View>

      <View style={styles.deviceSelector}>
        <Text style={styles.deviceSelectorLabel}>Device:</Text>
        {devices.slice(0, 5).map(device => (
          <TouchableOpacity
            key={device.id}
            style={[styles.deviceChip, selectedDeviceId === device.id && styles.deviceChipSelected]}
            onPress={() => setSelectedDeviceId(device.id)}
          >
            <Text
              style={[
                styles.deviceChipText,
                selectedDeviceId === device.id && styles.deviceChipTextSelected,
              ]}
            >
              {device.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filters}>
        {['all', 'info', 'warning', 'error'].map(level => (
          <FilterChip
            key={level}
            label={level.toUpperCase()}
            selected={filterLevel === level}
            onPress={() => setFilterLevel(level as LogLevel | 'all')}
          />
        ))}
      </View>
      <FlatList
        data={filteredLogs}
        renderItem={renderLog}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !selectedDeviceId ? (
            <EmptyState
              icon="file-document"
              title="Select a Device"
              message="Select a device to view logs"
            />
          ) : (
            <EmptyState
              icon="file-document"
              title="No Logs"
              message="No log entries match your filters"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  count: {
    ...typography.body,
    color: colors.textSecondary,
  },
  deviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  deviceSelectorLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  deviceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  deviceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deviceChipText: {
    ...typography.caption,
    color: colors.text,
  },
  deviceChipTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  logItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  logItemError: {
    backgroundColor: colors.error + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  logTimestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  logLevel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  logSource: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  logMessage: {
    ...typography.body,
    color: colors.text,
  },
});

export default LogsScreen;
