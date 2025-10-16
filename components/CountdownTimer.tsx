import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from './theme';

interface CountdownTimerProps {
  time: string; // Expects "HH:mm" format
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ time }) => {
  const calculateRemainingTime = (): React.ReactNode => {
    if (!time) {
      return <Text style={styles.text}>Time not set</Text>;
    }

    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    const eventTime = new Date();
    eventTime.setHours(hours, minutes, 0, 0);

    const diff = eventTime.getTime() - now.getTime(); // in milliseconds

    if (diff <= 0) {
      const diffMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;

      if (diffMinutes < 1) {
        return <Text style={styles.text}>Started now</Text>;
      }
      if (diffHours > 0) {
        return (
          <Text style={styles.text}>
            Started <Text style={styles.number}>{diffHours}</Text>hr{' '}
            <Text style={styles.number}>{remainingMinutes}</Text>min ago
          </Text>
        );
      }
      return (
        <Text style={styles.text}>
          Started <Text style={styles.number}>{diffMinutes}</Text>min ago
        </Text>
      );
    }

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const remainingHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalMinutes < 2) {
      return <Text style={styles.text}>Starting now</Text>;
    }

    if (remainingHours > 0) {
      return (
        <Text style={styles.text}>
          Starts in <Text style={styles.number}>{remainingHours}</Text>hr{' '}
          <Text style={styles.number}>{remainingMinutes}</Text>min
        </Text>
      );
    }

    return (
      <Text style={styles.text}>
        Starts in <Text style={styles.number}>{remainingMinutes}</Text>min
      </Text>
    );
  };

  const [content, setContent] = useState(calculateRemainingTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setContent(calculateRemainingTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [time]);

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  text: {
    fontSize: 13,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  number: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CountdownTimer;