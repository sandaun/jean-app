import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { useApi } from '../api'
import { formatToEuro } from '../utils/utils'
import { Components } from '../api/generated/client'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type InvoiceDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'InvoiceDetail'
>
type InvoiceDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoiceDetail'
>

type InvoiceDetailScreenProps = {
  route: InvoiceDetailScreenRouteProp
  navigation: InvoiceDetailScreenNavigationProp
}

const InvoiceDetailScreen: React.FC<InvoiceDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { invoiceId } = route.params
  const [invoice, setInvoice] = useState<Components.Schemas.Invoice | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const api = useApi()

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.getInvoice({ id: invoiceId })
        setInvoice(data)
      } catch (error) {
        console.error('Error fetching invoice:', error)
        Alert.alert('Error', 'Failed to fetch invoice details.')
        navigation.goBack()
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const handleDelete = async () => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteInvoice({ id: invoiceId })
              Alert.alert('Success', 'Invoice deleted successfully.')
              navigation.goBack()
            } catch (error) {
              console.error('Error deleting invoice:', error)
              Alert.alert('Error', 'Failed to delete the invoice.')
            }
          },
        },
      ],
    )
  }

  const handleFinalize = async () => {
    if (!invoice?.finalized) {
      try {
        await api.putInvoice(
          { id: invoiceId },
          { invoice: { finalized: true } },
        )
        Alert.alert('Success', 'Invoice finalized successfully.')
        setInvoice({ ...invoice, finalized: true })
      } catch (error) {
        console.error('Error finalizing invoice:', error)
        Alert.alert('Error', 'Failed to finalize the invoice.')
      }
    }
  }

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#007bff" />
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice #{invoice.id}</Text>
        </View>
        <ScrollView
        // contentContainerStyle={styles.container
        >
          <View style={styles.details}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>
              {invoice.customer?.first_name} {invoice.customer?.last_name}
            </Text>

            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{invoice.date}</Text>

            <Text style={styles.label}>Deadline:</Text>
            <Text style={styles.value}>{invoice.deadline}</Text>

            <Text style={styles.label}>Total:</Text>
            <Text style={styles.value}>{formatToEuro(invoice.total)}</Text>

            <Text style={styles.label}>Tax:</Text>
            <Text style={styles.value}>{formatToEuro(invoice.tax)}</Text>
          </View>

          <View style={styles.items}>
            <Text style={styles.sectionTitle}>Invoice Items</Text>
            {invoice.invoice_lines.map((line) => (
              <View key={line.id} style={styles.item}>
                <Text style={styles.itemText}>
                  {line.quantity}x {line.label}
                </Text>
                <Text style={styles.itemText}>{formatToEuro(line.price)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            {!invoice.finalized && (
              <TouchableOpacity
                onPress={handleFinalize}
                style={styles.finalizeButton}
              >
                <Text style={styles.actionText}>Finalize Invoice</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.actionText}>Delete Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: 'white',
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  details: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#457B9D',
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
    color: '#6C757D',
  },
  items: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1D3557',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemText: { fontSize: 16, color: '#6C757D' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  finalizeButton: {
    backgroundColor: '#457B9D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default InvoiceDetailScreen
