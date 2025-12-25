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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import { ProviderAppStackParamList } from '../navigation/AppNavigator';
import providerApi from '../services/api';
import { SERVICE_CATEGORIES } from '../../shared/config/config/constants';
import * as Location from 'expo-location';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<ProviderAppStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { provider, firebaseUser, refreshProfile } = useUnifiedAuth();
  const [name, setName] = useState(provider?.name || '');
  const [email, setEmail] = useState(provider?.email || '');
  const [phone, setPhone] = useState(provider?.phone || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(provider?.services || []);
  const [loading, setLoading] = useState(false);

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coordinates: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      if (provider) {
        // Update existing provider
        await providerApi.providers.update(provider.id, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim(),
          services: selectedServices,
          location_coordinates: coordinates,
        });
      } else {
        // Create new provider
        await providerApi.providers.create({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim(),
          services: selectedServices,
          location_coordinates: coordinates,
        });
      }

      await refreshProfile();
      Alert.alert('Success', 'Profile saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {provider ? 'Edit Profile' : 'Complete Your Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {provider
              ? 'Update your provider information'
              : 'Set up your service provider profile to start receiving requests'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Services *</Text>
          <Text style={styles.hint}>Select the services you provide</Text>
          <View style={styles.servicesContainer}>
            {SERVICE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.serviceButton,
                  selectedServices.includes(category.id) && styles.serviceButtonSelected,
                ]}
                onPress={() => toggleService(category.id)}
              >
                <Text
                  style={[
                    styles.serviceButtonText,
                    selectedServices.includes(category.id) && styles.serviceButtonTextSelected,
                  ]}
                >
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  serviceButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  serviceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  serviceButtonText: {
    fontSize: 14,
    color: '#333',
  },
  serviceButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSetupScreen;
