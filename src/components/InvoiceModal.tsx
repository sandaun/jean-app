import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import SearchCustomers from './SearchCustomers'
import SearchProducts from './SearchProducts'
import { Components } from '../api/generated/client'
import { useApi } from '../api'

interface InvoiceModalProps {
  visible: boolean
  invoice: Components.Schemas.InvoiceCreatePayload
  allProducts: Components.Schemas.Product[]
  onClose: () => void
  onSave: (invoice: Components.Schemas.InvoiceCreatePayload) => void
  setInvoice: React.Dispatch<
    React.SetStateAction<Components.Schemas.InvoiceCreatePayload>
  >
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  invoice,
  allProducts,
  onClose,
  onSave,
  setInvoice,
}) => {
  const [allCustomers, setAllCustomers] = useState<
    Components.Schemas.Customer[]
  >([])

  const api = useApi()

  useEffect(() => {
    // Carregar clients des de l'API quan el modal s'obre
    const fetchCustomers = async () => {
      try {
        const { data } = await api.getSearchCustomers({ query: '' })
        setAllCustomers(data.customers)
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }

    fetchCustomers()
  }, [])

  const selectedCustomerName = allCustomers.find(
    (customer) => customer.id === invoice.customer_id,
  )

  const [newItem, setNewItem] =
    useState<Components.Schemas.InvoiceLineCreatePayload>({
      product_id: 0,
      label: '',
      quantity: 1,
      unit: undefined,
      vat_rate: undefined,
      price: '',
      tax: '',
    })

  const searchProductsRef = useRef<{ clearSelection: () => void }>(null)

  const handleAddItem = () => {
    if (!newItem.label) return

    setInvoice((prev) => {
      // Comprova si ja existeix una línia amb el mateix product_id
      const existingLineIndex = prev.invoice_lines_attributes?.findIndex(
        (line) => line.product_id === newItem.product_id,
      )

      let updatedLines = [...(prev.invoice_lines_attributes ?? [])]

      if (existingLineIndex !== undefined && existingLineIndex !== -1) {
        // Si ja existeix, suma la quantitat
        updatedLines[existingLineIndex] = {
          ...updatedLines[existingLineIndex],
          quantity:
            (updatedLines[existingLineIndex].quantity ?? 1) +
            (newItem.quantity ?? 1),
        }
      } else {
        // Si no existeix, afegeix una nova línia
        updatedLines.push(newItem)
      }

      return {
        ...prev,
        invoice_lines_attributes: updatedLines,
      }
    })

    // Neteja el nou item
    setNewItem({
      product_id: 0,
      label: '',
      quantity: 1,
      unit: undefined,
      vat_rate: undefined,
      price: '',
      tax: '',
    })

    searchProductsRef.current?.clearSelection()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentWrapper}>
          <View style={styles.modalContent}>
            {/* Títol del modal */}
            <Text style={styles.modalTitle}>Create Invoice</Text>

            {/* Client i data de venciment */}
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
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deadline</Text>
              <TextInput
                style={styles.input}
                placeholder="Deadline (YYYY-MM-DD)"
                value={invoice.deadline || ''}
                onChangeText={(text) =>
                  setInvoice({ ...invoice, deadline: text })
                }
              />
            </View>

            {/* Switches Paid i Finalized */}
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Paid</Text>
                <Switch
                  value={invoice.paid}
                  onValueChange={(value) =>
                    setInvoice({ ...invoice, paid: value })
                  }
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Finalized</Text>
                <Switch
                  value={invoice.finalized}
                  onValueChange={(value) =>
                    setInvoice({ ...invoice, finalized: value })
                  }
                />
              </View>
            </View>

            {/* Afegir producte i quantitat */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Items</Text>
              <View style={styles.row}>
                <View style={styles.searchProductsInputContainer}>
                  <SearchProducts
                    ref={searchProductsRef}
                    onSelect={(productId) => {
                      const selectedProduct = allProducts.find(
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
                  />
                </View>
                <View style={styles.quantityInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={newItem.quantity?.toString() || ''}
                    onChangeText={(text) =>
                      setNewItem({
                        ...newItem,
                        quantity: text === '' ? undefined : Number(text),
                      })
                    }
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddItem}
                style={styles.addItemButton}
              >
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {/* Llista d'items */}
            <ScrollView style={styles.itemsList}>
              {(invoice.invoice_lines_attributes ?? []).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemText}>
                    {item.product_id} - {item.label} (x
                    {item.quantity || 1}) - Total:{' '}
                    {(item.quantity || 1) * Number(item.price || 0)} €
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updatedItems = (
                        invoice.invoice_lines_attributes ?? []
                      ).filter((_, i) => i !== index)
                      setInvoice((prev) => ({
                        ...prev,
                        invoice_lines_attributes: updatedItems,
                      }))
                    }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Botons d'acció */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => onSave(invoice)}
                style={styles.saveButton}
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
    marginBottom: 16,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1D3557',
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
    justifyContent: 'space-between',
    marginBottom: 16,
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
    maxHeight: 150,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  },
  addItemButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteText: {
    color: '#E63946',
    fontWeight: '600',
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
})

export default InvoiceModal
