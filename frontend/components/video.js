import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);

const VideosPage = () => {
  const [membershipType, setMembershipType] = useState('');
  const [videos, setVideos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showLovedOnly, setShowLovedOnly] = useState(false);
  const navigation = useNavigation();

  const fetchMembershipType = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { id } = JSON.parse(userData);
        setUserId(id);
        const response = await fetch(`http://3.91.21.194:3000/user/${id}`);
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

  useEffect(() => {
    fetchVideos();
  }, [userId, showLovedOnly]);

  const fetchVideos = async () => {
    try {
      const url = showLovedOnly ? `http://3.91.21.194:3000/videos/loved/${userId}` : 'http://3.91.21.194:3000/videos';
      const response = await fetch(url);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Error', 'Failed to fetch videos');
    }
  };

  const toggleLoveVideo = async (videoId) => {
    try {
      const response = await fetch(`http://3.91.21.194:3000/videos/${videoId}/toggle-love`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      fetchVideos();
    } catch (error) {
      console.error('Error toggling love status:', error);
      Alert.alert('Error', 'Failed to update love status');
    }
  };

  const VideoComponent = ({ video }) => {
    const isLoved = video.lovedBy.includes(userId);

    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <TouchableOpacity onPress={() => toggleLoveVideo(video._id)}>
            <Icon name={isLoved ? 'heart' : 'heart-outline'} size={24} color={isLoved ? 'red' : 'black'} />
          </TouchableOpacity>
        </View>
        {Platform.OS === 'web' ? (
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <WebView
            style={styles.video}
            javaScriptEnabled={true}
            source={{
              uri: `https://www.youtube.com/embed/${video.videoId}`,
            }}
          />
        )}
      </View>
    );
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
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowLovedOnly(!showLovedOnly)}
      >
        <Text style={styles.filterButtonText}>
          {showLovedOnly ? 'Show All Videos' : 'Show Loved Videos'}
        </Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {videos.map((video) => (
          <VideoComponent key={video._id} video={video} />
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
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007BFF',
  },
  filterButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VideosPage;
