// components/TabTransitionProvider.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';

type Direction = 'left' | 'right' | 'none';

const TabTransitionCtx = createContext<{ direction: Direction; index: number }>({
  direction: 'none',
  index: 0,
});

export const TabTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  // This reads the active route index of the tab navigator
  const navState = useNavigationState((state) => state);
  const [index, setIndex] = useState(0);
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (!navState) return;
    const currentIndex = navState.index ?? 0;
    setIndex(currentIndex);
  }, [navState]);

  const value = useMemo(() => {
    const prev = prevIndexRef.current;
    let direction: Direction = 'none';
    if (index > prev) direction = 'left';      // slide in from right (moving forward)
    else if (index < prev) direction = 'right'; // slide in from left (moving back)
    prevIndexRef.current = index;
    return { direction, index };
  }, [index]);

  return <TabTransitionCtx.Provider value={value}>{children}</TabTransitionCtx.Provider>;
};

export const useTabTransition = () => useContext(TabTransitionCtx);
