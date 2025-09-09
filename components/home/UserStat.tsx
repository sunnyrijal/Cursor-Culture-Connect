import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, spacing, typography } from '../theme';

export const neomorphColors = {
  background: '#F0F3F7',
  lightShadow: '#FFFFFF',
  darkShadow: '#A3B1C6',
  shadowLight: 'rgba(255, 255, 255, 0.9)',
  shadowDark: 'rgba(163, 177, 198, 0.2)',
  primary: theme.primary || '#6366F1',
  cardBackground: '#F0F3F7',
  statBackground: '#EDF1F7',
};

const UserStat = ({ currentUser }: { currentUser: any }) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.mainContainer,
        isPressed ? styles.mainContainerPressed : styles.mainContainerNormal
      ]}
      activeOpacity={1}
    >
      {/* Outer gradient for enhanced depth */}
      {/* <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.8)',
          neomorphColors.background,
          'rgba(163, 177, 198, 0.1)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.outerGradient}
      > */}
        {/* Inner card with neumorphic effect */}
        <View style={[
          styles.innerCard,
          isPressed ? styles.innerCardPressed : styles.innerCardNormal
        ]}>
          {/* <LinearGradient
            colors={[
              neomorphColors.lightShadow,
              neomorphColors.cardBackground,
              'rgba(163, 177, 198, 0.05)'
            ]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.cardContent}
          > */}
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Your Cultural Hub</Text>
            </View>

            {/* Stats Container */}
            <View style={styles.statsContainer}>
              {/* Stat 1 */}
              <View style={styles.statWrapper}>
                <View style={[
                  styles.statContainer,
                  isPressed ? styles.statContainerPressed : styles.statContainerNormal
                ]}>
                  <LinearGradient
                    colors={[
                      'rgba(255, 255, 255, 0.6)',
                      neomorphColors.statBackground,
                      'rgba(163, 177, 198, 0.08)'
                    ]}
                    start={{ x: 0.2, y: 0.2 }}
                    end={{ x: 0.8, y: 0.8 }}
                    style={styles.statGradient}
                  >
                    <Text style={styles.statNumber}>{currentUser.eventsAttended}</Text>
                    <Text style={styles.statLabel}>Events{"\n"}Attended</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Stat 2 */}
              <View style={styles.statWrapper}>
                <View style={[
                  styles.statContainer,
                  isPressed ? styles.statContainerPressed : styles.statContainerNormal
                ]}>
                  <LinearGradient
                    colors={[
                      'rgba(255, 255, 255, 0.6)',
                      neomorphColors.statBackground,
                      'rgba(163, 177, 198, 0.08)'
                    ]}
                    start={{ x: 0.2, y: 0.2 }}
                    end={{ x: 0.8, y: 0.8 }}
                    style={styles.statGradient}
                  >
                    <Text style={styles.statNumber}>{currentUser.joinedGroups}</Text>
                    <Text style={styles.statLabel}>Groups{"\n"}Joined</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Stat 3 */}
              <View style={styles.statWrapper}>
                <View style={[
                  styles.statContainer,
                  isPressed ? styles.statContainerPressed : styles.statContainerNormal
                ]}>
                  <LinearGradient
                    colors={[
                      'rgba(255, 255, 255, 0.6)',
                      neomorphColors.statBackground,
                      'rgba(163, 177, 198, 0.08)'
                    ]}
                    start={{ x: 0.2, y: 0.2 }}
                    end={{ x: 0.8, y: 0.8 }}
                    style={styles.statGradient}
                  >
                    <Text style={styles.statNumber}>{currentUser.connections}</Text>
                    <Text style={styles.statLabel}>Connections</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          {/* </LinearGradient> */}
        </View>
      {/* </LinearGradient> */}
    </TouchableOpacity>
  );
};

export default UserStat;

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.sm,
  },

  mainContainerNormal: {
    
    // ...Platform.select({
    //   web: {
    //     filter:
    //       'drop-shadow(4px 4px 8px rgba(163, 177, 198, 0.15)) drop-shadow(-4px -4px 8px rgba(255, 255, 255, 0.7))',
    //   },
    //   ios: {
    //     shadowColor: neomorphColors.darkShadow,
    //     shadowOffset: { width: 4, height: 4 },
    //     shadowOpacity: 0.15,
    //     shadowRadius: 8,
    //   },
    //   android: {
    //     elevation: 6,
    //   },
    // }),
  },

  mainContainerPressed: {
    ...Platform.select({
      web: {
        filter:
          'drop-shadow(2px 2px 4px rgba(163, 177, 198, 0.2)) drop-shadow(-2px -2px 4px rgba(255, 255, 255, 0.6))',
      },
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  outerGradient: {
    borderRadius: 18,
    padding: 1.5,
  },

  innerCard: {
    borderRadius: 16,
    backgroundColor:'skyblue'

  },

  innerCardNormal: {
    ...Platform.select({
      web: {
        boxShadow:
          'inset 1px 1px 2px rgba(163, 177, 198, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.7)',
      },
      ios: {
        shadowColor: neomorphColors.lightShadow,
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
      },
      android: {
        borderWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.5)',
        borderLeftColor: 'rgba(255, 255, 255, 0.5)',
        borderRightColor: 'rgba(163, 177, 198, 0.15)',
        borderBottomColor: 'rgba(163, 177, 198, 0.15)',
      },
    }),
  },

  innerCardPressed: {
    // ...Platform.select({
    //   web: {
    //     boxShadow:
    //       'inset 2px 2px 4px rgba(163, 177, 198, 0.1), inset -1px -1px 2px rgba(255, 255, 255, 0.6)',
    //   },
    //   ios: {
    //     shadowColor: neomorphColors.darkShadow,
    //     shadowOffset: { width: 1, height: 1 },
    //     shadowOpacity: 0.15,
    //     shadowRadius: 2,
    //   },
    //   android: {
    //     borderWidth: 1,
    //     borderTopColor: 'rgba(163, 177, 198, 0.25)',
    //     borderLeftColor: 'rgba(163, 177, 198, 0.25)',
    //     borderRightColor: 'rgba(255, 255, 255, 0.3)',
    //     borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    //   },
    // }),
  },

  cardContent: {
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,

  },

  headerSection: {
    padding:10
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: typography.fontFamily.bold,
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding:12,
    gap: spacing.xs,
  },

  statWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  statContainer: {
    borderRadius: 12,
    width: '100%',
    minHeight: 70,
    backgroundColor: neomorphColors.background,
  },

  statContainerNormal: {
    ...Platform.select({
      web: {
        boxShadow:
          '2px 2px 6px rgba(163, 177, 198, 0.15), -2px -2px 6px rgba(255, 255, 255, 0.7)',
      },
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        // shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  statContainerPressed: {
    ...Platform.select({
      web: {
        boxShadow:
          '1px 1px 3px rgba(163, 177, 198, 0.2), -1px -1px 3px rgba(255, 255, 255, 0.6)',
      },
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  statGradient: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 68,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: neomorphColors.primary,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    lineHeight: 13,
  },
});
