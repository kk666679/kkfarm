import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wsService } from '@/services/WebSocketService';
import { colors } from '@/theme';
import type { ConnectionStatus } from '@/types';

const ConnectionIndicator: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(wsService.getConnectionStatus());

  useEffect(() => {
    const unsubscribe = wsService.onConnectionStatusChange(newStatus => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return colors.success;
      case 'connecting':
        return colors.warning;
      case 'disconnected':
        return colors.error;
      default:
        return colors.error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ConnectionIndicator;
