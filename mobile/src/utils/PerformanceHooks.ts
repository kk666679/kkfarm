import React, { useRef, useCallback } from 'react';
import { FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ListHandlersProps<T> {
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const useListHandlers = <T>(props: ListHandlersProps<T>) => {
  const { onRefresh, onLoadMore, onScroll } = props;
  const isFetchingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isFetchingRef.current || !onRefresh) return;
    isFetchingRef.current = true;
    await onRefresh();
    isFetchingRef.current = false;
  }, [onRefresh]);

  const handleEndReached = useCallback(async () => {
    if (isFetchingRef.current || !onLoadMore) return;
    isFetchingRef.current = true;
    await onLoadMore();
    isFetchingRef.current = false;
  }, [onLoadMore]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll?.(event);
    },
    [onScroll]
  );

  return {
    handleRefresh,
    handleEndReached,
    handleScroll,
  };
};

export const useFlatListOptimization = <T>(props: Partial<FlatListProps<T>> = {}) => {
  const defaultProps = {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 5,
    getItemLayout: props.getItemLayout,
    keyExtractor: props.keyExtractor || ((item: any, index: number) => `${item.id}-${index}`),
  };

  return { ...defaultProps, ...props };
};

export default {
  useListHandlers,
  useFlatListOptimization,
};
