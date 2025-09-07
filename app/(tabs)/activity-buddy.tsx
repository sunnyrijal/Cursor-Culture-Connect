"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useQuery } from "@tanstack/react-query"
import { getUserLogs } from "@/contexts/logs.api"

const theme = {
  primary: "#6366F1",
  accent: "#EC4899",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  background: "#FAFAFA",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray900: "#111827",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  shadow: "rgba(0, 0, 0, 0.1)",
  neomorph: {
    light: "#FFFFFF",
    dark: "#D1D9E6",
  },
}

const neomorphColors = {
  background: "#F0F3F7",
}

export interface GetUserLogsParams {
  page?: number
  limit?: number
}

interface LogItem {
  id: string
  action: string
  description: string
  metadata: {
    [key: string]: any
  }
  timestamp: string
}

interface LogsResponse {
  logs: LogItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}


export default function UserLogsScreen() {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const {
    data: logsResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["logs", currentPage, limit],
    queryFn: () => getUserLogs({ page: currentPage, limit }),
  })


  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create_group":
        return "👥"
      case "create_event":
        return "📅"
      case "join_group":
        return "➕"
      case "leave_group":
        return "➖"
      case "send_friend_request":
        return "🤝"
      case "accept_friend_request":
        return "✅"
      default:
        return "📝"
    }
  }

  const renderLogCard = (log: LogItem) => (
    <View key={log.id} style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logIconContainer}>
          <Text style={styles.logIcon}>{getActionIcon(log.action)}</Text>
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logDescription}>{log.description}</Text>
          <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
        </View>
      </View>

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <View style={styles.logMetadata}>
          {Object.entries(log.metadata).map(([key, value]) => (
            <View key={key} style={styles.metadataItem}>
              <Text style={styles.metadataKey}>{key.replace(/([A-Z])/g, " $1").toLowerCase()}:</Text>
              <Text style={styles.metadataValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  const handleLoadMore = () => {
    if (logsResponse?.pagination.hasNextPage && !isFetching) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    refetch()
  }

  if (isLoading && currentPage === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Logs</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Logs</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load logs</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const logs = logsResponse?.logs || []
  const pagination = logsResponse?.pagination

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Logs</Text>
        {pagination && <Text style={styles.headerSubtitle}>{pagination.totalCount} total activities</Text>}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && currentPage === 1}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No activity logs</Text>
            <Text style={styles.emptyStateSubtitle}>Your activity history will appear here</Text>
          </View>
        ) : (
          <View style={styles.logsContainer}>
            {logs.map(renderLogCard)}

            {pagination?.hasNextPage && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isFetching}>
                {isFetching ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <Text style={styles.loadMoreButtonText}>Load More</Text>
                )}
              </TouchableOpacity>
            )}

            {pagination && (
              <Text style={styles.paginationInfo}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
  },
  logsContainer: {
    padding: 16,
  },
  logCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: theme.neomorph.dark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: theme.neomorph.dark,
      },
    }),
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.gray50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logIcon: {
    fontSize: 18,
  },
  logContent: {
    flex: 1,
  },
  logDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  logMetadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  metadataItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  metadataKey: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
    marginRight: 8,
    textTransform: "capitalize",
  },
  metadataValue: {
    fontSize: 14,
    color: theme.textPrimary,
    flex: 1,
  },
  loadMoreButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
        shadowColor: theme.primary,
      },
    }),
    marginBottom: 8,
  },
  loadMoreButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
  },
  paginationInfo: {
    textAlign: "center",
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
})
