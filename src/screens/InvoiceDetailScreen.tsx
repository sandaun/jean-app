import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import {
  calculateAndFormatInvoiceTaxTotal,
  calculateAndFormatInvoiceTotal,
  formatToEuro,
} from '../utils/utils'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Header from '../components/Header'
import DetailRow from '../components/DetailRow'
import StatusPills from '../components/StatusPills'
import ItemRow from '../components/ItemRow'
import { useInvoices } from '../context/InvoicesContext'
import { Components } from '../api/generated/client'
import InvoiceModal from '../components/InvoiceModal'
import { useApi } from '../api'
import { getInitialInvoice } from '../constants/constants'

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
  const emptyInvoice: Components.Schemas.InvoiceCreatePayload =
    getInitialInvoice()

  const { invoiceId } = route.params

  const [modalVisible, setModalVisible] = useState(false)
  const [editableInvoice, setEditableInvoice] =
    useState<Components.Schemas.InvoiceCreatePayload>(emptyInvoice)
  const [allProducts, setAllProducts] = useState<Components.Schemas.Product[]>(
    [],
  )

  const api = useApi()

  const { invoices, deleteInvoice, finalizeInvoice, updateInvoice } =
    useInvoices()

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.getSearchProducts({
        query: '',
        per_page: 1000,
      })
      setAllProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }, [api])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const invoice = invoices.find((inv) => inv.id === invoiceId)

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
              await deleteInvoice(invoiceId)
              Alert.alert('Success', 'Invoice deleted successfully.')
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate('InvoicesList')
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
        await finalizeInvoice(invoiceId)
        Alert.alert('Success', 'Invoice finalized successfully.')
        navigation.canGoBack()
          ? navigation.goBack()
          : navigation.navigate('InvoicesList')
      } catch (error) {
        console.error('Error finalizing invoice:', error)
        Alert.alert('Error', 'Failed to finalize the invoice.')
      }
    }
  }

  const handleSaveInvoice = async (
    updatedInvoice: Components.Schemas.InvoiceCreatePayload,
    existingLines: Components.Schemas.InvoiceLine[],
  ) => {
    try {
      const updatedLines = updatedInvoice.invoice_lines_attributes || []
      const mergedInvoiceLines: Components.Schemas.InvoiceLineUpdatePayload[] =
        []
      const processedIds = new Set<number>()

      updatedLines.forEach((line) => {
        const matchingLine = existingLines.find(
          (existing) => existing.product_id === line.product_id,
        )

        if (matchingLine) {
          mergedInvoiceLines.push({
            id: matchingLine.id,
            quantity: line.quantity || matchingLine.quantity,
          })
          processedIds.add(matchingLine.id)
        } else {
          mergedInvoiceLines.push({ ...line })
        }
      })

      existingLines.forEach((existingLine) => {
        if (!processedIds.has(existingLine.id)) {
          mergedInvoiceLines.push({
            id: existingLine.id,
            _destroy: true,
          })
        }
      })

      const invoiceToUpdate = {
        id: invoiceId,
        invoice_lines_attributes: mergedInvoiceLines,
      }

      await updateInvoice(invoiceToUpdate)
      setModalVisible(false)
    } catch (error) {
      console.error('Error updating invoice:', error)
    }
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={`Invoice #${invoice?.id}`}
          backButton={true}
          onBackPress={() => navigation.goBack()}
          rightButtonSymbol="..."
          onRightButtonPress={() => {
            if (!invoice.finalized && !invoice.paid) {
              setEditableInvoice({
                customer_id: invoice.customer?.id ?? 0,
                date: invoice.date,
                deadline: invoice.deadline,
                paid: invoice.paid,
                finalized: invoice.finalized,
                invoice_lines_attributes: invoice.invoice_lines.map((line) => ({
                  product_id: line.product_id,
                  label: line.label,
                  quantity: line.quantity,
                  unit: line.unit,
                  vat_rate: line.vat_rate,
                  price: line.price.toString(),
                  tax: line.tax.toString(),
                })),
              })
              setModalVisible(true)
            }
          }}
          rightButtonDisabled={invoice.finalized || invoice.paid}
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
            value1={calculateAndFormatInvoiceTotal(invoice.invoice_lines)}
            label2="Tax"
            value2={calculateAndFormatInvoiceTaxTotal(invoice.invoice_lines)}
          />
        </View>

        <Text style={styles.sectionTitle}>Invoice Items</Text>
        <View style={styles.items}>
          <ScrollView
            style={styles.itemsScrollViewContainer}
            showsVerticalScrollIndicator={false}
          >
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
          <TouchableOpacity
            onPress={handleFinalize}
            style={[
              styles.finalizeButton,
              invoice.finalized && styles.buttonDisabled,
            ]}
            disabled={invoice.finalized}
          >
            <Text style={styles.actionText}>Finalize Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[
              styles.deleteButton,
              invoice.finalized && styles.buttonDisabled,
            ]}
            disabled={invoice.finalized}
          >
            <Text style={styles.actionText}>Delete Invoice</Text>
          </TouchableOpacity>
        </View>
        {editableInvoice && (
          <InvoiceModal
            title="Edit Invoice"
            visible={modalVisible}
            invoice={editableInvoice}
            setInvoice={setEditableInvoice}
            allProducts={allProducts}
            onClose={() => setModalVisible(false)}
            onSave={(updatedInvoice) =>
              handleSaveInvoice(updatedInvoice, invoice.invoice_lines)
            }
          />
        )}
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
    // flex: 1,
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
  buttonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default InvoiceDetailScreen
