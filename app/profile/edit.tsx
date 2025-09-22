"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { router } from "expo-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Picker } from '@react-native-picker/picker';

import { 
  ArrowLeft,
  Save,
  User,
  GraduationCap,
  Globe2,
  MapPin,
  Calendar,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Link,
  BookOpen, Heart,
} from "lucide-react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from "react-native-reanimated"
import * as ImagePicker from "expo-image-picker"
import DateTimePicker from "@react-native-community/datetimepicker"

import type { UserProfile } from "@/types/user"
import { getMyData, updateProfile } from "@/contexts/user.api"
import { getUniversities } from "@/contexts/university.api"
import { uploadFile } from "@/contexts/file.api"
import UniversityDropdown from "@/components/UniversityDropdown"
import { INTERESTS_OPTIONS, MAJOR_OPTIONS, CLASS_YEAR_OPTIONS, ETHNICITY_OPTIONS } from "@/components/AuthForm"

const { width, height } = Dimensions.get("window")

export const socialPlatforms = [
      "Facebook",
      "Instagram",
      "Twitter",
      "LinkedIn",
      "GitHub",
      "TikTok",
      "YouTube",
      "Snapchat",
      "Discord",
      "Portfolio",
    ]



export default function EditProfile() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    firstName: "",
    lastName: "",
    bio: "",
    city: "",
    state: "",
    classYear: "",
    countryOfOrigin: "",
    dateOfBirth: "",
    major: "",
  })

  const [focusedInput, setFocusedInput] = useState<string>("")
  const [fieldValidation, setFieldValidation] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [university, setUniversity] = useState<string>("")
  const [interests, setInterests] = useState<string[]>([])
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([])
  const [customInterest, setCustomInterest] = useState<string>("")
  const [newLanguage, setNewLanguage] = useState<string>("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [socialMedia, setSocialMedia] = useState<{ [key: string]: string }>({})
  const [newSocialPlatform, setNewSocialPlatform] = useState<string>("")
  const [newSocialLink, setNewSocialLink] = useState<string>("")

  const socialPlatformPickerRef = useRef<Picker<string>>(null);
  const majorPickerRef = useRef<Picker<string>>(null);
  const classYearPickerRef = useRef<Picker<string>>(null);

    const [ethnicity, setEthnicity] = useState<string[]>([]);
  

  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(30)

  const queryClient = useQueryClient()

  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: getUniversities,
  })

  useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    formTranslateY.value = withSpring(0, { damping: 20, stiffness: 100 })
  }, [])

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }))

  const validateField = (fieldName: string, value: string) => {
    let isValid = false

    switch (fieldName) {
      case "firstName":
      case "lastName":
        isValid = value.trim().length >= 2
        break
      case "dateOfBirth":
        isValid = /^\d{4}-\d{2}-\d{2}$/.test(value)
        break
      case "phone":
        isValid = value.length >= 10
        break
      case "major":
      case "graduationYear":
        break
      default:
        isValid = value.trim().length > 0
    }

    setFieldValidation((prev) => ({ ...prev, [fieldName]: isValid }))
    return isValid
  }

  const { isLoading, error: queryError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      console.log("[v0] Fetching user data...")
      const response = await getMyData()
      console.log("[v0] User data response:", response)

      if (response.success && response.user) {
        const userData = response.user
        setProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          bio: userData.bio || "",
          city: userData.city || "",
          state: userData.state || "",
          classYear: userData.classYear || "",
          countryOfOrigin: userData.countryOfOrigin || "",
          dateOfBirth: userData.dateOfBirth || "",
          major: userData.major || "",
        })

        if (userData.university) {
          setUniversity(userData.university.name || "")
        }
        if (userData.interests) {
          setInterests(userData.interests)
        }
        if (userData.languagesSpoken) {
          setLanguagesSpoken(userData.languagesSpoken)
        }
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture)
        }
        if (userData.socialMedia) {
          setSocialMedia(userData.socialMedia)
        }
        if (userData.ethnicity) {
          setEthnicity(userData.ethnicity)
        }

        return userData
      }
      throw new Error("Failed to load profile data")
    },
  })

  useEffect(() => {
    if (queryError) {
      console.error("[v0] Error fetching user data:", queryError)
      setError("Failed to load profile data")
    }
  }, [queryError])

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await updateProfile(profileData)
      if (!res.success) {
        throw new Error("Failed to update profile")
      }
      return res
    },
    onSuccess: () => {
      setSuccess("Profile updated successfully")
      setError(null)
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
      setTimeout(() => {
        router.back()
      }, 2000)
    },
    onError: (error) => {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
      setSuccess(null)
    },
  })

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log("File uploaded successfully:", data)
      setProfilePicture(data.url)
    },
    onError: (error) => {
      console.error("Error uploading file:", error)
      Alert.alert("Upload Error", "Failed to upload image. Please try again.")
    },
  })

  const handleSave = async () => {
    if (!profile.firstName?.trim() || !profile.lastName?.trim()) {
      setError("First and last name are required")
      setSuccess(null)
      return
    }

    setError(null)
    setSuccess(null)

    const updateData: any = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: `${profile.firstName} ${profile.lastName}`,
    }

    if (profile.bio) updateData.bio = profile.bio
    if (profile.city) updateData.city = profile.city
    if (profile.state) updateData.state = profile.state
    if (profile.classYear) updateData.classYear = profile.classYear
    if (profile.countryOfOrigin) updateData.countryOfOrigin = profile.countryOfOrigin
    if (profile.dateOfBirth) updateData.dateOfBirth = profile.dateOfBirth
    if (profile.major) updateData.major = profile.major
    if (university) updateData.university = university
    if (interests.length > 0) updateData.interests = interests
    if (languagesSpoken.length > 0) updateData.languagesSpoken = languagesSpoken
    if (profilePicture) updateData.profilePicture = profilePicture
    if (Object.keys(socialMedia).length > 0) updateData.socialMedia = socialMedia
    if (ethnicity.length > 0) updateData.ethnicity = ethnicity

    updateProfileMutation.mutate(updateData)
  }

  const updateProfileValue = (key: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload images")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      uploadFileMutation.mutate({
        uri: asset.uri,
        type: asset.type || "image",
        mimeType: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || "profile_image.jpg",
      })
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests((prev) => [...prev, customInterest.trim()])
      setCustomInterest("")
    }
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languagesSpoken.includes(newLanguage.trim())) {
      setLanguagesSpoken((prev) => [...prev, newLanguage.trim()])
      setNewLanguage("")
    }
  }

  const toggleLanguage = (language: string) => {
    setLanguagesSpoken((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

    const toggleEthnicity = (option: string): void => {
    setEthnicity((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const renderAnimatedInput = useCallback(
    (
      icon: any,
      label: string,
      value: string,
      onChangeText: (text: string) => void,
      placeholder: string,
      inputKey: string,
      options: any = {},
    ) => {
      const isValid = fieldValidation[inputKey]
      const isFocused = focusedInput === inputKey

      return (
        <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
          <Text style={styles.inputLabel}>
            {label}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              isValid === true && styles.inputWrapperValid,
              isValid === false && value && styles.inputWrapperInvalid,
            ]}
          >
            <View style={styles.inputIcon}>
              {React.createElement(icon, {
                size: 20,
                color: isFocused
                  ? "#6366F1"
                  : isValid === true
                    ? "#10B981"
                    : isValid === false && value
                      ? "#EF4444"
                      : "#9CA3AF",
              })}
            </View>

            <TextInput
              style={[styles.input, options.multiline && styles.textAreaInput]}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              {...options}
            />

            {isValid === true && value && (
              <View style={styles.validIcon}>
                <CheckCircle size={16} color="#10B981" />
              </View>
            )}

            {isValid === false && value && (
              <View style={styles.validIcon}>
                <AlertCircle size={16} color="#EF4444" />
              </View>
            )}
          </View>

          {isValid === false && value && (
            <Text style={styles.validationText}>
              {inputKey === "firstName" && "First name must be at least 2 characters"}
              {inputKey === "lastName" && "Last name must be at least 2 characters"}
              {inputKey === "dateOfBirth" && "Please enter date in YYYY-MM-DD format"}
              {inputKey === "phone" && "Please enter a valid phone number"}
            </Text>
          )}
        </Animated.View>
      )
    },
    [fieldValidation, focusedInput, loading, formOpacity],
  )

  const renderPickerInput = useCallback(
    (
      icon: React.ElementType,
      label: string,
      selectedValue: string,
      onValueChange: (value: string) => void,
      placeholder: string,
      items: { label: string; value: string }[],
      inputKey: string,
      pickerRef: React.RefObject<Picker<string>>
    ) => {
      const isFocused = focusedInput === inputKey;
      const isValid = fieldValidation[inputKey];
  
      const displayValue = selectedValue 
        ? items.find(item => item.value === selectedValue)?.label || selectedValue 
        : placeholder;
  
      const handleInputPress = () => {
        if (!loading && pickerRef.current) {
          setFocusedInput(inputKey);
          pickerRef.current.focus();
        }
      };

      const handlePickerChange = (itemValue: string) => {
        if (itemValue && itemValue !== '') {
          onValueChange(itemValue);
        }
        setFocusedInput('');
      };

      return (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{label}</Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={handleInputPress}
              disabled={loading}
              activeOpacity={0.7}
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                isValid === true && styles.inputWrapperValid,
                isValid === false && selectedValue && styles.inputWrapperInvalid,
                { paddingHorizontal: 0, paddingLeft: 16, paddingRight: 16 },
              ]}
            >
              <View style={styles.inputIcon}>
                {React.createElement(icon, {
                  size: 20,
                  color: isFocused
                    ? '#6366F1'
                    : isValid === true
                    ? '#10B981'
                    : isValid === false && selectedValue
                    ? '#EF4444'
                    : '#9CA3AF',
                })}
              </View>
              
              <View style={styles.pickerDisplayContainer}>
                <Text
                  style={[
                    styles.pickerDisplayText,
                    !selectedValue && styles.pickerPlaceholderText,
                  ]}
                >
                  {displayValue}
                </Text>
              </View>
              
              <View style={styles.dropdownArrow}>
                <Text style={styles.dropdownArrowText}>▼</Text>
              </View>
            </TouchableOpacity>
  
            <Picker
              ref={pickerRef}
              selectedValue={selectedValue}
              onValueChange={handlePickerChange}
              style={styles.picker}
              enabled={!loading}
              prompt={label}
              mode="dropdown"
            >
              <Picker.Item label={placeholder} value="" enabled={false} color="#9CA3AF" />
              {items.map((item) => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
          </View>
        </View>
      );
    }, [fieldValidation, focusedInput, loading]);

  const renderProfilePictureSection = () => (
    <Animated.View style={[styles.section, { opacity: formOpacity }]}>
      <Text style={styles.sectionTitle}>Profile Picture</Text>
      <Text style={styles.sectionSubtitle}>Upload a picture to represent yourself.</Text>

      <View style={styles.imageGrid}>
        <View style={styles.imageContainer}>
          <Image
            source={profilePicture ? { uri: profilePicture } : require("../../assets/user.png")}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleImagePicker}
            disabled={uploadFileMutation.isPending}
          >
            {uploadFileMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Plus size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )

  const renderInterestsSection = () => (
    <Animated.View style={[styles.section, { opacity: formOpacity }]}>
      <Text style={styles.sectionTitle}><Heart size={20} color="#F59E0B" /> Interests</Text>
      <Text style={styles.sectionSubtitle}>Select your interests to connect with like-minded people</Text>

      <View style={styles.tagsContainer}>
        {INTERESTS_OPTIONS.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[styles.tag, interests.includes(interest) && styles.tagSelected]}
            onPress={() => toggleInterest(interest)}
          >
            <Text style={[styles.tagText, interests.includes(interest) && styles.tagTextSelected]}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customInterestContainer}>
        <TextInput
          style={styles.customInterestInput}
          placeholder="Add another interest..."
          value={customInterest}
          onChangeText={setCustomInterest}
          onSubmitEditing={addCustomInterest}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.addInterestButton} onPress={addCustomInterest}>
          <Text style={styles.addInterestButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const renderLanguagesSection = () => (
    <Animated.View style={[styles.section, { opacity: formOpacity }]}>
      <Text style={styles.sectionTitle}><Globe2 size={20} color="#10B981" /> Languages</Text>
      <Text style={styles.sectionSubtitle}>What languages do you speak?</Text>

      <View style={styles.tagsContainer}>
        {languagesSpoken.map((language) => (
          <TouchableOpacity
            key={language}
            style={[styles.tag, styles.tagSelected]}
            onPress={() => toggleLanguage(language)}
          >
            <Text style={[styles.tagText, styles.tagTextSelected]}>{language}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customInterestContainer}>
        <TextInput
          style={styles.customInterestInput}
          placeholder="Add a language..."
          value={newLanguage}
          onChangeText={setNewLanguage}
          onSubmitEditing={addLanguage}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.addInterestButton} onPress={addLanguage}>
          <Text style={styles.addInterestButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const renderDateOfBirthPicker = () => {
    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0] // YYYY-MM-DD format
    }

    const onDateChange = (event: any, selectedDate?: Date): void => {
      const currentDate = selectedDate || new Date()
      setShowDatePicker(Platform.OS === "ios") // Keep open on iOS, close on Android
      setSelectedDate(currentDate)
      const formattedDate = formatDate(currentDate)
      updateProfileValue("dateOfBirth", formattedDate);
    }

    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            fieldValidation["dateOfBirth"] === true && styles.inputWrapperValid,
            fieldValidation["dateOfBirth"] === false && profile.dateOfBirth && styles.inputWrapperInvalid,
          ]}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <View style={styles.inputIcon}>
            <Calendar size={20} color={profile.dateOfBirth ? "#6366F1" : "#9CA3AF"} />
          </View>
          <Text style={[styles.input, { color: profile.dateOfBirth ? "#111827" : "#9CA3AF" }]}>
            {profile.dateOfBirth || "Select your date of birth"}
          </Text>
          {fieldValidation["dateOfBirth"] === true && profile.dateOfBirth && (
            <View style={styles.validIcon}>
              <CheckCircle size={16} color="#10B981" />
            </View>
          )}
          {fieldValidation["dateOfBirth"] === false && profile.dateOfBirth && (
            <View style={styles.validIcon}>
              <AlertCircle size={16} color="#EF4444" />
            </View>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()} // Prevent future dates
            minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
          />
        )}

        {fieldValidation["dateOfBirth"] === false && profile.dateOfBirth && (
          <Text style={styles.validationText}>Please select a valid date of birth</Text>
        )}
      </Animated.View>
    )
  }

  const renderSocialMediaSection = () => {


    const addSocialMedia = () => {
      if (newSocialPlatform && newSocialLink) {
        setSocialMedia((prev) => ({
          ...prev,
          [newSocialPlatform.toLowerCase()]: newSocialLink,
        }))
        setNewSocialPlatform("")
        setNewSocialLink("")
      }
    }

    const removeSocialMedia = (platform: string) => {
      setSocialMedia((prev) => {
        const updated = { ...prev }
        delete updated[platform]
        return updated
      })
    }

    return (
      <Animated.View style={[styles.formSection, { opacity: formOpacity }]}>
        <BlurView intensity={20} tint="light" style={styles.blurContainer}>
          <LinearGradient colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]} style={styles.gradientContainer}>
            <View style={styles.sectionHeader}>
              <Link size={20} color="#6366F1" />
              <Text style={styles.formSectionTitle}>Social Media</Text>
            </View>

            {Object.entries(socialMedia).map(([platform, link]) => (
              <View key={platform} style={styles.socialMediaItem}>
                <Text style={styles.socialPlatform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                <Text style={styles.socialLink} numberOfLines={1}>
                  {link}
                </Text>
                <TouchableOpacity onPress={() => removeSocialMedia(platform)}>
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addSocialContainer}>
              <View style={styles.socialDropdownContainer}>
                {renderPickerInput(
                  Link,
                  "Platform",
                  newSocialPlatform,
                  setNewSocialPlatform,
                  "Select platform...",
                  socialPlatforms.map(p => ({ label: p, value: p })),
                  "socialPlatform",
                  socialPlatformPickerRef
                )}
              </View>

              <View style={{ width: "100%" }}>
                {renderAnimatedInput(
                  Link, 
                  "Profile Link", 
                  newSocialLink, 
                  setNewSocialLink, 
                  "https://...", 
                  "socialLink")}
              </View>
            </View>
            <View style={styles.addSocialButtonContainer}>
              <TouchableOpacity
                style={[styles.addButton, (!newSocialPlatform || !newSocialLink) && styles.addButtonDisabled]}
                onPress={addSocialMedia}
                disabled={!newSocialPlatform || !newSocialLink}
              >
                <Plus size={16} color="white" />
                <Text style={styles.addButtonText}>Add Social Media</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    )
  }

    const renderEthnicitySelection = () => {
      return (
        <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
          <View style={styles.ethnicityHeader}>
            <Heart size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Ethnicity & Background</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Help us build inclusive communities and celebrate diversity
          </Text>
          <View style={styles.checkboxContainer}>
            {ETHNICITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.checkboxRow}
                onPress={() => toggleEthnicity(option)}
              >
                <View
                  style={[
                    styles.checkbox,
                    ethnicity.includes(option) && styles.checkboxSelected,
                  ]}
                >
                  {ethnicity.includes(option) && (
                    <CheckCircle size={16} color="#6366F1" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      );
    };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F8FAFC", "#E2E8F0", "#F1F5F9"]} style={styles.backgroundGradient} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BlurView intensity={30} tint="light" style={styles.headerBlur}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.9)"]}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.9)", "rgba(241, 245, 249, 0.8)"]}
                    style={styles.headerButtonGradient}
                  >
                    <ArrowLeft size={20} color="#475569" />
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                  <LinearGradient
                    colors={["rgba(99, 102, 241, 0.9)", "rgba(99, 102, 241, 0.8)"]}
                    style={styles.headerButtonGradient}
                  >
                    <Save size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Success/Error Messages */}
            {success && (
              <Animated.View style={styles.successContainer}>
                <LinearGradient
                  colors={["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.05)"]}
                  style={styles.messageGradient}
                >
                  <CheckCircle size={20} color="#22C55E" />
                  <Text style={styles.successText}>{success}</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {error && (
              <Animated.View style={styles.errorContainer}>
                <LinearGradient
                  colors={["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"]}
                  style={styles.messageGradient}
                >
                  <AlertCircle size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Profile Pictures */}
            {renderProfilePictureSection()}

            {/* Basic Information */}
            <Animated.View style={[styles.formSection, { opacity: formOpacity }]}>
              <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                  style={styles.gradientContainer}
                >
                  <View style={styles.sectionHeader}>
                    <Sparkles size={20} color="#6366F1" />
                    <Text style={styles.formSectionTitle}>Basic Information</Text>
                  </View>

                  {renderAnimatedInput(
                    User,
                    "First Name",
                    profile.firstName || "",
                    (text) => updateProfileValue("firstName", text),
                    "Enter your first name",
                    "firstName",
                    { autoCapitalize: "words" },
                  )}

                  {renderAnimatedInput(
                    User,
                    "Last Name",
                    profile.lastName || "",
                    (text) => updateProfileValue("lastName", text),
                    "Enter your last name",
                    "lastName",
                    { autoCapitalize: "words" },
                  )}

                  {renderDateOfBirthPicker()}

                  {renderAnimatedInput(
                    User,
                    "Bio",
                    profile.bio || "",
                    (text) => updateProfileValue("bio", text),
                    "Tell others about yourself...",
                    "bio",
                    {
                      multiline: true,
                      numberOfLines: 4,
                      textAlignVertical: "top",
                    },
                  )}
                </LinearGradient>
              </BlurView>
            </Animated.View>

            {/* Academic Information */}
            <Animated.View style={[styles.formSection, { opacity: formOpacity }]}>
              <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                  style={styles.gradientContainer}
                >
                  <View style={styles.sectionHeader}>
                    <GraduationCap size={20} color="#6366F1" />
                    <Text style={styles.formSectionTitle}>Academic Information</Text>
                  </View>

                  <Animated.View style={[{ opacity: formOpacity, zIndex: 100 }]}>
                    <UniversityDropdown
                      universities={universities?.data || []}
                      value={university}
                      onValueChange={setUniversity}
                      label="University"
                      placeholder="Search for your university..."
                      isValid={fieldValidation["university"]}
                      isFocused={focusedInput === "university"}
                      onFocus={() => setFocusedInput("university")}
                      onBlur={() => {
                        setFocusedInput("")
                        if (university) validateField("university", university)
                      }}
                      loading={loading}
                    />
                  </Animated.View>

                  {renderPickerInput(
                    BookOpen,
                    "Major",
                    profile.major || '',
                    (value) => updateProfileValue("major", value),
                    "Select your major",
                    MAJOR_OPTIONS.map(m => ({ label: m, value: m })),
                    "major",
                    majorPickerRef
                  )}

                  {renderPickerInput(
                    Calendar,
                    "Class Year",
                    profile.classYear || '',
                    (value) => updateProfileValue("classYear", value),
                    "Select your class year",
                    CLASS_YEAR_OPTIONS.map(y => ({ label: y, value: y })),
                    "classYear",
                    classYearPickerRef
                  )}
                </LinearGradient>
              </BlurView>
            </Animated.View>

            {/* Location & Contact */}
            <Animated.View style={[styles.formSection, { opacity: formOpacity }]}>
              <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                  style={styles.gradientContainer}
                >
                  <View style={styles.sectionHeader}>
                    <MapPin size={20} color="#6366F1" />
                    <Text style={styles.formSectionTitle}>Location & Contact</Text>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      {renderAnimatedInput(
                        MapPin,
                        "City",
                        profile.city || "",
                        (text) => updateProfileValue("city", text),
                        "Enter your city",
                        "city",
                      )}
                    </View>
                    <View style={styles.halfField}>
                      {renderAnimatedInput(
                        MapPin,
                        "State/Province",
                        profile.state || "",
                        (text) => updateProfileValue("state", text),
                        "Enter your state",
                        "state",
                      )}
                    </View>
                  </View>

                  {renderAnimatedInput(
                    Globe2,
                    "Country of Origin",
                    profile.countryOfOrigin || "",
                    (text) => updateProfileValue("countryOfOrigin", text),
                    "e.g., Nepal",
                    "countryOfOrigin",
                  )}
                </LinearGradient>
              </BlurView>
            </Animated.View>


            {renderEthnicitySelection()}

            {/* Interests */}
            {renderInterestsSection()}

            {/* Languages */}
            {renderLanguagesSection()}

            {/* Social Media */}
            {renderSocialMediaSection()}

            {/* Save Button */}
            <Animated.View style={[styles.saveContainer, { opacity: formOpacity }]}>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                disabled={updateProfileMutation.isPending || uploadFileMutation.isPending}
              >
                <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.saveButtonGradient}>
                  <View style={styles.saveButtonContent}>
                    {updateProfileMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Save size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.saveButtonText}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const pickerSelectStyles = StyleSheet.create({


  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'black',
  },
});
const styles = StyleSheet.create({

     ethnicityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
   checkboxContainer: {
    gap: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6366F1',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  customInterestContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  customInterestInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginRight: 8,
  },
  addInterestButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addInterestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addButtonText: {
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBlur: {
    borderRadius: 20,
  },
  headerGradient: {
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#CBD5E1",
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  successContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  errorContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientContainer: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperValid: {
    borderColor: "#10B981",
  },
  inputWrapperInvalid: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  textAreaInput: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingVertical: 14,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "white",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366F1",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addImageButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tagSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  tagTextSelected: {
    color: "#FFFFFF",
  },
  saveContainer: {
    marginTop: 20,
  },
  saveButton: {
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
        elevation: 10,
      },
    }),
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  socialMediaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  socialPlatform: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  socialLink: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    marginLeft: 8,
  },
  addSocialContainer: {
    flexDirection: "column",
    marginBottom: 20,
  },
  addSocialButtonContainer: {
    alignItems: "flex-end",
  },
  socialDropdownContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    // This makes the picker invisible but clickable
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: -1,
      
  },
  addButton: { // This style is also used for addInterestButton
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  pickerDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  pickerDisplayText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  dropdownArrowText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
})
