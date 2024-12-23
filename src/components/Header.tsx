import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type HeaderProps = {
  title: string
  backButton?: boolean
  onBackPress?: () => void
  rightButtonSymbol?: string
  onRightButtonPress?: () => void
  rightButtonDisabled?: boolean
}

const Header: React.FC<HeaderProps> = ({
  title,
  backButton = false,
  onBackPress,
  rightButtonSymbol,
  onRightButtonPress,
  rightButtonDisabled = false,
}) => {
  return (
    <View style={styles.headerContainer} testID={'header-component'}>
      {backButton && (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          testID="back-button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.headerTitle}>{title}</Text>

      {rightButtonSymbol && (
        <TouchableOpacity
          onPress={rightButtonDisabled ? undefined : onRightButtonPress}
          style={[
            styles.rightButton,
            rightButtonDisabled && styles.rightButtonDisabled,
          ]}
          disabled={rightButtonDisabled}
          testID="right-button"
        >
          <Text style={styles.rightButtonText}>{rightButtonSymbol}</Text>
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
  backButton: {
    backgroundColor: '#E63946',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  rightButton: {
    backgroundColor: '#457B9D',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonDisabled: {
    opacity: 0.5,
  },
  rightButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default Header
