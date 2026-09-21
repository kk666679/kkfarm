import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface AgentListProps {
  agents: Array<{ id: string; name: string; status: string; taskCount: number }>;
  onAgentPress?: (agentId: string) => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onAgentPress }) => {
  if (agents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No agents available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {agents.map(agent => (
        <View key={agent.id} style={styles.agentItem}>
          <View style={styles.agentInfo}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    agent.status === 'active' ? colors.success : colors.textSecondary,
                },
              ]}
            />
            <View>
              <Text style={styles.agentName} numberOfLines={1}>
                {agent.name}
              </Text>
              <Text style={styles.agentMeta}>{agent.taskCount} tasks</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  agentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  agentName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  agentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default AgentList;
