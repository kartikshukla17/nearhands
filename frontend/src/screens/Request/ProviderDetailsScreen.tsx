import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList, ServiceRequest } from '../../types';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

type ProviderDetailsScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ProviderDetails'>;
type ProviderDetailsScreenRouteProp = RouteProp<AppStackParamList, 'ProviderDetails'>;

interface Props {
  navigation: ProviderDetailsScreenNavigationProp;
  route: ProviderDetailsScreenRouteProp;
}

const ProviderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequestDetails();
  }, []);

  const fetchRequestDetails = async () => {
    try {
      const data = await api.serviceRequests.getById(requestId);
      setRequest(data);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      setError('Failed to load provider details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading provider details...</Text>
        </View>
      </View>
    );
  }

  if (error || !request || !request.provider) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>
            {error || 'Provider details not available'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleGoHome}>
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { provider } = request;
  const totalPrice = (request.base_price || 0) + (request.extra_charges || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.title}>Service Provider Found!</Text>
          <Text style={styles.subtitle}>Here is your service provider</Text>
        </View>

        {/* Provider Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.providerIcon}>
              <Ionicons name="person" size={32} color="#007AFF" />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{provider.rating?.toFixed(1) || 'N/A'}</Text>
                <Text style={styles.jobsCount}>
                  ({provider.total_jobs || 0} jobs)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.detailText}>{provider.phone}</Text>
            </View>
            {provider.email && (
              <View style={styles.detailRow}>
                <Ionicons name="mail" size={20} color="#666" />
                <Text style={styles.detailText}>{provider.email}</Text>
              </View>
            )}
            {provider.verified && (
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.detailText}>Verified Provider</Text>
              </View>
            )}
          </View>
        </View>

        {/* Service Details Card */}
        {request.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Description</Text>
            <Text style={styles.descriptionText}>{request.description}</Text>
            {request.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{request.category}</Text>
              </View>
            )}
          </View>
        )}

        {/* Price Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          {request.base_price && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Price:</Text>
              <Text style={styles.priceValue}>₹{request.base_price.toFixed(2)}</Text>
            </View>
          )}
          {request.extra_charges && request.extra_charges > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Extra Charges:</Text>
              <Text style={styles.priceValue}>₹{request.extra_charges.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalPriceRow]}>
            <Text style={styles.totalPriceLabel}>Total:</Text>
            <Text style={styles.totalPriceValue}>₹{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* OTP Card */}
        {request.otp && (
          <View style={[styles.card, styles.otpCard]}>
            <Text style={styles.otpTitle}>Verification OTP</Text>
            <Text style={styles.otpSubtitle}>
              Share this OTP with the service provider when they arrive
            </Text>
            <View style={styles.otpContainer}>
              <Text style={styles.otpCode}>{request.otp}</Text>
            </View>
            <Text style={styles.otpNote}>
              This OTP will be verified when the service starts
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  providerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
  },
  jobsCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  otpCard: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  otpCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 8,
  },
  otpNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProviderDetailsScreen;

