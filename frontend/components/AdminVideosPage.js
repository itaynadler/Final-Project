import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://3.91.21.194:3000/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Error', 'Failed to fetch videos');
    }
  };

  const addVideo = async () => {
    if (!title || !videoId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://3.91.21.194:3000/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, videoId }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Video added successfully');
        setTitle('');
        setVideoId('');
        fetchVideos();
      } else {
        Alert.alert('Error', 'Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video');
    }
  };

  const deleteVideo = async (id) => {
    try {
      const response = await fetch(`http://3.91.21.194:3000/videos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Success', 'Video deleted successfully');
        fetchVideos();
      } else {
        Alert.alert('Error', 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      Alert.alert('Error', 'Failed to delete video');
    }
  };

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoItem}>
      <Text style={styles.videoTitle}>{item.title}</Text>
      <Text style={styles.videoId}>Video ID: {item.videoId}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteVideo(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Videos</Text>
      <TextInput
        style={styles.input}
        placeholder="Video Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="YouTube Video ID"
        value={videoId}
        onChangeText={setVideoId}
      />
      <TouchableOpacity style={styles.addButton} onPress={addVideo}>
        <Text style={styles.addButtonText}>Add Video</Text>
      </TouchableOpacity>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4150',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  videoItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 5,
  },
  videoId: {
    fontSize: 14,
    color: '#7d8a9a',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default AdminVideosPage;
