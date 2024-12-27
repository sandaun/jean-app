import React, { useState } from 'react'
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
import { getInitialUpdateInvoice } from '../constants/constants'
import {
  useDeleteInvoice,
  useFetchInvoiceById,
  useFinalizeInvoice,
  useUpdateInvoice,
} from '../services/invoices/useInvoices'
import { Components } from '../api/generated/client'
import InvoiceModalUpdate from '../components/InvoiceModalUpdate'

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
  const emptyInvoice = getInitialUpdateInvoice()

  const [modalVisible, setModalVisible] = useState(false)
  const [editableInvoice, setEditableInvoice] = useState(emptyInvoice)

  const { data: invoice, isLoading } = useFetchInvoiceById(invoiceId)

  const deleteInvoiceMutation = useDeleteInvoice()
  const updateInvoiceMutation = useUpdateInvoice()
  const finalizeInvoiceMutation = useFinalizeInvoice()

  const handleDelete = () => {
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
              await deleteInvoiceMutation.mutateAsync(invoiceId)
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

  const handleSaveInvoice = async (
    updatedInvoice: Components.Schemas.InvoiceUpdatePayload,
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
        id: updatedInvoice.id || invoiceId,
        customer_id: updatedInvoice.customer_id,
        finalized: updatedInvoice.finalized || false,
        paid: updatedInvoice.paid || false,
        date: updatedInvoice.date || null,
        deadline: updatedInvoice.deadline || null,
        total: '0',
        tax: '0',
        invoice_lines_attributes: mergedInvoiceLines,
      }

      await updateInvoiceMutation.mutateAsync(invoiceToUpdate)
      setModalVisible(false)
    } catch (error) {
      console.error('Error updating invoice:', error)
      Alert.alert('Error', 'Failed to update the invoice.')
    }
  }

  const handleFinalizeInvoice = async () => {
    try {
      await finalizeInvoiceMutation.mutateAsync(invoiceId)
      Alert.alert('Success', 'Invoice finalized successfully.')
    } catch (error) {
      console.error('Error finalizing invoice:', error)
      Alert.alert('Error', 'Failed to finalize the invoice.')
    }
  }

  if (isLoading || !invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#007bff"
            testID="loading-indicator"
          />
        </View>
      </SafeAreaView>
    )
  }

  const invoiceFinalized = invoice.finalized
  const invoicePaid = invoice.paid
  const buttonDisabled = invoiceFinalized || invoicePaid

  const handleOpenModal = () => {
    if (!invoice) {
      return
    }

    setEditableInvoice({
      ...invoice,
      customer_id: invoice.customer_id ?? undefined,
      invoice_lines_attributes: invoice.invoice_lines?.map((line) => ({
        id: line.id,
        product_id: line.product_id,
        label: line.label,
        quantity: line.quantity,
        unit: line.unit,
        vat_rate: line.vat_rate,
        price: line.price,
        tax: line.tax,
      })),
    })

    setModalVisible(true)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={`Invoice #${invoice?.id}`}
          backButton={true}
          onBackPress={() => navigation.goBack()}
          rightButtonSymbol="..."
          onRightButtonPress={handleOpenModal}
          rightButtonDisabled={invoicePaid}
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
          <ScrollView showsVerticalScrollIndicator={false}>
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
            onPress={handleFinalizeInvoice}
            style={[
              styles.finalizeButton,
              buttonDisabled && styles.buttonDisabled,
            ]}
            disabled={buttonDisabled}
          >
            <Text style={styles.actionText}>Finalize Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[
              styles.deleteButton,
              buttonDisabled && styles.buttonDisabled,
            ]}
            disabled={buttonDisabled}
          >
            <Text style={styles.actionText}>Delete Invoice</Text>
          </TouchableOpacity>
        </View>
        {editableInvoice && (
          <InvoiceModalUpdate
            title="Edit Invoice"
            visible={modalVisible}
            invoice={editableInvoice}
            setInvoice={setEditableInvoice}
            isAlreadyFinalized={invoice.finalized}
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
    opacity: 0.5,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default InvoiceDetailScreen
