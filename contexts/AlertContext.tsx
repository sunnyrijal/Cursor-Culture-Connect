// contexts/AlertContext.tsx or utils/AlertContext.tsx
import { Alert, AlertButton } from '@/utils/Alert';
import { Alert as NativeAlert, Platform } from 'react-native';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = ({ title, message, buttons = [{ text: 'OK' }] }: AlertOptions) => {
    if (Platform.OS === 'ios') {
      // Use native alert for iOS for better integration and to avoid modal issues.
      NativeAlert.alert(title, message, buttons);
    } else {
      // Use custom alert for Android.
      setAlertState({
        visible: true,
        title,
        message,
        buttons: buttons.map((button) => ({
          ...button,
          onPress: () => {
            button.onPress?.();
            hideAlert();
          },
        })),
      });
    }
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {Platform.OS !== 'ios' && (
        <Alert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
        />
      )}
    </AlertContext.Provider>
  );
};