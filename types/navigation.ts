import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  login: undefined;
  signup: undefined;
  '(tabs)': undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'login'>;
export type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'signup'>;
