"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { MapPin, ChevronDown } from "lucide-react-native"
import { Picker } from "@react-native-picker/picker"

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
  const statePickerRef = useRef<Picker<string>>(null)
  const cityPickerRef = useRef<Picker<string>>(null)

  // Get states array from JSON
  const states = Object.values(statesData)

  // Get cities for selected state
  const cities = selectedState ? (citiesData as any)[selectedState] || [] : []

  // Reset city when state changes
  useEffect(() => {
    if (selectedState && selectedCity) {
      const stateCities = (citiesData as any)[selectedState] || []
      if (!stateCities.includes(selectedCity)) {
        onCityChange("")
      }
    }
  }, [selectedState])

  const handleStateSelect = (state: string) => {
    onStateChange(state)
    onCityChange("") // Reset city when state changes
  }

  const handleCitySelect = (city: string) => {
    onCityChange(city)
  }

  return (
    <View style={styles.container}>
      {/* State Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>State (Optional)</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isFocused?.state && styles.inputWrapperFocused,
            isValid?.state === true && styles.inputWrapperValid,
            isValid?.state === false && selectedState && styles.inputWrapperInvalid,
          ]}
          onPress={() => {
            statePickerRef.current?.focus()
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
          <ChevronDown size={20} color="#9CA3AF" style={styles.chevron} />
        </TouchableOpacity>

        <Picker
          ref={statePickerRef}
          selectedValue={selectedState}
          onValueChange={(itemValue) => handleStateSelect(itemValue)}
          style={styles.picker}
          enabled={!loading}
          prompt="Select a State"
        >
          <Picker.Item label="Select State" value="" enabled={false} />
          {states.map((state) => (
            <Picker.Item key={state} label={state} value={state} />
          ))}
        </Picker>
      </View>

      {/* City Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>City (Optional)</Text>
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
              cityPickerRef.current?.focus()
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
          <ChevronDown size={20} color={!selectedState ? "#D1D5DB" : "#9CA3AF"} style={styles.chevron} />
        </TouchableOpacity>

        <Picker
          ref={cityPickerRef}
          selectedValue={selectedCity}
          onValueChange={(itemValue) => handleCitySelect(itemValue)}
          style={styles.picker}
          enabled={!loading && !!selectedState}
          prompt="Select a City"
        >
          <Picker.Item label="Select City" value="" enabled={false} />
          {cities.map((city: string) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  inputContainer: {
    marginBottom: 20,
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
    paddingHorizontal: 16,
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
  picker: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: -1,
  },
})

export default Location
