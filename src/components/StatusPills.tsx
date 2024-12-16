import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { isOverdue } from '../utils/utils'

type StatusPillsProps = {
  paid: boolean
  finalized: boolean
  date: string | null
  deadline: string | null
}

const StatusPills: React.FC<StatusPillsProps> = ({
  paid,
  finalized,
  date,
  deadline,
}) => {
  return (
    <View style={styles.pillsContainer}>
      {paid && <Text style={[styles.pill, styles.pillPaid]}>Paid</Text>}

      {!paid && isOverdue(date, deadline) && (
        <Text style={[styles.pill, styles.pillOverdue]}>Overdue</Text>
      )}

      {finalized && !isOverdue(date, deadline) && !paid && (
        <Text style={[styles.pill, styles.pillFinalized]}>Finalized</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pillsContainer: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
    textAlign: 'center',
  },
  pillOverdue: {
    backgroundColor: '#FDEBD0',
    color: '#E67E22',
  },
  pillPaid: {
    backgroundColor: '#D4EFDF',
    color: '#28B463',
  },
  pillFinalized: {
    backgroundColor: '#E8F6F3',
    color: '#1F618D',
  },
})

export default StatusPills
