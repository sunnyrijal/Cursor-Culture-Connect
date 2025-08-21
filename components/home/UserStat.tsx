import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, spacing, typography } from '../theme';

export const neomorphColors = {
  background: '#F0F3F7',
  lightShadow: '#FFFFFF',
  darkShadow: '#CDD2D8',
  primary: theme.primary || '#6366F1',
};

const UserStat = ({ currentUser }: { currentUser: any }) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity 
      onPress={() => router.push('/my-hub')} 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={isPressed ? styles.outerShadowPressed : styles.outerShadow}
      activeOpacity={1}
    >
      <LinearGradient
        colors={[neomorphColors.lightShadow, neomorphColors.background]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.card}
      >
        <Text style={styles.title}>Your Cultural Hub</Text>
        <Text style={styles.subtitle}>
          Connect with heritage and explore cultures
        </Text>

        <View style={styles.statsContainer}>
          {/* Stat 1 */}
          <View style={styles.statWrapper}>
            <View style={styles.statContainer}>
              <Text style={styles.statNumber}>{currentUser.eventsAttended}</Text>
              <Text style={styles.statLabel}>Events{"\n"}Attended</Text>
            </View>
          </View>

          {/* Stat 2 */}
          <View style={styles.statWrapper}>
            <View style={styles.statContainer}>
              <Text style={styles.statNumber}>{currentUser.joinedGroups}</Text>
              <Text style={styles.statLabel}>Groups{"\n"}Joined</Text>
            </View>
          </View>

          {/* Stat 3 */}
          <View style={styles.statWrapper}>
            <View style={styles.statContainer}>
              <Text style={styles.statNumber}>{currentUser.connections}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default UserStat;

const styles = StyleSheet.create({
  // Main card - normal state
  outerShadow: {
    borderRadius: 24,
    backgroundColor: neomorphColors.background,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xs,
    // Cross-platform shadows
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Main card - pressed state
  outerShadowPressed: {
    borderRadius: 24,
    backgroundColor: neomorphColors.background,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xs,
    // Reduced shadows for pressed effect
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  card: {
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    // Add subtle border for light shadow effect
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: typography.fontFamily.bold,
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 8,
  },

  statWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  // Individual stat containers with neumorphic effect
  statContainer: {
    borderRadius: 16,
    backgroundColor: neomorphColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 8,
    width: '90%',
    minHeight: 85,
    // Cross-platform shadows for stats
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    // Light border for inner highlight
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: neomorphColors.primary,
    fontFamily: typography.fontFamily.bold,
    textShadowColor: neomorphColors.lightShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 13,
  },
});