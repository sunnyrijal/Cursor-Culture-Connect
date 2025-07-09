import React from 'react';
import { TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { theme } from '../theme';

interface ShareButtonProps {
  title: string;
  message: string;
  url?: string;
  size?: number;
  color?: string;
  style?: any;
}

export function ShareButton({ 
  title, 
  message, 
  url, 
  size = 20, 
  color = theme.textSecondary,
  style 
}: ShareButtonProps) {
  const handleShare = async () => {
    try {
      const shareContent: any = {
        title,
        message,
      };
      
      if (url && Platform.OS !== 'web') {
        shareContent.url = url;
      } else if (url && Platform.OS === 'web') {
        shareContent.message = `${message}\n\n${url}`;
      }

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      Alert.alert('Error', 'Unable to share content at this time');
    }
  };

  return (
    <TouchableOpacity onPress={handleShare} style={style} activeOpacity={0.7}>
      <Share2 size={size} color={color} />
    </TouchableOpacity>
  );
}