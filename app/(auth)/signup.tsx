import { View, StyleSheet } from 'react-native';
import AuthForm from '@/components/AuthForm';
import SignUpForm from '@/components/SignUpForm';

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <AuthForm initialMode="signup" />

      {/* <SignUpForm /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
