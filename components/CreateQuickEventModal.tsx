"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import {
  X,
  MapPin,
  Check,
  Sparkles,
  Zap,
} from "lucide-react-native"

interface CreateQuickEventModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (eventData: any) => void
}

export function CreateQuickEventModal({ visible, onClose, onSubmit }: CreateQuickEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!visible) {
      setFormData({
        title: "",
        description: "",
        location: "",
      })
      setFocusedField(null)
      setIsSubmitting(false)
    }
  }, [visible])

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    const eventData = {
      name: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      isQuickEvent: true,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await createQuickEventAPI(eventData)
      console.log("Quick event created successfully:", response)
      onSubmit(eventData)
      onClose()
    } catch (error) {
      Alert.alert("Error", "Failed to create quick event. Please try again.")
      console.error("Error creating quick event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            {/* <View style={styles.iconContainer}>
              <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.iconGradient}>
                <Zap size={24} color="#FFFFFF" />
              </LinearGradient>
            </View> */}
            <Text style={styles.title}>Quick Event</Text>
            <Text style={styles.subtitle}>Create an event in seconds</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]}
                style={styles.formGradient}
              >
                {/* Event Title */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "title" && styles.inputWrapperFocused,
                      formData.title && styles.inputWrapperValid,
                    ]}
                  >
                    <Sparkles size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.title}
                      onChangeText={(text) => setFormData({ ...formData, title: text })}
                      placeholder="e.g. Coffee Chat"
                      onFocus={() => setFocusedField("title")}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={100}
                    />
                    {formData.title && <Check size={20} color="#10B981" style={styles.validIcon} />}
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "description" && styles.inputWrapperFocused,
                      formData.description && styles.inputWrapperValid,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={(text) => setFormData({ ...formData, description: text })}
                      placeholder="Brief description of your event..."
                      multiline
                      numberOfLines={3}
                      onFocus={() => setFocusedField("description")}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={300}
                    />
                  </View>
                  <Text style={styles.characterCount}>{formData.description.length}/300</Text>
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "location" && styles.inputWrapperFocused,
                      formData.location && styles.inputWrapperValid,
                    ]}
                  >
                    <MapPin size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.location}
                      onChangeText={(text) => setFormData({ ...formData, location: text })}
                      placeholder="e.g. Library Cafe"
                      onFocus={() => setFocusedField("location")}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={100}
                    />
                    {formData.location && <Check size={20} color="#10B981" style={styles.validIcon} />}
                  </View>
                </View>

                {/* Quick Event Info */}
                <View style={styles.infoContainer}>
                  <LinearGradient colors={["rgba(99, 102, 241, 0.1)", "rgba(139, 92, 246, 0.1)"]} style={styles.infoGradient}>
                    <Zap size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      Quick events are created instantly and visible to everyone immediately!
                    </Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.buttonGradient}>
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Creating..." : "Create Quick Event"}
                </Text>
                {!isSubmitting && <Zap size={20} color="#FFFFFF" style={styles.buttonIcon} />}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const createQuickEventAPI = async (eventData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  console.log("Quick Event API Call - Data being sent:", {
    name: eventData.name,
    description: eventData.description,
    location: eventData.location,
    isQuickEvent: eventData.isQuickEvent,
    createdAt: eventData.createdAt,
  })

  if (Math.random() < 0.9) {
    return {
      success: true,
      eventId: Math.floor(Math.random() * 10000),
      message: "Quick event created successfully",
      data: eventData,
      createdAt: new Date().toISOString(),
    }
  } else {
    throw new Error("Network error - please try again")
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F3F7",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 32,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  blurView: {
    borderRadius: 24,
    overflow: "hidden",
  },
  formGradient: {
    padding: 24,
    borderRadius: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F3F7",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderWidth: 2,
    borderColor: "#CDD2D8",
    minHeight: 56,
    shadowColor: "#CDD2D8",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  inputWrapperFocused: {
    borderColor: "#6366F1",
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    paddingVertical: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  validIcon: {
    marginLeft: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
  infoContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  infoGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingTop: 20,
    gap: 16,
    backgroundColor: "#F0F3F7",
    borderTopWidth: 1,
    borderTopColor: "#CDD2D8",
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(226, 232, 240, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  primaryButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
})