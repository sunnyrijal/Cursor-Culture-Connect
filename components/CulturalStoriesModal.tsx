import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, BookOpen, User, Globe, Heart, MessageCircle, Share2, Plus, PenTool } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { currentUser } from '@/data/mockData';

interface CulturalStory {
  id: string;
  title: string;
  author: {
    name: string;
    image: string;
    heritage: string[];
  };
  content: string;
  heritage: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  image?: string;
  isLiked: boolean;
}

interface CulturalStoriesModalProps {
  visible: boolean;
  onClose: () => void;
  onPostStory?: () => void;
}

const mockStories: CulturalStory[] = [
  {
    id: '1',
    title: 'The Art of Making Dumplings with Grandma',
    author: {
      name: 'Wei Chen',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      heritage: ['Chinese']
    },
    content: 'Every Chinese New Year, my grandmother would gather the whole family in her small kitchen to make dumplings. The process was sacred - each fold of the wrapper, each pinch of the filling, carried generations of tradition...',
    heritage: 'Chinese',
    tags: ['Food & Cuisine', 'Family Traditions', 'Festivals'],
    likes: 45,
    comments: 12,
    timeAgo: '2 hours ago',
    image: 'https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400',
    isLiked: true
  },
  {
    id: '2',
    title: 'Henna Nights: A Celebration of Love and Community',
    author: {
      name: 'Aisha Patel',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      heritage: ['Indian']
    },
    content: 'The night before my cousin\'s wedding, all the women in our family gathered for the mehndi ceremony. The intricate henna patterns weren\'t just beautiful decorations - they were symbols of joy, spiritual awakening, and the bond between families...',
    heritage: 'Indian',
    tags: ['Wedding Customs', 'Art & Crafts', 'Family Traditions'],
    likes: 67,
    comments: 18,
    timeAgo: '5 hours ago',
    image: 'https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400',
    isLiked: false
  },
  {
    id: '3',
    title: 'Day of the Dead: Honoring Our Ancestors',
    author: {
      name: 'Maria Rodriguez',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      heritage: ['Mexican']
    },
    content: 'Día de los Muertos isn\'t about mourning - it\'s about celebration. We create altars with marigolds, sugar skulls, and our ancestors\' favorite foods. It\'s our way of keeping their memory alive and showing that death is just another part of life\'s journey...',
    heritage: 'Mexican',
    tags: ['Religious Practices', 'Family Traditions', 'Festivals'],
    likes: 89,
    comments: 24,
    timeAgo: '1 day ago',
    image: 'https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=400',
    isLiked: true
  }
];

// Filter stories by current user
const myStories = mockStories.filter(story => story.author.name === currentUser.name);

export function CulturalStoriesModal({ visible, onClose, onPostStory }: CulturalStoriesModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(mockStories.map(story => story.heritage)));

  const getFilteredStories = () => {
    switch (activeTab) {
      case 'my':
        return myStories;
      case 'categories':
        return selectedCategory 
          ? mockStories.filter(story => story.heritage === selectedCategory)
          : mockStories;
      default:
        return mockStories;
    }
  };

  const handleLike = (storyId: string) => {
    // In a real app, this would update the backend
    console.log('Liked story:', storyId);
  };

  const handleComment = (storyId: string) => {
    // In a real app, this would open a comment modal
    console.log('Comment on story:', storyId);
  };

  const handleShare = (storyId: string) => {
    // In a real app, this would open share options
    console.log('Share story:', storyId);
  };

  const handlePostStory = () => {
    onPostStory?.();
    onClose();
  };

  const renderStoryCard = (story: CulturalStory) => (
    <Card key={story.id} style={styles.storyCard}>
      {/* Author Header */}
      <View style={styles.storyHeader}>
        <Image source={{ uri: story.author.image }} style={styles.authorImage} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{story.author.name}</Text>
          <View style={styles.authorMeta}>
            <Badge label={story.heritage} variant="primary" size="sm" />
            <Text style={styles.timeAgo}>{story.timeAgo}</Text>
          </View>
        </View>
      </View>

      {/* Story Content */}
      <Text style={styles.storyTitle}>{story.title}</Text>
      <Text style={styles.storyContent} numberOfLines={3}>{story.content}</Text>

      {/* Story Image */}
      {story.image && (
        <Image source={{ uri: story.image }} style={styles.storyImage} />
      )}

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {story.tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} label={tag} variant="success" size="sm" />
        ))}
        {story.tags.length > 3 && (
          <Badge label={`+${story.tags.length - 3} more`} variant="info" size="sm" />
        )}
      </View>

      {/* Actions */}
      <View style={styles.storyActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(story.id)}
        >
          <Heart 
            size={16} 
            color={story.isLiked ? theme.accent : theme.gray500}
            fill={story.isLiked ? theme.accent : 'none'}
          />
          <Text style={[styles.actionText, story.isLiked && styles.likedText]}>
            {story.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(story.id)}
        >
          <MessageCircle size={16} color={theme.gray500} />
          <Text style={styles.actionText}>{story.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(story.id)}
        >
          <Share2 size={16} color={theme.gray500} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BookOpen size={24} color={theme.primary} />
            <Text style={styles.headerTitle}> Stories</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={handlePostStory} 
              style={styles.postButton}
              activeOpacity={0.8}
            >
              <PenTool size={18} color={theme.white} />
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.gray500} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Globe size={16} color={activeTab === 'all' ? theme.white : theme.gray500} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Stories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => setActiveTab('my')}
          >
            <User size={16} color={activeTab === 'my' ? theme.white : theme.gray500} />
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              My Stories ({myStories.length})
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => setActiveTab('categories')}
          >
            <BookOpen size={16} color={activeTab === 'categories' ? theme.white : theme.gray500} />
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              By Culture
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Category Filter (when categories tab is active) */}
        {activeTab === 'categories' && (
          <View style={styles.categoryFilter}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[styles.categoryButton, !selectedCategory && styles.activeCategoryButton]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryButtonText, !selectedCategory && styles.activeCategoryButtonText]}>
                    All Cultures
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[styles.categoryButtonText, selectedCategory === category && styles.activeCategoryButtonText]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Stories List */}
        <ScrollView style={styles.storiesList} showsVerticalScrollIndicator={false}>
          <View style={styles.storiesContainer}>
            {getFilteredStories().length > 0 ? (
              getFilteredStories().map(renderStoryCard)
            ) : (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={theme.gray400} />
                <Text style={styles.emptyTitle}>No Stories Found</Text>
                <Text style={styles.emptyMessage}>
                  {activeTab === 'my' 
                    ? "You haven't shared any cultural stories yet. Share your first story to connect with others!"
                    : "No stories available for this selection."
                  }
                </Text>
                {activeTab === 'my' && (
                  <Button
                    title="Share Your First Story"
                    onPress={handlePostStory}
                    style={styles.emptyActionButton}
                    leftIcon={<PenTool size={16} color={theme.white} />}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: theme.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.gray500,
  },
  activeTabText: {
    color: theme.white,
  },
  categoryFilter: {
    backgroundColor: theme.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  categoryButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: theme.gray100,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeCategoryButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
  },
  activeCategoryButtonText: {
    color: theme.white,
  },
  storiesList: {
    flex: 1,
  },
  storiesContainer: {
    padding: spacing.lg,
  },
  storyCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeAgo: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
  },
  storyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  storyContent: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
  },
  likedText: {
    color: theme.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  emptyActionButton: {
    paddingHorizontal: spacing.xl,
  },
});