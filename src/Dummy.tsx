import React, { StyleSheet, Text, View } from 'react-native'

const Dummy = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JeanTest</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default Dummy
