import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type HeaderProps = {
  title: string
  buttonPosition?: 'left' | 'right'
  buttonSymbol: string
  onButtonPress: () => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  buttonPosition = 'right',
  buttonSymbol,
  onButtonPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {buttonPosition === 'left' && (
        <TouchableOpacity onPress={onButtonPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>{buttonSymbol}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {buttonPosition === 'right' && (
        <TouchableOpacity onPress={onButtonPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>{buttonSymbol}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#e2e2e2',
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  addButton: {
    backgroundColor: '#457B9D',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default Header
