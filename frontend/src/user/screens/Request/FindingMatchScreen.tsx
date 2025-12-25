import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types';
import api from '../../services/api';
import { POLLING_INTERVAL, MAX_POLLING_ATTEMPTS, REQUEST_STATUS } from '../../../shared/config/config/constants';
import { Ionicons } from '@expo/vector-icons';

type FindingMatchScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'FindingMatch'>;
type FindingMatchScreenRouteProp = RouteProp<AppStackParamList, 'FindingMatch'>;

interface Props {
  navigation: FindingMatchScreenNavigationProp;
  route: FindingMatchScreenRouteProp;
}

const FindingMatchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Start polling
    pollForMatch();

    return () => {
      pulseAnimation.stop();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollForMatch = async () => {
    try {
      const request = await api.serviceRequests.getById(requestId);

      // Check if request is matched
      if (request.status === REQUEST_STATUS.MATCHED && request.provider_id) {
        // Match found! Navigate to provider details
        navigation.replace('ProviderDetails', { requestId });
        return;
      }

      // Check if request is cancelled or failed
      if (
        request.status === REQUEST_STATUS.CANCELLED ||
        (request.status === REQUEST_STATUS.PENDING && pollingAttempts >= MAX_POLLING_ATTEMPTS)
      ) {
        setError('Unable to find a service provider at this time. Please try again.');
        setLoading(false);
        return;
      }

      // Continue polling
      setPollingAttempts((prev) => prev + 1);

      if (pollingAttempts < MAX_POLLING_ATTEMPTS) {
        pollingIntervalRef.current = setTimeout(() => {
          pollForMatch();
        }, POLLING_INTERVAL);
      } else {
        setError('Search is taking longer than expected. Please try again.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error polling for match:', error);
      setError('Error checking for matches. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="search" size={80} color="#007AFF" />
        </Animated.View>

        <Text style={styles.title}>Finding a Match</Text>
        <Text style={styles.subtitle}>
          We're searching for the best service provider near you...
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              Please wait, this may take a few moments
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default FindingMatchScreen;

