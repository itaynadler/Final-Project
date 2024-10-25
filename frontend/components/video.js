import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);

const VideosPage = () => {
  const [membershipType, setMembershipType] = useState('');
  const [videos, setVideos] = useState([
    { id: '1', title: 'Full Body HIIT Workout', videoId: 'ml6cT4AZdqI' },
    { id: '2', title: 'Yoga for Beginners', videoId: 'v7AYKMP6rOE' },
    { id: '3', title: '30-Minute Cardio Workout', videoId: 'CBWQGb4LyAM' },
    { id: '4', title: 'Core Strength Training', videoId: 'DHD1-2P94DI' },
    { id: '5', title: 'Pilates for Flexibility', videoId: 'K56Z12XNQ5c' },
    { id: '6', title: 'Upper Body Strength', videoId: 'l0CwCvJbGZI' },
    { id: '7', title: 'Lower Body Workout', videoId: 'xpzMr3nSOIE' },
    { id: '8', title: 'Zumba Dance Workout', videoId: 'ZNpCqF9XRqQ' },
    { id: '9', title: 'Meditation for Stress Relief', videoId: 'inpok4MKVLM' },
    { id: '10', title: 'Kickboxing Cardio', videoId: 'bEv6CCg2BC8' },
    { id: '11', title: 'Bodyweight Exercises', videoId: 'UBMk30rjy0o' },
    { id: '12', title: 'Stretching Routine', videoId: 'sTxC3J3gQEU' },
    { id: '13', title: 'Abs Workout', videoId: '1919eTCoESo' },
    { id: '14', title: 'Resistance Band Exercises', videoId: 'rXPLkz0cVoI' },
    { id: '15', title: 'Cool Down and Relaxation', videoId: 'qULTwquOuT4' },
  ]);
  const navigation = useNavigation();

  const fetchMembershipType = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMembershipType();
      global.refreshVideosAccess = fetchMembershipType;
      return () => {
        global.refreshVideosAccess = null;
      };
    }, [fetchMembershipType])
  );

  const VideoComponent = ({ videoId, title }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.videoContainer}>
          <Text style={styles.videoTitle}>{title}</Text>
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </View>
      );
    } else {
      return (
        <View style={styles.videoContainer}>
          <Text style={styles.videoTitle}>{title}</Text>
          <WebView
            style={styles.video}
            javaScriptEnabled={true}
            source={{
              uri: `https://www.youtube.com/embed/${videoId}`,
            }}
          />
        </View>
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
          <VideoComponent key={video.id} videoId={video.videoId} title={video.title} />
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
    backgroundColor: '#fff',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#007BFF',
    color: '#fff',
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
