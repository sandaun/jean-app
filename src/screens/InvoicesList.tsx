import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useApi } from '../api'
import { Components } from '../api/generated/client'
import SearchCustomers from '../components/SearchCustomers'
import SearchProducts from '../components/SearchProducts'
import { calculateAndFormatInvoiceTotal } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import Header from '../components/Header'
import StatusPills from '../components/StatusPills'
import { useInvoices } from '../context/InvoicesContext'

type InvoicesListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoicesList'
>

const InvoicesList = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [allProducts, setAllProducts] = useState<Components.Schemas.Product[]>(
    [],
  )

  const { invoices, loading, fetchInvoices } = useInvoices()

  const navigation = useNavigation<InvoicesListNavigationProp>()

  const searchProductsRef = useRef<{ clearSelection: () => void }>(null)

  const api = useApi()

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

  const [newInvoice, setNewInvoice] =
    useState<Components.Schemas.InvoiceCreatePayload>({
      customer_id: 0,
      date: new Date().toISOString().split('T')[0],
      deadline: '',
      paid: false,
      finalized: false,
      invoice_lines_attributes: [],
    })

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

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleOpenModal = () => {
    setNewInvoice({
      customer_id: 0,
      date: new Date().toISOString().split('T')[0],
      deadline: '',
      paid: false,
      finalized: false,
      invoice_lines_attributes: [],
    })
    setNewItem({
      product_id: 0,
      label: '',
      quantity: 1,
      unit: undefined,
      vat_rate: undefined,
      price: '',
      tax: '',
    })
    setModalVisible(true)
  }

  const handleAddItem = () => {
    if (!newItem.label) {
      Alert.alert('Error', 'Please select a product before adding.')
      return
    }

    if (!newItem.quantity || newItem.quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.')
      return
    }

    // Si tot és correcte, afegim l'article
    setNewInvoice((prevInvoice) => ({
      ...prevInvoice,
      invoice_lines_attributes: [
        ...(prevInvoice.invoice_lines_attributes || []),
        newItem,
      ],
    }))

    // Aquí esborrem la selecció i el `newItem` només després d'afegir correctament
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

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer_id || !newInvoice.deadline) {
      Alert.alert(
        'Error',
        'Please fill in all fields before creating an invoice.',
      )
      return
    }

    try {
      await api.postInvoices({}, { invoice: { ...newInvoice } })
      Alert.alert('Success', 'Invoice created successfully!')
      setModalVisible(false)
      fetchInvoices()
    } catch (error) {
      console.error('Error creating invoice:', error)
      Alert.alert('Error', 'Failed to create invoice.')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title="Invoice List"
          buttonPosition="right"
          buttonSymbol="+"
          onButtonPress={handleOpenModal}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            <FlatList
              data={invoices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('InvoiceDetail', { invoiceId: item.id })
                  }
                >
                  <View style={styles.invoiceItem}>
                    <View style={styles.invoiceItemNameContainer}>
                      <Text style={styles.invoiceItemName}>
                        {item.customer?.first_name} {item.customer?.last_name}
                      </Text>
                      <Text style={styles.invoiceItemDate}>
                        Invoice #{item.id}
                      </Text>
                      <Text style={styles.invoiceItemDate}>
                        Date: {item.date}
                      </Text>
                    </View>
                    <View style={styles.invoiceItemTotalContainer}>
                      <Text style={styles.invoiceItemTotal}>
                        {calculateAndFormatInvoiceTotal(item.invoice_lines)}
                      </Text>

                      {/* Estat de l'Invoice */}
                      <StatusPills
                        paid={item.paid}
                        finalized={item.finalized}
                        date={item.date}
                        deadline={item.deadline}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
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
                      onSelect={(id) =>
                        setNewInvoice({ ...newInvoice, customer_id: id })
                      }
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Deadline</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Deadline (YYYY-MM-DD)"
                    value={newInvoice.deadline || ''}
                    onChangeText={(text) =>
                      setNewInvoice({ ...newInvoice, deadline: text })
                    }
                  />
                </View>

                {/* Switches Paid i Finalized */}
                <View style={styles.switchContainer}>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Paid</Text>
                    <Switch
                      value={newInvoice.paid}
                      onValueChange={(value) =>
                        setNewInvoice({ ...newInvoice, paid: value })
                      }
                    />
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Finalized</Text>
                    <Switch
                      value={newInvoice.finalized}
                      onValueChange={(value) =>
                        setNewInvoice({ ...newInvoice, finalized: value })
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
                  {(newInvoice.invoice_lines_attributes ?? []).map(
                    (item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemText}>
                          {item.product_id} - {item.label} (x
                          {item.quantity || 1}) - Total:{' '}
                          {(item.quantity || 1) * Number(item.price || 0)} €
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            const updatedItems = (
                              newInvoice.invoice_lines_attributes ?? []
                            ).filter((_, i) => i !== index)
                            setNewInvoice((prev) => ({
                              ...prev,
                              invoice_lines_attributes: updatedItems,
                            }))
                          }}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ),
                  )}
                </ScrollView>

                {/* Botons d'acció */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={handleCreateInvoice}
                    style={styles.saveButton}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#457B9D',
  },
  paginationText: {
    fontSize: 14,
    color: '#457B9D',
  },
  paginationButton: {
    backgroundColor: '#457B9D',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  invoiceItemNameContainer: {
    flex: 1,
    height: 55,
    justifyContent: 'space-between',
  },
  invoiceItemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1D3557',
  },
  invoiceItemDate: {
    fontSize: 14,
    color: '#6C757D',
  },
  invoiceItemTotalContainer: {
    alignItems: 'flex-end',
    height: 55,
    justifyContent: 'space-between',
  },
  invoiceItemTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6C757D',
  },
  searchCustomersContainer: {
    zIndex: 2,
  },
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
    color: '#1D3557',
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
  searchProductsInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  quantityInputContainer: {
    width: '25%',
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

export default InvoicesList
