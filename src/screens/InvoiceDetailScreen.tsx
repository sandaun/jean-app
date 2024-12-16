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
import Header from '../components/Header'
import DetailRow from '../components/DetailRow'
import StatusPills from '../components/StatusPills'
import ItemRow from '../components/ItemRow'

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

  console.log(12, invoice.invoice_lines[0])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={`Invoice #${invoice.id}`}
          buttonPosition="left"
          buttonSymbol="←"
          onButtonPress={() => navigation.goBack()}
        />
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <View style={styles.details}>
          <DetailRow
            label1="Customer"
            value1={`${invoice.customer?.first_name} ${invoice.customer?.last_name}`}
            children2={
              <StatusPills
                {...invoice}
                date={invoice.date}
                deadline={invoice.deadline}
              />
            }
          />
          <DetailRow
            label1="Date"
            value1={invoice.date}
            label2="Deadline"
            value2={invoice.deadline}
          />
          <DetailRow
            label1="Total"
            value1={formatToEuro(invoice.total)}
            label2="Tax"
            value2={formatToEuro(invoice.tax)}
          />
        </View>

        <Text style={styles.sectionTitle}>Invoice Items</Text>
        <View style={styles.items}>
          <ScrollView contentContainerStyle={styles.itemsScrollViewContainer}>
            {invoice.invoice_lines.map((line) => (
              <View key={line.id} style={styles.itemRow}>
                <ItemRow label="ID" value={line.id} />
                <ItemRow label="Product" value={line.label} />
                <ItemRow label="Quantity" value={line.quantity} />
                <ItemRow label="Unit Price" value={formatToEuro(line.price)} />
                <ItemRow
                  label="Total Price"
                  value={formatToEuro(parseFloat(line.price) * line.quantity)}
                />
              </View>
            ))}
          </ScrollView>
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
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.actionText}>Delete Invoice</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  details: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
  },
  itemsScrollViewContainer: {
    flex: 1,
  },
  items: {
    flex: 1,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
  },
  itemRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1D3557',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#457B9D',
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
