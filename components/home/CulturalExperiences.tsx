import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import { sponsoredContent, sponsoredCategories } from '@/data/sponsoredContent';
import { theme, spacing, typography, borderRadius, neomorphColors } from '../theme';
import CulturalExperienceCard from './CulturalExperienceCard';
import { getAnalytics } from '@/contexts/analytics';

const CulturalExperiences = () => {
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  
  const filteredSponsoredContent = activeSponsoredCategory === 'all'
    ? sponsoredContent
    : sponsoredContent.filter(c => c.type === activeSponsoredCategory);


const handleSponsoredContentPress = async (content: any) => {
  try {
    const supported = await Linking.canOpenURL(content.link);
    if (supported) {
      await Linking.openURL(content.link);
    } else {
      Alert.alert("Error", `Don't know how to open this URL: ${content.link}`);
    }
  } catch (error) {
    console.error("Failed to open URL:", error);
  }
};


  const showAnalytics = async () => {
    console.log('📊 Fetching analytics from API...');
    await getAnalytics();
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover Experiences</Text>
        {/* Debug button - uncomment to test analytics API */}
        {/* <TouchableOpacity onPress={showAnalytics} style={styles.debugBtn}>
          <Text>📊</Text>
        </TouchableOpacity> */}
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {sponsoredCategories.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                activeSponsoredCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => setActiveSponsoredCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeSponsoredCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSponsoredContent.map((content, index) => (
         <CulturalExperienceCard 
           key={`${content.id}-${activeSponsoredCategory}`}
           content={content} 
           handleSponsoredContentPress={handleSponsoredContentPress}  
           index={index}
           activeSponsoredCategory={activeSponsoredCategory}
         />
        ))}
      </ScrollView>
    </View>
  );
};

export default CulturalExperiences;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.lg,
    backgroundColor: neomorphColors.background,
    paddingTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  debugBtn: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  categoryRow: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: neomorphColors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  categoryTabActive: {
    backgroundColor: theme.primary,
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 20,
  },
});