import { View, StyleSheet } from 'react-native';
import AuthForm from '@/components/AuthForm';
import SignInForm from '@/components/SignInForm';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* <AuthForm initialMode="login" /> */}
    <SignInForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
