// components/AnimatedTabPage.tsx
import React from 'react';
import Animated, { SlideInRight, SlideInLeft, Easing } from 'react-native-reanimated';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { ViewStyle } from 'react-native';

/**
 * Define your tab order here exactly as in <Tabs.Screen name="...">
 * Forward (index increases) => slide Right -> Left
 * Backward (index decreases) => slide Left -> Right
 */
const TAB_ORDER = ['index', 'discover', 'groups', 'events', 'chat', 'activity-buddy'] as const;

// Module-scoped previous index shared by all tab screens
let prevIndex = 0;

const DURATION = 200; // fast + smooth, no bounce

export default function AnimatedTabPage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  const route = useRoute();
  const routeName = route.name as (typeof TAB_ORDER)[number] | string;

  // Local state to trigger re-entering animation on focus
  const [key, setKey] = React.useState(0);
  const [dir, setDir] = React.useState<'left' | 'right'>('left');

  useFocusEffect(
    React.useCallback(() => {
      // Determine my index from the fixed order map
      const myIndex = Math.max(0, TAB_ORDER.indexOf(routeName as any));
      // Fallback if this route isn't in TAB_ORDER (shouldn't happen)
      const safeMyIndex = myIndex === -1 ? prevIndex : myIndex;

      // Compare with previous index: larger => forward => slide in from right
      const nextDir = safeMyIndex > prevIndex ? 'left' : safeMyIndex < prevIndex ? 'right' : 'left';
      setDir(nextDir);

      // Update prev for the next switch
      prevIndex = safeMyIndex;

      // Re-run the entering animation each time this tab gains focus
      setKey((k) => k + 1);
    }, [routeName])
  );

  const EnterAnim =
    dir === 'left'
      ? SlideInRight.duration(DURATION).easing(Easing.out(Easing.cubic)) // forward: right -> left
      : SlideInLeft.duration(DURATION).easing(Easing.out(Easing.cubic));  // back: left -> right

  return (
    <Animated.View key={key} entering={EnterAnim} style={style}>
      {children}
    </Animated.View>
  );
}
