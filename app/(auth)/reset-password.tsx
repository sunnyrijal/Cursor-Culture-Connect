import ResetPasswordForm from '@/components/ResetPasswordForm';
import { View, Text, StyleSheet } from 'react-native';

export default function ResetPasswordScreen() {
  return (
    <View style={styles.container}>
      <ResetPasswordForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});