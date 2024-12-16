import React, { ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'

type DetailRowProps = {
  label1: string
  value1?: string | number | null
  label2?: string
  value2?: string | number | null
  children1?: ReactNode
  children2?: ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({
  label1,
  value1,
  label2,
  value2,
  children1,
  children2,
}) => {
  return (
    <View style={styles.detailItemRow}>
      {(label1 || children1) && (
        <View style={styles.column}>
          {label1 && <Text style={styles.label}>{label1}:</Text>}
          {children1 ? children1 : <Text style={styles.value}>{value1}</Text>}
        </View>
      )}

      {(label2 || children2) && (
        <View style={styles.column}>
          {label2 && <Text style={styles.label}>{label2}:</Text>}
          {children2 ? children2 : <Text style={styles.value}>{value2}</Text>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#457B9D',
  },
  value: {
    fontSize: 16,
    color: '#6C757D',
  },
  column: {
    flex: 1,
  },
})

export default DetailRow
