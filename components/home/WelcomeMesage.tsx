import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const WelcomeCenter = ({ welcomeMessages, welcomeIndex }:{welcomeMessages: any, welcomeIndex: number}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start from 0 opacity
    fadeAnim.setValue(0);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700, 
      useNativeDriver: true,
    }).start();
  }, [welcomeIndex]);

  return (
    <View style={styles.welcomeCenterContainer}>
      <Animated.Text style={[styles.welcomeCenterTitle, { opacity: fadeAnim }]}>
        {welcomeMessages[welcomeIndex].first}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.welcomeCenterTitle,
          styles.welcomeCenterTitleIndented,
          { opacity: fadeAnim },
        ]}
      >
        {welcomeMessages[welcomeIndex].second}
      </Animated.Text>
    </View>
  );
};
export default WelcomeCenter;

const styles = StyleSheet.create({
  welcomeCenterContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  welcomeCenterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: 'System',
    // Subtle text shadow for depth
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeCenterTitleIndented: {
    marginLeft: 16,
    color: '#4A5568', // Slightly lighter for visual hierarchy
    fontSize: 26,
    fontWeight: '600',
    marginTop: 2,
    // Different shadow for secondary text
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
});
