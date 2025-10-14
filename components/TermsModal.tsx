"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

// Legal text data
const legalTextData = {
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        number: "1.",
        title: "Acceptance of Terms",
        content: "By accessing this app, we assume you accept these terms and conditions. Do not continue to use TRiVO if you do not agree to all of the terms and conditions stated on this page."
      },
      {
        number: "2.",
        title: "No Tolerance for Objectionable Content",
        content: "TRiVO has a zero-tolerance policy for any kind of harmful or inappropriate content, including but not limited to:",
        bullets: [
          "Harassment, bullying, or threats",
          "Hate speech, discrimination, or offensive language",
          "Spam, scams, or misleading information",
          "Explicit, violent, or adult content",
          "Any behavior that violates laws or university policies"
        ],
        footer: "If you encounter such content, please report it immediately using the in-app \"Report\" or \"Flag\" option. Our moderation team reviews reports and may remove content or suspend users who violate these rules."
      },
      {
        number: "3.",
        title: "User Accounts",
        content: "When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service."
      },
      {
        number: "4.",
        title: "Content",
        content: "Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness."
      },
      {
        number: "5.",
        title: "Prohibited Uses",
        content: "You may use the Service only for lawful purposes and in accordance with the Terms. You agree not to use the Service in any way that violates any applicable national or international law or regulation."
      },
      {
        number: "6.",
        title: "Termination",
        content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Your privacy is important to us. It is TRiVO's policy to respect your privacy regarding any information we may collect from you across our app.",
    sections: [
      {
        number: "1.",
        title: "Information We Collect",
        content: "We may collect personal information such as your name, email address, university, and other profile details you provide. We also collect data on how you use the app to improve our services."
      },
      {
        number: "2.",
        title: "How We Use Your Information",
        content: "We use the information we collect to operate and maintain our Service, to provide you with a personalized experience, to communicate with you, and to understand how our users use the Service so we can improve it."
      },
      {
        number: "3.",
        title: "Data Security",
        content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable."
      },
      {
        number: "4.",
        title: "Sharing Your Information",
        content: "We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our app, so long as those parties agree to keep this information confidential."
      },
      {
        number: "5.",
        title: "Your Rights",
        content: "You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Information directly within your account settings section."
      }
    ]
  },
}

interface TermsModalProps {
  isVisible: boolean
  modalType: "terms" | "privacy" | null
  onClose: () => void
}

const TermsModal: React.FC<TermsModalProps> = ({ isVisible, modalType, onClose }) => {
  const legalModalContent = modalType ? legalTextData[modalType] : null

  const renderSection = (section: any, index: number) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{section.number} </Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
      
      {section.bullets && (
        <View style={styles.bulletContainer}>
          {section.bullets.map((bullet: string, idx: number) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>• </Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
      
      {section.footer && (
        <Text style={styles.sectionFooter}>{section.footer}</Text>
      )}
    </View>
  )

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
          <ScrollView style={styles.legalModalScrollView} showsVerticalScrollIndicator={true}>
            {modalType === "terms" && (
              <View>
                <Text style={styles.introText}>
                  Welcome to TRiVO! These terms and conditions outline the rules and regulations for the use of our application.
                </Text>
                {legalModalContent?.sections.map((section: any, index: number) => 
                  renderSection(section, index)
                )}
              </View>
            )}
            
            {modalType === "privacy" && (
              <View>
                {modalType === "privacy" && legalTextData.privacy.intro && (
                  <Text style={styles.introText}>{legalTextData.privacy.intro}</Text>
                )}
                {legalModalContent?.sections.map((section: any, index: number) => 
                  renderSection(section, index)
                )}
              </View>
            )}
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
    zIndex: 9999,
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
    elevation: 10,
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
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  bulletContainer: {
    marginTop: 8,
    marginLeft: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#374151",
    marginRight: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  sectionFooter: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginTop: 8,
  },
  legalModalDoneButton: {
    marginTop: 12,
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