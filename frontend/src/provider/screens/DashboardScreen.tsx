import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import { ProviderAppStackParamList } from '../navigation/AppNavigator';
import providerApi from '../services/api';
import { ServiceRequest } from '../../shared/types/types/index';
import { Ionicons } from '@expo/vector-icons';

type DashboardScreenNavigationProp = NativeStackNavigationProp<ProviderAppStackParamList, 'Dashboard'>;

const POLLING_INTERVAL = 10000; // Poll every 10 seconds for new requests

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { provider, refreshProfile } = useUnifiedAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [newRequests, setNewRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await providerApi.serviceRequests.getByProvider();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNewRequests = async () => {
    try {
      const data = await providerApi.serviceRequests.getNewRequests();
      setNewRequests(data);
    } catch (error) {
      console.error('Error fetching new requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchNewRequests();

    // Start polling for new requests
    pollingIntervalRef.current = setInterval(() => {
      fetchNewRequests();
      // Also refresh all requests periodically
      fetchRequests();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
      fetchNewRequests();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchRequests(), fetchNewRequests(), refreshProfile()]);
  };

  const activeRequests = requests.filter(r => 
    ['matched', 'in-progress'].includes(r.status)
  );
  const pendingRequests = requests.filter(r => r.status === 'matched');
  const completedRequests = requests.filter(r => r.status === 'completed');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{provider?.name || 'Provider'}</Text>
          </View>
          {newRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications" size={24} color="#FF9500" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newRequests.length}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {newRequests.length > 0 && (
        <View style={styles.newRequestsSection}>
          <View style={styles.newRequestsHeader}>
            <Ionicons name="notifications-circle" size={20} color="#FF9500" />
            <Text style={styles.newRequestsTitle}>
              New Requests ({newRequests.length})
            </Text>
          </View>
          {newRequests.slice(0, 3).map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.newRequestCard}
              onPress={() => navigation.navigate('RequestDetails', { requestId: request.id })}
            >
              <View style={styles.newRequestContent}>
                <View style={styles.newRequestInfo}>
                  <Text style={styles.newRequestCategory}>
                    {request.category || 'Service Request'}
                  </Text>
                  {request.user && (
                    <Text style={styles.newRequestUser}>
                      Customer: {request.user.name}
                    </Text>
                  )}
                  {request.summary && (
                    <Text style={styles.newRequestSummary} numberOfLines={1}>
                      {request.summary}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </View>
            </TouchableOpacity>
          ))}
          {newRequests.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Requests')}
            >
              <Text style={styles.viewAllButtonText}>
                View All New Requests ({newRequests.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeRequests.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingRequests.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedRequests.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{provider?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Requests')}
      >
        <Text style={styles.buttonText}>View All Requests</Text>
      </TouchableOpacity>

      {activeRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Requests</Text>
          {activeRequests.slice(0, 3).map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => navigation.navigate('RequestDetails', { requestId: request.id })}
            >
              <Text style={styles.requestTitle}>{request.category || 'Service Request'}</Text>
              <Text style={styles.requestStatus}>{request.status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>View Profile</Text>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#34C759',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestStatus: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newRequestsSection: {
    backgroundColor: '#FFF9E6',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  newRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  newRequestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    marginLeft: 8,
  },
  newRequestCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  newRequestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newRequestInfo: {
    flex: 1,
  },
  newRequestCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  newRequestUser: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  newRequestSummary: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
