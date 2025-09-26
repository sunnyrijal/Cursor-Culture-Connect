import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { View, StyleSheet } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <ForgotPasswordForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});