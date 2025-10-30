import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from './theme';

interface CountdownTimerProps {
  time: string;   // Start time in "HH:mm"
  endTime?: string; // Optional end time in "HH:mm"
  date: string; // The date of the event
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ time, endTime, date }) => {
  const calculateRemainingTime = (): React.ReactNode => {
    if (!time) {
      return <Text style={styles.text}>Time not set</Text>;
    }

    const now = new Date();
    const eventDate = new Date(date);
    const [startHours, startMinutes] = time.split(':').map(Number);
    const start = new Date(eventDate);
    start.setHours(startHours, startMinutes, 0, 0);

    let end: Date | null = null;
    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      end = new Date();
      end.setHours(endHours, endMinutes, 0, 0);
    }

    const diffToStart = start.getTime() - now.getTime();
    const diffToEnd = end ? end.getTime() - now.getTime() : null;

    // 🟢 CASE 1: Event has not started yet
    if (diffToStart > 0) {
      const totalMinutes = Math.floor(diffToStart / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (totalMinutes < 2) {
        return <Text style={styles.text}>Starting now</Text>;
      }
      if (hours > 0) {
        return (
          <Text style={styles.text}>
            Starts in <Text style={styles.number}>{hours}</Text>hr{' '}
            <Text style={styles.number}>{minutes}</Text>min
          </Text>
        );
      }
      return (
        <Text style={styles.text}>
          Starts in <Text style={styles.number}>{minutes}</Text>min
        </Text>
      );
    }

    // 🔵 CASE 2: Event started but not yet ended
    if (end && diffToEnd && diffToEnd > 0) {
      const diffMinutes = Math.floor(Math.abs(diffToStart) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (diffMinutes < 1) {
        return <Text style={styles.text}>Started now</Text>;
      }

      if (hours > 0) {
        return (
          <Text style={styles.text}>
            Started <Text style={styles.number}>{hours}</Text>hr{' '}
            <Text style={styles.number}>{minutes}</Text>min ago
          </Text>
        );
      }

      return (
        <Text style={styles.text}>
          Started <Text style={styles.number}>{diffMinutes}</Text>min ago
        </Text>
      );
    }

    // 🔴 CASE 3: Event ended
  if (end && diffToEnd && diffToEnd <= 0) {
      const timeSinceEnd = now.getTime() - end.getTime();
      const diffMinutes = Math.floor(timeSinceEnd / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (diffMinutes < 1) {
        return <Text style={styles.text}>Ended just now</Text>;
      }

      if (hours > 0) {
        return (
          <Text style={styles.text}>
            Ended <Text style={styles.number}>{hours}</Text>hr{' '}
            <Text style={styles.number}>{minutes}</Text>min ago
          </Text>
        );
      }

      return (
        <Text style={styles.text}>
          Ended <Text style={styles.number}>{diffMinutes}</Text>min ago
        </Text>
      );
    }
    // Default fallback
    return <Text style={styles.text}>Started</Text>;
  };

  const [content, setContent] = useState(calculateRemainingTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setContent(calculateRemainingTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [time, endTime, date]);

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
    alignSelf: 'flex-start', // This will make the container fit its content
    marginBottom:8,
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
