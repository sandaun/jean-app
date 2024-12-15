import React, { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Button,
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
import { Components, Paths } from '../api/generated/client'
import SearchCustomers from '../components/SearchCustomers'
import SearchProducts from '../components/SearchProducts'
import { isOverdue, formatToEuro } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'

type FetchInvoicesResponse = Paths.GetInvoices.Responses.$200

type InvoicesListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoicesList'
>

const InvoicesList = () => {
  const [invoices, setInvoices] = useState<FetchInvoicesResponse['invoices']>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<
    FetchInvoicesResponse['pagination'] | null
  >(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [allProducts, setAllProducts] = useState<Components.Schemas.Product[]>(
    [],
  )

  const navigation = useNavigation<InvoicesListNavigationProp>()

  const searchProductsRef = useRef<{ clearSelection: () => void }>(null)

  const fetchProducts = async () => {
    try {
      const { data } = await api.getSearchProducts({
        query: '',
        per_page: 1000,
      })
      setAllProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

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

  const api = useApi()

  useEffect(() => {
    fetchInvoices()
  }, [currentPage])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const { data } = await api.getInvoices({
        page: currentPage,
        per_page: 10,
      })
      setInvoices(data.invoices)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Invoice List</Text>
          <TouchableOpacity onPress={handleOpenModal} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
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

                    {/* Informació a la dreta */}
                    <View style={styles.invoiceItemTotalContainer}>
                      <Text style={styles.invoiceItemTotal}>
                        {formatToEuro(item.total)}
                      </Text>

                      {/* Estat de l'Invoice */}
                      <View style={styles.pillsContainer}>
                        {item.paid && (
                          <Text style={[styles.pill, styles.pillPaid]}>
                            Paid
                          </Text>
                        )}
                        {!item.paid && isOverdue(item.date, item.deadline) && (
                          <Text style={[styles.pill, styles.pillOverdue]}>
                            Overdue
                          </Text>
                        )}
                        {item.finalized &&
                          !isOverdue(item.date, item.deadline) &&
                          !item.paid && (
                            <Text style={[styles.pill, styles.pillFinalized]}>
                              Finalized
                            </Text>
                          )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={styles.pagination}>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={pagination?.page === 1}
              >
                <Text style={styles.paginationButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                Page {pagination?.page} of {pagination?.total_pages}
              </Text>
              <TouchableOpacity
                style={styles.paginationButton}
                onPress={() => setCurrentPage((prev) => prev + 1)}
                disabled={pagination?.page === pagination?.total_pages}
              >
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                {/* Títol del modal */}
                <Text style={styles.modalTitle}>Create Invoice</Text>

                {/* Client i data de venciment */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Customer</Text>
                  <SearchCustomers
                    onSelect={(id) =>
                      setNewInvoice({ ...newInvoice, customer_id: id })
                    }
                  />
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
                  {newInvoice.invoice_lines_attributes.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemText}>
                        {item.product_id} - {item.label} (x{item.quantity || 1})
                        - Total: ${(item.quantity || 1) * (item.price || 0)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updatedItems =
                            newInvoice.invoice_lines_attributes.filter(
                              (_, i) => i !== index,
                            )
                          setNewInvoice((prev) => ({
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
  title: {
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#A8DADC',
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
  pillsContainer: {
    flexDirection: 'row',
    marginTop: 4,
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
    marginBottom: 8,
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
    justifyContent: 'space-around',
    marginTop: 12,
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
