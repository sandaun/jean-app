import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import SearchCustomers from './SearchCustomers'
import SearchProducts from './SearchProducts'
import { Components } from '../api/generated/client'
import {
  INITIAL_INVOICE_LINE,
  INITIAL_INVOICE_LINE_UPDATE,
} from '../constants/constants'
import { formatToEuro } from '../utils/utils'
import DatePicker from './DateTimePicker'
import CustomCheckbox from './CustomCheckbox'
import {
  useFetchCustomers,
  useFetchProducts,
} from '../services/invoices/useInvoices'

interface InvoiceModalUpdateProps {
  visible: boolean
  invoice: Components.Schemas.InvoiceUpdatePayload
  onClose: () => void
  onSave: (invoice: Components.Schemas.InvoiceUpdatePayload) => void
  setInvoice: React.Dispatch<
    React.SetStateAction<Components.Schemas.InvoiceUpdatePayload>
  >
  title: string
}

const InvoiceModalUpdate: React.FC<InvoiceModalUpdateProps> = ({
  visible,
  invoice,
  onClose,
  onSave,
  setInvoice,
  title,
}) => {
  const [newItem, setNewItem] =
    useState<Components.Schemas.InvoiceLineUpdatePayload>(
      INITIAL_INVOICE_LINE_UPDATE,
    )

  const searchProductsRef = useRef<{ clearSelection: () => void }>(null)

  const { data: customers = [] } = useFetchCustomers()
  const { data: products = [] } = useFetchProducts()

  const selectedCustomerName = customers.find(
    (customer) => customer.id === invoice.customer_id,
  )

  const handleAddItem = () => {
    if (!newItem.label) {
      return
    }

    setInvoice((prev) => {
      const existingLineIndex = prev.invoice_lines_attributes?.findIndex(
        (line) => line.product_id === newItem.product_id,
      )

      let updatedLines = [...(prev.invoice_lines_attributes ?? [])]

      if (existingLineIndex !== undefined && existingLineIndex !== -1) {
        updatedLines[existingLineIndex] = {
          ...updatedLines[existingLineIndex],
          quantity:
            (updatedLines[existingLineIndex].quantity ?? 1) +
            (newItem.quantity ?? 1),
        }
      } else {
        updatedLines.push(newItem)
      }

      return {
        ...prev,
        invoice_lines_attributes: updatedLines,
      }
    })

    setNewItem(INITIAL_INVOICE_LINE)

    searchProductsRef.current?.clearSelection()
  }

  const handleDate = (selectedDate: Date) => {
    setInvoice({
      ...invoice,
      deadline: selectedDate.toISOString().split('T')[0],
    })
  }

  const isEditable = !invoice.finalized

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>

            <View style={styles.searchCustomersContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <SearchCustomers
                  selectedCustomerName={
                    selectedCustomerName
                      ? `${selectedCustomerName.first_name} ${selectedCustomerName.last_name}`
                      : ''
                  }
                  onSelect={(id) => setInvoice({ ...invoice, customer_id: id })}
                  disabled={!isEditable}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deadline</Text>
              <DatePicker
                deadline={
                  invoice.deadline ? new Date(invoice.deadline) : new Date()
                }
                handleDate={handleDate}
                disabled={!isEditable}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Items</Text>
              <View style={styles.row}>
                <View style={styles.searchProductsInputContainer}>
                  <Text style={styles.sectionSubtitle}>Product</Text>
                  <SearchProducts
                    ref={searchProductsRef}
                    onSelect={(productId) => {
                      const selectedProduct = products.find(
                        (p) => p.id === productId,
                      )
                      if (selectedProduct) {
                        setNewItem({
                          product_id: selectedProduct.id,
                          label: selectedProduct.label,
                          quantity: 1,
                          unit: selectedProduct.unit,
                          vat_rate: selectedProduct.vat_rate,
                          price: parseFloat(selectedProduct.unit_price),
                          tax: parseFloat(selectedProduct.unit_tax),
                        })
                      }
                    }}
                    disabled={!isEditable}
                  />
                </View>
                <View style={styles.quantityInputContainer}>
                  <Text style={styles.sectionSubtitle}>Quantity</Text>
                  <TextInput
                    style={[styles.input, !isEditable && styles.disabledInput]}
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={newItem.quantity?.toString() || ''}
                    onChangeText={(text) =>
                      setNewItem({
                        ...newItem,
                        quantity: text === '' ? undefined : Number(text),
                      })
                    }
                    editable={isEditable}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddItem}
                style={[
                  styles.addItemButton,
                  !isEditable && styles.disabledButton,
                ]}
                disabled={!isEditable}
              >
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.itemsList}
              showsVerticalScrollIndicator={false}
            >
              {(invoice.invoice_lines_attributes ?? []).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTotal}>
                        Quantity: {item.quantity || 1} - Total:{' '}
                        {formatToEuro(
                          (item.quantity || 1) * Number(item.tax || 0),
                        )}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const updatedItems =
                        invoice.invoice_lines_attributes?.filter(
                          (line, i) => i !== index,
                        )
                      setInvoice((prev) => ({
                        ...prev,
                        invoice_lines_attributes: updatedItems,
                      }))
                    }}
                    style={[
                      styles.deleteButton,
                      !isEditable && styles.disabledButton,
                    ]}
                    disabled={!isEditable}
                  >
                    <Text style={styles.deleteText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.switchContainer}>
              <CustomCheckbox
                label="Paid"
                checked={invoice.paid ?? false}
                onChange={(value) => setInvoice({ ...invoice, paid: value })}
              />
              <CustomCheckbox
                label="Finalized"
                checked={invoice.finalized ?? false}
                onChange={(value) =>
                  setInvoice({ ...invoice, finalized: value })
                }
                disabled={invoice.finalized}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => onSave(invoice)}
                style={[styles.saveButton]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContentWrapper: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 8,
    height: 650,
  },
  modalContent: {
    marginHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    marginBottom: 8,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1D3557',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#6C757D',
  },
  searchCustomersContainer: {
    zIndex: 2,
  },
  searchProductsInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  quantityInputContainer: {
    width: '25%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  itemsList: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
  },
  itemText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  addItemButton: {
    backgroundColor: '#457B9D',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  addItemButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#457B9D',
  },
  saveButton: {
    backgroundColor: '#457B9D',
    borderRadius: 8,
    paddingVertical: 12,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E63946',
    borderRadius: 8,
    paddingVertical: 12,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  itemRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#457B9D',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6C757D',
    marginBottom: 2,
  },
  deleteButton: {
    backgroundColor: '#E63946',
    borderRadius: 50,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#b0b0b0',
  },
  disabledButton: {
    opacity: 0.5,
  },
})

export default InvoiceModalUpdate
