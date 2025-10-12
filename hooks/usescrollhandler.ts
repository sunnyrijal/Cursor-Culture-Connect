import { useRef } from 'react';
import { ScrollView } from 'react-native';

export const useScrollHandler = (scrollStep = 100) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);

  const handleScroll = (e: any) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };

  const handleKey = (e: any) => {
    const key = e.nativeEvent.key;
    
    if (key === 'ArrowDown' || key === 'PageDown') {
      // Scroll down
      scrollViewRef.current?.scrollTo({
        y: scrollY.current + scrollStep,
        animated: true,
      });
    } else if (key === 'ArrowUp' || key === 'PageUp') {
      // Scroll up
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, scrollY.current - scrollStep),
        animated: true,
      });
    }
  };

  return {
    ref: scrollViewRef,
    onScroll: handleScroll,
    onKeyPress: handleKey,
    scrollEventThrottle: 16,
  };
};

// Usage in any screen:
// const scrollProps = useScrollHandler(150);
// <ScrollView {...scrollProps}>
//   Your content
// </ScrollView>