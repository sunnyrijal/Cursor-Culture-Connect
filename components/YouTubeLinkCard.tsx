import React from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

const YOUTUBE_VIDEO_ID = 'xZespC4JRSI';
const YOUTUBE_URL = `https://youtu.be/${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/0.jpg`;

export default function YouTubeLinkCard() {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(YOUTUBE_URL)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: YOUTUBE_THUMBNAIL }} style={styles.thumbnail} />
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.playButton}>▶</Text>
      </View>
      <Text style={styles.caption}>Watch: Culture Connect Video</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  thumbnail: {
    width: 320,
    height: 180,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    fontSize: 48,
    color: 'white',
    opacity: 0.85,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  caption: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 