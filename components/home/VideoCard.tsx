import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const AutoplayVideo = ({ source, style, ...props }:any) => {
  const videoRef = useRef(null);

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={source}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        useNativeControls={false}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    marginVertical:12,
    borderRadius:24,
    overflow:'hidden'
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default AutoplayVideo;