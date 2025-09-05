"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

// Legal text data
const legalTextData = {
  terms: {
    title: "Terms & Conditions",
    content: `Welcome to Culture Connect! These terms and conditions outline the rules and regulations for the use of our application.

1.  **Acceptance of Terms**: By accessing this app, we assume you accept these terms and conditions. Do not continue to use Culture Connect if you do not agree to all of the terms and conditions stated on this page.

2.  **User Accounts**: When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.

3.  **Content**: Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.

4.  **Prohibited Uses**: You may use the Service only for lawful purposes and in accordance with the Terms. You agree not to use the Service in any way that violates any applicable national or international law or regulation.

5.  **Termination**: We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`,
  },
  privacy: {
    title: "Privacy Policy",
    content: `Your privacy is important to us. It is Culture Connect's policy to respect your privacy regarding any information we may collect from you across our app.

1.  **Information We Collect**: We may collect personal information such as your name, email address, university, and other profile details you provide. We also collect data on how you use the app to improve our services.

2.  **How We Use Your Information**: We use the information we collect to operate and maintain our Service, to provide you with a personalized experience, to communicate with you, and to understand how our users use the Service so we can improve it.

3.  **Data Security**: We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.

4.  **Sharing Your Information**: We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our app, so long as those parties agree to keep this information confidential.

5.  **Your Rights**: You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Information directly within your account settings section.`,
  },
}

interface TermsModalProps {
  isVisible: boolean
  modalType: "terms" | "privacy" | null
  onClose: () => void
}

const TermsModal: React.FC<TermsModalProps> = ({ isVisible, modalType, onClose }) => {
  const legalModalContent = modalType ? legalTextData[modalType] : null

  const renderLegalModal = () => (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.legalModalOverlay}>
        <View style={styles.legalModalContainer}>
          <View style={styles.legalModalHeader}>
            <Text style={styles.legalModalTitle}>{legalModalContent?.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.legalModalCloseButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.legalModalScrollView}>
            <Text style={styles.legalModalContent}>{legalModalContent?.content}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.legalModalDoneButton} onPress={onClose}>
            <Text style={styles.legalModalDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return renderLegalModal()
}

const styles = StyleSheet.create({
  legalModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // Highest z-index
  },
  legalModalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10, // High elevation for Android
  },
  legalModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 12,
  },
  legalModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  legalModalCloseButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "bold",
  },
  legalModalScrollView: {
    flexGrow: 0,
  },
  legalModalContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  legalModalDoneButton: {
    marginTop: 20,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  legalModalDoneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default TermsModal