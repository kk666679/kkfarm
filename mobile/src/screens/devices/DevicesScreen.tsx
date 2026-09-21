import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DevicesStackParamList } from '@/types';
import { useDeviceStore, useNetworkStore } from '@/stores';
import { useDevicesQuery } from '@/query';
import {
  DeviceCard,
  LoadingSpinner,
  EmptyState,
  SearchInput,
  FilterChip,
  OfflineBanner,
} from '@/components';
import { colors, spacing, typography } from '@/theme';
import { DeviceStatus, type Device } from '@/types';

type Props = NativeStackScreenProps<DevicesStackParamList, 'DevicesList'>;

const DevicesScreen: React.FC<Props> = ({ navigation }) => {
  const { devices, isLoading, setSearchText, setStatusFilters, clearFilters } = useDeviceStore();
  const { isConnected } = useNetworkStore();
  const { data: queryDevices } = useDevicesQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setLocalSearchText] = useState('');

  const statusOptions: DeviceStatus[] = [
    'offline',
    'starting',
    'online',
    'busy',
    'error',
    'stopping',
  ];

  const allDevices = queryDevices || devices;
  const onlineDevices = allDevices.filter((d: Device) => d.status === 'online').length;

  useEffect(() => {
    setSearchText(searchText);
  }, [searchText]);

  const onRefresh = async () => {
    setRefreshing(true);
    await useDeviceStore.getState().fetchDevices();
    setRefreshing(false);
  };

  if (isLoading && allDevices.length === 0) {
    return <LoadingSpinner message="Loading devices..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner
        cacheAge={
          isConnected
            ? undefined
            : Date.now() -
              (allDevices[0]?.updatedAt ? new Date(allDevices[0].updatedAt).getTime() : Date.now())
        }
      />
      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
        <Text style={styles.count}>
          {allDevices.length} total, {onlineDevices} online
        </Text>
      </View>
      <SearchInput
        placeholder="Search devices..."
        value={searchText}
        onChangeText={setLocalSearchText}
        onClear={() => setLocalSearchText('')}
      />
      <View style={styles.filters}>
        {statusOptions.slice(0, 4).map(status => (
          <FilterChip
            key={status}
            label={status}
            selected={false}
            onPress={() => {
              const current = useDeviceStore.getState().statusFilters;
              setStatusFilters(
                current.includes(status) ? current.filter(s => s !== status) : [...current, status]
              );
            }}
          />
        ))}
      </View>
      <FlatList
        data={allDevices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="cellphone"
            title="No Devices"
            message="Register a device to get started"
            actionLabel="Register Device"
            onAction={() => navigation.navigate('DeviceRegistration')}
          />
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.md,
  },
});

export default DevicesScreen;
