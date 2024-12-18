import React, { useState } from 'react'
import {
  Modal,
  View,
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'

interface DatePickerProps {
  deadline: Date
  handleDate: (date: Date) => void
  disabled?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
  deadline,
  handleDate,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const handleAndroidDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowPicker(false)
    if (selectedDate) {
      handleDate(selectedDate)
    }
  }

  const handleIOSDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      handleDate(selectedDate)
    }
  }

  return (
    <View style={styles.datePickerContainer}>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        style={[styles.button, disabled && styles.disabledButton]}
        disabled={disabled}
      >
        <Text
          style={[styles.buttonText, disabled && styles.disabledButtonText]}
        >
          {deadline ? deadline.toISOString().split('T')[0] : 'Select Date'}
        </Text>
      </TouchableOpacity>

      {!disabled && Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          mode="date"
          value={deadline}
          onChange={handleAndroidDateChange}
        />
      )}

      {!disabled && Platform.OS === 'ios' && showPicker && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                mode="date"
                value={deadline}
                onChange={handleIOSDateChange}
                display="inline"
              />
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  datePickerContainer: {
    marginBottom: 8,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  buttonText: {
    // color: '#457B9D',
    // fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  disabledButtonText: {
    color: '#B0B0B0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '90%',
  },
  doneText: {
    color: '#457B9D',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
})

export default DatePicker
