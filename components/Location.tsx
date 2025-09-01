"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform } from "react-native"
import { MapPin, ChevronDown, Search } from "lucide-react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"

// Import the JSON data

import statesData from "../data/US_States_list.json"
import citiesData from "../data/US_Cities.json"

interface LocationProps {
  selectedState: string
  selectedCity: string
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  isValid?: { state?: boolean; city?: boolean }
  isFocused?: { state?: boolean; city?: boolean }
  onFocus?: (field: "state" | "city") => void
  onBlur?: (field: "state" | "city") => void
  loading?: boolean
}

const Location: React.FC<LocationProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  isValid = {},
  isFocused = {},
  onFocus,
  onBlur,
  loading = false,
}) => {
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [stateSearchQuery, setStateSearchQuery] = useState("")
  const [citySearchQuery, setCitySearchQuery] = useState("")

  // Animation values
  const stateDropdownHeight = useSharedValue(0)
  const cityDropdownHeight = useSharedValue(0)
  const stateDropdownOpacity = useSharedValue(0)
  const cityDropdownOpacity = useSharedValue(0)

  // Get states array from JSON
  const states = Object.values(statesData)

  // Get cities for selected state
  const cities = selectedState ? (citiesData as any)[selectedState] || [] : []

  // Filter states based on search
  const filteredStates = states.filter((state) => state.toLowerCase().includes(stateSearchQuery.toLowerCase()))

  // Filter cities based on search
  const filteredCities = cities.filter((city: string) => city.toLowerCase().includes(citySearchQuery.toLowerCase()))

  // Reset city when state changes
  useEffect(() => {
    if (selectedState && selectedCity) {
      const stateCities = (citiesData as any)[selectedState] || []
      if (!stateCities.includes(selectedCity)) {
        onCityChange("")
      }
    }
  }, [selectedState])

  // Animation effects
  useEffect(() => {
    if (showStateDropdown) {
      stateDropdownHeight.value = withSpring(300)
      stateDropdownOpacity.value = withTiming(1, { duration: 200 })
    } else {
      stateDropdownHeight.value = withSpring(0)
      stateDropdownOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [showStateDropdown])

  useEffect(() => {
    if (showCityDropdown) {
      cityDropdownHeight.value = withSpring(300)
      cityDropdownOpacity.value = withTiming(1, { duration: 200 })
    } else {
      cityDropdownHeight.value = withSpring(0)
      cityDropdownOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [showCityDropdown])

  const stateDropdownStyle = useAnimatedStyle(() => ({
    height: stateDropdownHeight.value,
    opacity: stateDropdownOpacity.value,
  }))

  const cityDropdownStyle = useAnimatedStyle(() => ({
    height: cityDropdownHeight.value,
    opacity: cityDropdownOpacity.value,
  }))

  const handleStateSelect = (state: string) => {
    onStateChange(state)
    setShowStateDropdown(false)
    setStateSearchQuery("")
    onCityChange("") // Reset city when state changes
  }

  const handleCitySelect = (city: string) => {
    onCityChange(city)
    setShowCityDropdown(false)
    setCitySearchQuery("")
  }

  const renderDropdownItem = (item: string, onSelect: (item: string) => void, isSelected: boolean) => (
    <TouchableOpacity
      key={item}
      style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
      onPress={() => onSelect(item)}
      disabled={loading}
    >
      <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* State Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>State</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isFocused?.state && styles.inputWrapperFocused,
            isValid?.state === true && styles.inputWrapperValid,
            isValid?.state === false && selectedState && styles.inputWrapperInvalid,
          ]}
          onPress={() => {
            setShowStateDropdown(!showStateDropdown)
            setShowCityDropdown(false)
            onFocus?.("state")
          }}
          disabled={loading}
        >
          <View style={styles.inputIcon}>
            <MapPin
              size={20}
              color={
                isFocused?.state
                  ? "#6366F1"
                  : isValid?.state === true
                    ? "#10B981"
                    : isValid?.state === false && selectedState
                      ? "#EF4444"
                      : "#9CA3AF"
              }
            />
          </View>
          <Text style={[styles.inputText, !selectedState && styles.placeholderText]}>
            {selectedState || "Select State"}
          </Text>
          <ChevronDown
            size={20}
            color="#9CA3AF"
            style={[styles.chevron, showStateDropdown && { transform: [{ rotate: "180deg" }] }]}
          />
        </TouchableOpacity>

        {/* State Dropdown */}
        <Animated.View style={[styles.dropdown, stateDropdownStyle]}>
          <View style={styles.searchContainer}>
            <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search states..."
              value={stateSearchQuery}
              onChangeText={setStateSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
            {filteredStates.map((state) => renderDropdownItem(state, handleStateSelect, state === selectedState))}
          </ScrollView>
        </Animated.View>
      </View>

      {/* City Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>City</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isFocused?.city && styles.inputWrapperFocused,
            isValid?.city === true && styles.inputWrapperValid,
            isValid?.city === false && selectedCity && styles.inputWrapperInvalid,
            !selectedState && styles.inputWrapperDisabled,
          ]}
          onPress={() => {
            if (selectedState) {
              setShowCityDropdown(!showCityDropdown)
              setShowStateDropdown(false)
              onFocus?.("city")
            }
          }}
          disabled={loading || !selectedState}
        >
          <View style={styles.inputIcon}>
            <MapPin
              size={20}
              color={
                !selectedState
                  ? "#D1D5DB"
                  : isFocused?.city
                    ? "#6366F1"
                    : isValid?.city === true
                      ? "#10B981"
                      : isValid?.city === false && selectedCity
                        ? "#EF4444"
                        : "#9CA3AF"
              }
            />
          </View>
          <Text
            style={[styles.inputText, !selectedCity && styles.placeholderText, !selectedState && styles.disabledText]}
          >
            {selectedCity || (selectedState ? "Select City" : "Select State First")}
          </Text>
          <ChevronDown
            size={20}
            color={!selectedState ? "#D1D5DB" : "#9CA3AF"}
            style={[styles.chevron, showCityDropdown && { transform: [{ rotate: "180deg" }] }]}
          />
        </TouchableOpacity>

        {/* City Dropdown */}
        <Animated.View style={[styles.dropdown, cityDropdownStyle]}>
          <View style={styles.searchContainer}>
            <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={citySearchQuery}
              onChangeText={setCitySearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
            {filteredCities.map((city: string) => renderDropdownItem(city, handleCitySelect, city === selectedCity))}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  inputContainer: {
    marginBottom: 12,
    position: "relative",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "rgba(226, 232, 240, 0.8)",
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
  inputWrapperFocused: {
    borderColor: "#6366F1",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: "#10B981",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  inputWrapperInvalid: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  inputWrapperDisabled: {
    backgroundColor: "rgba(249, 250, 251, 0.9)",
    borderColor: "rgba(209, 213, 219, 0.8)",
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  disabledText: {
    color: "#D1D5DB",
  },
  chevron: {
    marginLeft: 8,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    zIndex: 99999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  dropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.3)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dropdownItemTextSelected: {
    color: "#6366F1",
    fontWeight: "600",
  },
})

export default Location
