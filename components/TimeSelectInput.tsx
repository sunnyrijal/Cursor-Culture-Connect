"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Clock, Check } from "lucide-react-native"
import DateTimePicker from '@react-native-community/datetimepicker'

interface TimeSelectInputProps {
  value: string
  onTimeChange: (time: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function TimeSelectInput({
  value,
  onTimeChange,
  label = "Time",
  placeholder = "Select a time",
  disabled = false,
  required = false
}: TimeSelectInputProps) {
  const [showTimePicker, setShowTimePicker] = useState(false)

  const validateTime = (time: string): { isValid: boolean; error?: string } => {
    if (!time) return { isValid: true }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
    if (!timeRegex.test(time)) {
      return { isValid: false, error: "Use HH:MM format (24-hour)" }
    }

    const [hours, minutes] = time.split(":").map(Number)
    if (hours > 23) {
      return { isValid: false, error: "Hours must be 00-23" }
    }
    if (minutes > 59) {
      return { isValid: false, error: "Minutes must be 00-59" }
    }

    return { isValid: true }
  }

  const formatDisplayTime = (time: string): string => {
    if (!time) return ""
    
    const [hours, minutes] = time.split(":")
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const period = hour24 >= 12 ? "PM" : "AM"
    
    return `${hour12}:${minutes} ${period}`
  }

  const parseTimeToDate = (timeString: string): Date => {
    const now = new Date()
    if (!timeString) {
      now.setHours(10, 0, 0, 0) // Default to 10:00
      return now
    }

    const [hours, minutes] = timeString.split(":").map(Number)
    now.setHours(hours, minutes, 0, 0)
    return now
  }

  const formatDateToTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false)
    }
    
    if (selectedDate) {
      const formattedTime = formatDateToTime(selectedDate)
      onTimeChange(formattedTime)
    }
  }

  const handleIOSConfirm = () => {
    setShowTimePicker(false)
  }

  const timeValidation = validateTime(value)
  const hasError = value && !timeValidation.isValid
  const hasValue = value && timeValidation.isValid

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        
        <TouchableOpacity
          onPress={() => !disabled && setShowTimePicker(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.inputWrapper,
              hasValue && styles.inputWrapperValid,
              hasError && styles.inputWrapperError,
              disabled && styles.inputWrapperDisabled,
            ]}
          >
            <Clock size={20} color={hasError ? "#EF4444" : hasValue ? "#10B981" : "#6366F1"} style={styles.inputIcon} />
            
            <View style={styles.timeDisplay}>
              <Text style={[
                styles.timeText,
                !value && styles.placeholderText,
                disabled && styles.disabledText
              ]}>
                {value ? formatDisplayTime(value) : placeholder}
              </Text>
              {value && (
                <Text style={styles.timeSubtext}>
                  {value} (24h)
                </Text>
              )}
            </View>
            
            {hasValue && <Check size={20} color="#10B981" style={styles.validIcon} />}
          </View>
        </TouchableOpacity>

        {hasError && (
          <Text style={styles.errorText}>{timeValidation.error}</Text>
        )}
      </View>

      {/* Native Time Picker */}
      {showTimePicker && (
        <View style={styles.dateTimePickerContainer}>
          <DateTimePicker
            value={parseTimeToDate(value)}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={styles.dateTimePicker}
          />
          
          {Platform.OS === 'ios' && (
            <View style={styles.iosButtonContainer}>
              <TouchableOpacity style={styles.iosConfirmButton} onPress={handleIOSConfirm}>
                <Text style={styles.iosConfirmButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
     ...Platform.select({
      android: {
        paddingBottom:10
      },
      ios:{
        paddingBottom:100
      }
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },
  required: {
    color: "#EF4444",
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
  inputWrapperValid: {
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapperDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 12,
  },
  timeDisplay: {
    flex: 1,
    paddingVertical: 16,
  },
  timeText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 2,
  },
  timeSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  validIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  dateTimePickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },

  dateTimePicker: {
    backgroundColor: 'white',
    zIndex: 999999,

    borderRadius: 10,
    ...Platform.select({
      ios: {
        width: 300,
        height: 200,
      },
    }),
  },
  iosButtonContainer: {
    backgroundColor: 'white',
  },
  iosConfirmButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iosConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
