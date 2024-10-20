import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);

const VideosPage = () => {
  const videos = [
    { id: '1', videoId: 'UBMk30rjy0o' },
    { id: '2', videoId: 'ml6cT4AZdqI' },
    { id: '3', videoId: 'vc1E5CfRfos' },
    { id: '4', videoId: 'IODxDxX7oi4' },
  ];

  const VideoComponent = ({ videoId }) => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      return (
        <WebView
          style={styles.video}
          javaScriptEnabled={true}
          source={{
            uri: `https://www.youtube.com/embed/${videoId}`,
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout Videos</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {videos.map((video) => (
          <View key={video.id} style={styles.videoContainer}>
            <VideoComponent videoId={video.videoId} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2d4150',
  },
  videoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: ITEM_WIDTH,
    height: 200,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  video: {
    flex: 1,
  },
});

export default VideosPage;
