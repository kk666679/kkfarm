import NetInfo from '@react-native-community/netinfo';
import type { INetworkMonitor, NetworkState } from '@/types/services';

class NetworkMonitor implements INetworkMonitor {
  private state: NetworkState = {
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    isOnline: true,
    connectionType: 'unknown',
  };
  private listeners: Set<(state: NetworkState) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  start(): void {
    if (this.unsubscribe) {
      return;
    }

    this.unsubscribe = NetInfo.addEventListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOnline: state.isConnected ?? false,
        connectionType: state.type,
      };

      this.state = newState;
      this.notifyListeners(newState);
    });

    NetInfo.fetch().then(state => {
      const initialState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOnline: state.isConnected ?? false,
        connectionType: state.type,
      };

      this.state = initialState;
      this.notifyListeners(initialState);
    });
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  getConnectionType(): string {
    return this.state.type;
  }

  getState(): NetworkState {
    return { ...this.state };
  }

  getNetworkStatus(): NetworkState {
    return { ...this.state };
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(state: NetworkState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[NetworkMonitor] Listener error:', error);
      }
    });
  }
}

export const networkMonitor = new NetworkMonitor();
export default networkMonitor;
