import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface SendOTPData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

// Send OTP to user's email
export const sendOTP = async (data: SendOTPData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/email-verify/send-otp',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify the OTP for the given email
export const verifyOTP = async (data: VerifyOTPData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/email-verify/verify-otp',
      data
    );
    const { accessToken, userId } = response.data;
    console.log(response);
    await AsyncStorage.setItem('token', accessToken);
    await AsyncStorage.setItem('userId', userId.toString());
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Check verification status for an email
export const getVerificationStatus = async (email: string) => {
  try {
    const response: AxiosResponse = await api.get('/email-verify/status', {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching verification status:', error);
    throw error;
  }
};

// Resend OTP to user's email
export const resendOTP = async (data: ResendOTPData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/email-verify/resend-otp',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};
