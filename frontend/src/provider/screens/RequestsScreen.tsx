import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnifiedAuth } from '../../shared/context/UnifiedAuthContext';
import { ProviderAppStackParamList } from '../navigation/AppNavigator';
import providerApi from '../services/api';
import { ServiceRequest } from '../../shared/types/types/index';
import { Ionicons } from '@expo/vector-icons';

type RequestsScreenNavigationProp = NativeStackNavigationProp<ProviderAppStackParamList, 'Requests'>;

const RequestsScreen: React.FC = () => {
  const navigation = useNavigation<RequestsScreenNavigationProp>();
  const { refreshProfile } = useUnifiedAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [newRequests, setNewRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  }, []);

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

  // Check if a request is new
  const isNewRequest = (requestId: string) => {
    return newRequests.some(r => r.id === requestId);
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

  const renderRequest = ({ item }: { item: ServiceRequest }) => {
    const isNew = isNewRequest(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.requestCard,
          isNew && styles.newRequestCard,
        ]}
        onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestHeaderLeft}>
            {isNew && (
              <View style={styles.newBadge}>
                <Ionicons name="notifications" size={12} color="#fff" />
              </View>
            )}
            <Text style={[styles.requestCategory, isNew && styles.newRequestCategory]}>
              {item.category || 'Service Request'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('-', ' ')}</Text>
          </View>
        </View>
        {item.summary && (
          <Text style={styles.requestSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        )}
        {item.user && (
          <Text style={styles.userName}>Customer: {item.user.name}</Text>
        )}
        <Text style={styles.requestDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCategory: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  newRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    backgroundColor: '#FFF9E6',
  },
  newRequestCategory: {
    color: '#FF9500',
    fontWeight: '700',
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

export default RequestsScreen;
