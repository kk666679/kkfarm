import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/query/QueryClient';
import { SyncProvider } from '@/sync';
import { AppNavigator } from '@/navigation';
import { colors } from '@/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SyncProvider>
            <ErrorBoundary>
              <StatusBar barStyle="light-content" />
              <AppNavigator />
            </ErrorBoundary>
          </SyncProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
