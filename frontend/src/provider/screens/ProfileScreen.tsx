import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import { ProviderAppStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProviderAppStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { provider, signOut, refreshProfile } = useUnifiedAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Provider profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{provider.name}</Text>
        <Text style={styles.phone}>{provider.phone}</Text>
        {provider.email && <Text style={styles.email}>{provider.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating:</Text>
          <Text style={styles.infoValue}>{provider.rating?.toFixed(1) || '0.0'} ⭐</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Jobs:</Text>
          <Text style={styles.infoValue}>{provider.total_jobs || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Verified:</Text>
          <Text style={styles.infoValue}>
            {provider.verified ? '✅ Yes' : '❌ No'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subscription:</Text>
          <Text style={styles.infoValue}>
            {provider.subscription_active ? '✅ Active' : '❌ Inactive'}
          </Text>
        </View>
      </View>

      {provider.services && provider.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {provider.services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      )}

      {provider.custom_services && provider.custom_services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Services</Text>
          {provider.custom_services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfileSetup')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  serviceTag: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#1976D2',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProfileScreen;
