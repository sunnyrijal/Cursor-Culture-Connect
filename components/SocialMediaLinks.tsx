import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Globe,
  Link as LinkIcon,
} from 'lucide-react-native';

const socialIcons: { [key: string]: React.ElementType } = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  portfolio: Globe,
  tiktok: LinkIcon, // Using LinkIcon as a fallback for TikTok
  snapchat: LinkIcon, // Using LinkIcon as a fallback for Snapchat
  discord: LinkIcon, // Using LinkIcon as a fallback for Discord
};

const socialColors: { [key: string]: string } = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  github: '#333',
  youtube: '#FF0000',
  portfolio: '#34495E',
  default: '#6366F1',
};

interface SocialMediaLinksProps {
  socialMedia: { [key: string]: string };
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ socialMedia }) => {
  if (!socialMedia || Object.keys(socialMedia).length === 0) {
    return null;
  }

  const handlePress = async (url: string) => {
    // Prepend https:// if it's missing
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const supported = await Linking.canOpenURL(fullUrl);

    if (supported) {
      await Linking.openURL(fullUrl);
    } else {
      Alert.alert(`Don't know how to open this URL: ${fullUrl}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      <View style={styles.linksContainer}>
        {Object.entries(socialMedia).map(([platform, link]) => {
          const Icon = socialIcons[platform.toLowerCase()] || LinkIcon;
          const color = socialColors[platform.toLowerCase()] || socialColors.default;
          if (!link) return null;

          return (
            <TouchableOpacity
              key={platform}
              style={[styles.iconWrapper, { backgroundColor: color }]}
              onPress={() => handlePress(link)}
            >
              <Icon color="white" size={20} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937', // clayTheme.textPrimary
    marginBottom: 16,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default SocialMediaLinks;