import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'

interface CustomCheckboxProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onChange(!checked)}
      style={[styles.container, disabled && styles.disabledContainer]}
      activeOpacity={0.6}
    >
      <Text style={[styles.label, disabled && styles.disabledLabel]}>
        {label}
      </Text>
      <View style={[styles.checkbox, disabled && styles.disabledCheckbox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#457B9D',
    fontWeight: 'bold',
  },
  disabledCheckbox: {
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    color: '#1D3557',
    fontWeight: '600',
  },
  disabledLabel: {
    color: '#B0B0B0',
  },
  disabledContainer: {
    opacity: 0.6,
  },
})

export default CustomCheckbox
