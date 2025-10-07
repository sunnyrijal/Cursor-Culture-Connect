import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useAlert } from '@/contexts/AlertContext';

const socialIcons: { [key: string]: { name: string; type: 'fa' | 'fa5' } } = {
  facebook: { name: 'facebook', type: 'fa' },
  instagram: { name: 'instagram', type: 'fa' },
  twitter: { name: 'twitter', type: 'fa' },
  linkedin: { name: 'linkedin', type: 'fa' },
  github: { name: 'github', type: 'fa' },
  youtube: { name: 'youtube', type: 'fa' },
  portfolio: { name: 'globe', type: 'fa' },
  tiktok: { name: 'tiktok', type: 'fa5' },
  snapchat: { name: 'snapchat-ghost', type: 'fa' },
  discord: { name: 'discord', type: 'fa5' },
  whatsapp: { name: 'whatsapp', type: 'fa' },
  telegram: { name: 'telegram', type: 'fa' },
  pinterest: { name: 'pinterest', type: 'fa' },
  reddit: { name: 'reddit', type: 'fa' },
  twitch: { name: 'twitch', type: 'fa' },
};

const socialColors: { [key: string]: string } = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  github: '#333',
  youtube: '#FF0000',
  portfolio: '#34495E',
  tiktok: '#000000',
  snapchat: '#FFFC00',
  discord: '#5865F2',
  whatsapp: '#25D366',
  telegram: '#0088cc',
  pinterest: '#E60023',
  reddit: '#FF4500',
  twitch: '#9146FF',
  default: '#6366F1',
};

interface SocialMediaLinksProps {
  socialMedia: { [key: string]: string };
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ socialMedia }) => {
  const { showAlert } = useAlert();
  
  if (!socialMedia || Object.keys(socialMedia).length === 0) {
    return null;
  }

  const handlePress = async (url: string) => {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const supported = await Linking.canOpenURL(fullUrl);

    if (supported) {
      await Linking.openURL(fullUrl);
    } else {
      showAlert({
        title: 'Unsupported URL',
        message: `Could not open the link: ${fullUrl}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      <View style={styles.linksContainer}>
        {Object.entries(socialMedia).map(([platform, link]) => {
          const iconConfig = socialIcons[platform.toLowerCase()];
          const color = socialColors[platform.toLowerCase()] || socialColors.default;
          
          if (!link || !iconConfig) return null;

          const IconComponent = iconConfig.type === 'fa5' ? FontAwesome5 : FontAwesome;

          return (
            <TouchableOpacity
              key={platform}
              style={[styles.iconWrapper, { backgroundColor: color }]}
              onPress={() => handlePress(link)}
            >
              <IconComponent name={iconConfig.name} color="white" size={20} />
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
    color: '#1F2937',
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