import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SERVICE_CATEGORIES } from '../../config/constants';
import * as Location from 'expo-location';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleServiceIconPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = async () => {
    if (!description.trim() && !selectedCategory) {
      Alert.alert('Error', 'Please describe your service need or select a service category');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby service providers.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coordinates: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      // Create service request
      const response = await api.serviceRequests.create({
        category: selectedCategory || undefined,
        description: description.trim() || undefined,
        summary: description.trim() || selectedCategory || undefined,
        location_coordinates: coordinates,
      });

      // Navigate to finding match screen
      navigation.navigate('FindingMatch', {
        requestId: response.request.id,
      });
    } catch (error: any) {
      console.error('Error creating service request:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create service request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>NearHands</Text>

          {/* Text Area with Search Icon */}
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what service you need..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="search" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Future Updates Notice */}
          <View style={styles.futureUpdateContainer}>
            <Text style={styles.futureUpdateText}>
              📎 Upload text and audio (Coming soon)
            </Text>
          </View>

          {/* Service Icons */}
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Popular Services</Text>
            <View style={styles.servicesGrid}>
              {SERVICE_CATEGORIES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceIcon,
                    selectedCategory === service.id && styles.serviceIconSelected,
                  ]}
                  onPress={() => handleServiceIconPress(service.id)}
                  disabled={loading}
                >
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                  <Text
                    style={[
                      styles.serviceName,
                      selectedCategory === service.id && styles.serviceNameSelected,
                    ]}
                  >
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  textAreaContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    paddingRight: 60,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
    maxHeight: 200,
  },
  searchButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#007AFF',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  futureUpdateContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  futureUpdateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  servicesContainer: {
    marginTop: 10,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceIcon: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
  },
  serviceIconSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  serviceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  serviceNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default HomeScreen;

