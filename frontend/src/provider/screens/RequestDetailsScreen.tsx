import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import { ProviderAppStackParamList } from '../navigation/AppNavigator';
import providerApi from '../services/api';
import { ServiceRequest } from '../../shared/types/types/index';

type RequestDetailsScreenRouteProp = RouteProp<ProviderAppStackParamList, 'RequestDetails'>;
type RequestDetailsScreenNavigationProp = NativeStackNavigationProp<ProviderAppStackParamList, 'RequestDetails'>;

const RequestDetailsScreen: React.FC = () => {
  const route = useRoute<RequestDetailsScreenRouteProp>();
  const navigation = useNavigation<RequestDetailsScreenNavigationProp>();
  const { requestId } = route.params;
  const { provider } = useUnifiedAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const data = await providerApi.serviceRequests.getById(requestId);
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request details:', error);
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await providerApi.serviceRequests.updateStatus(requestId, newStatus);
      await fetchRequestDetails();
      Alert.alert('Success', 'Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartJob = () => {
    Alert.prompt(
      'Enter OTP',
      'Please enter the OTP to start the job',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async (otp) => {
            if (!otp) {
              Alert.alert('Error', 'OTP is required');
              return;
            }
            setUpdating(true);
            try {
              await providerApi.serviceRequests.verifyOTP(requestId, otp, 'start');
              await fetchRequestDetails();
              Alert.alert('Success', 'Job started successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleCompleteJob = () => {
    Alert.prompt(
      'Enter OTP',
      'Please enter the OTP to complete the job',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async (otp) => {
            if (!otp) {
              Alert.alert('Error', 'OTP is required');
              return;
            }
            setUpdating(true);
            try {
              await providerApi.serviceRequests.verifyOTP(requestId, otp, 'complete');
              await fetchRequestDetails();
              Alert.alert('Success', 'Job completed successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{request.category || 'Service Request'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{request.status.replace('-', ' ')}</Text>
        </View>
      </View>

      {request.user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text style={styles.infoText}>Name: {request.user.name}</Text>
          <Text style={styles.infoText}>Phone: {request.user.phone}</Text>
          {request.user.email && (
            <Text style={styles.infoText}>Email: {request.user.email}</Text>
          )}
        </View>
      )}

      {request.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.infoText}>{request.summary}</Text>
        </View>
      )}

      {request.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.infoText}>{request.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        {request.base_price && (
          <Text style={styles.infoText}>Base Price: ₹{request.base_price}</Text>
        )}
        {request.extra_charges && (
          <Text style={styles.infoText}>Extra Charges: ₹{request.extra_charges}</Text>
        )}
        <Text style={styles.infoText}>
          Total: ₹{(request.base_price || 0) + (request.extra_charges || 0)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Request Date</Text>
        <Text style={styles.infoText}>
          {new Date(request.created_at).toLocaleString()}
        </Text>
      </View>

      {request.status === 'matched' && (
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={handleStartJob}
          disabled={updating}
        >
          <Text style={styles.buttonText}>Start Job</Text>
        </TouchableOpacity>
      )}

      {request.status === 'in-progress' && (
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleCompleteJob}
          disabled={updating}
        >
          <Text style={styles.buttonText}>Complete Job</Text>
        </TouchableOpacity>
      )}

      {updating && (
        <View style={styles.updatingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.updatingText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'matched':
      return '#FF9500';
    case 'in-progress':
      return '#007AFF';
    case 'completed':
      return '#34C759';
    case 'cancelled':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  completeButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  updatingText: {
    marginLeft: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default RequestDetailsScreen;
