import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { auth } from '../../../shared/config/config/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { setAuthToken } from '../../services/api';
import { API_BASE_URL } from '../../../shared/config/config/constants';

type OTPScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;
type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

interface Props {
  navigation: OTPScreenNavigationProp;
  route: OTPScreenRouteProp;
}

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last input
      if (index + pastedOtp.length < 6) {
        inputRefs.current[index + pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with backend
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Sign in with custom token from backend
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      
      // Get ID token and store it
      const idToken = await userCredential.user.getIdToken();
      await setAuthToken(idToken);

      // Navigation will be handled by AuthContext
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      Alert.alert(
        'Error',
        error.message || 'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // In development, show OTP in console/alert for testing
      if (__DEV__ && data.otp) {
        console.log(`📱 OTP for ${phoneNumber}: ${data.otp}`);
        Alert.alert(
          'Development Mode',
          `New OTP: ${data.otp}\n\n(This is only shown in development mode)`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Success', 'OTP has been resent to your phone number');
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          {phoneNumber}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={loading}
        >
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default OTPScreen;

