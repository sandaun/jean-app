import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type ItemRowProps = {
  label: string
  value: string | number
}

const ItemRow: React.FC<ItemRowProps> = ({ label, value }) => {
  return (
    <View style={styles.itemDetails}>
      <Text style={styles.itemLabel}>{label}:</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemLabel: {
    fontWeight: 'bold',
    color: '#457B9D',
    fontSize: 14,
  },
  itemValue: {
    fontSize: 14,
    color: '#6C757D',
  },
})

export default ItemRow
