import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type HeaderProps = {
  title: string
  backButton?: boolean // Prop per mostrar el botó "Back"
  onBackPress?: () => void // Funció quan es prem el botó "Back"
  rightButtonSymbol?: string // Símbol del botó dret
  onRightButtonPress?: () => void // Funció pel botó dret
  rightButtonDisabled?: boolean // Nou prop per desactivar el botó dret
}

const Header: React.FC<HeaderProps> = ({
  title,
  backButton = false,
  onBackPress,
  rightButtonSymbol,
  onRightButtonPress,
  rightButtonDisabled = false, // Valor per defecte: actiu
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Botó Back */}
      {backButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      )}

      {/* Títol */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Botó Dret */}
      {rightButtonSymbol && (
        <TouchableOpacity
          onPress={rightButtonDisabled ? undefined : onRightButtonPress}
          style={[
            styles.rightButton,
            rightButtonDisabled && styles.rightButtonDisabled, // Estil deshabilitat
          ]}
          disabled={rightButtonDisabled} // Desactiva la interacció
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
    backgroundColor: '#A8A8A8',
  },
  rightButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default Header
