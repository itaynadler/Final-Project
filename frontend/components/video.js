import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);

const VideosPage = () => {
  const [membershipType, setMembershipType] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMembershipType();
  }, []);

  const fetchMembershipType = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { id } = JSON.parse(userData);
        const response = await fetch(`http://localhost:3000/user/${id}`);
        const data = await response.json();
        setMembershipType(data.membershipType);
      }
    } catch (error) {
      console.error('Error fetching membership type:', error);
    }
  };

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

  if (membershipType === 'partial') {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedText}>
          Videos are not included in your current membership plan.
        </Text>
        <Text style={styles.restrictedSubText}>
          Upgrade to a full membership to access our video library.
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Membership</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  scrollViewContent: {
    padding: 16,
  },
  videoContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  video: {
    width: ITEM_WIDTH,
    height: 200,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  restrictedText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  restrictedSubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideosPage;
