import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from "expo-blur";
const theme = {
  primary: '#6366F1',
  danger: '#EF4444',
  background: '#F0F3F7',
  white: '#FFFFFF',
  gray200: '#E5E7EB',
  gray500: '#6B7280',
  textPrimary: '#111827',
};

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export const Alert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        // Find a cancel button to close the modal on back press (Android)
        const cancelButton = buttons.find(b => b.style === 'cancel');
        if (cancelButton?.onPress) {
          cancelButton.onPress();
        }
      }}
    >
      <BlurView intensity={50} tint='dark' style={styles.centeredView}>
      
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const buttonStyle: StyleProp<ViewStyle> = [styles.button];
              const textStyle: StyleProp<TextStyle> = [styles.buttonText];

              if (button.style === 'destructive') {
                buttonStyle.push(styles.destructiveButton);
                textStyle.push(styles.destructiveButtonText);
              } else if (button.style === 'cancel') {
                buttonStyle.push(styles.cancelButton);
                textStyle.push(styles.cancelButtonText);
              } else {
                buttonStyle.push(styles.defaultButton);
                textStyle.push(styles.defaultButtonText);
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={buttonStyle}
                  onPress={button.onPress}
                >
                  <Text style={textStyle}>{button.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },

  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: theme.gray500,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButton: { backgroundColor: theme.primary },
  defaultButtonText: { color: theme.white },
  cancelButton: { backgroundColor: theme.gray200 },
  cancelButtonText: { color: theme.textPrimary },
  destructiveButton: { backgroundColor: theme.danger },
  destructiveButtonText: { color: theme.white },
});