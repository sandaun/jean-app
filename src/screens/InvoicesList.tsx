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
} from 'react-native'
import { useApi } from '../api'
import { Components, Paths } from '../api/generated/client'
import SearchCustomers from '../components/SearchCustomers'
import SearchProducts from '../components/SearchProducts'

type FetchInvoicesResponse = Paths.GetInvoices.Responses.$200

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

    console.log('Creating invoice:', newInvoice)

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
    <View style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      <Button title="Create Invoice" onPress={handleOpenModal} />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.invoiceItem}>
                <Text>
                  {item.customer?.first_name} {item.customer?.last_name}
                </Text>
                <Text>Total: ${item.total}</Text>
                <Text>Date: {item.date}</Text>
                <Text>Finalized: {item.finalized ? 'Yes' : 'No'}</Text>
                <Text>Paid: {item.paid ? 'Yes' : 'No'}</Text>
              </View>
            )}
          />
          <View style={styles.pagination}>
            <Button
              title="Previous"
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination?.page === 1}
            />
            <Text>
              Page {pagination?.page} of {pagination?.total_pages}
            </Text>
            <Button
              title="Next"
              onPress={() => setCurrentPage((prev) => prev + 1)}
              disabled={pagination?.page === pagination?.total_pages}
            />
          </View>
        </>
      )}

      {/* Modal per crear factura */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.contentWrapper}>
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                flex: 1,
              }}
            >
              <Text style={styles.modalTitle}>Create Invoice</Text>
              <SearchCustomers
                onSelect={(id) =>
                  setNewInvoice({ ...newInvoice, customer_id: id })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Deadline (YYYY-MM-DD)"
                value={newInvoice.deadline || ''}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, deadline: text })
                }
              />
              <View style={styles.checkboxContainer}>
                <View style={styles.checkbox}>
                  <Text>Paid</Text>
                  <Switch
                    value={newInvoice.paid}
                    onValueChange={(value) =>
                      setNewInvoice({ ...newInvoice, paid: value })
                    }
                  />
                </View>
                <View style={styles.checkbox}>
                  <Text>Finalized</Text>
                  <Switch
                    value={newInvoice.finalized}
                    onValueChange={(value) =>
                      setNewInvoice({ ...newInvoice, finalized: value })
                    }
                  />
                </View>
              </View>
              {/* Camps per afegir items */}
              <Text style={styles.subtitle}>Add Items</Text>

              <View style={[styles.row]}>
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
                    placeholder="Quantity"
                    keyboardType="numeric"
                    value={newItem.quantity?.toString() || ''}
                    onChangeText={(text) =>
                      setNewItem({
                        ...newItem,
                        quantity: text === '' ? undefined : Number(text), // Permet valor buit temporalment
                      })
                    }
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddItem}
                style={styles.addItemButton}
              >
                <Text>Add Item</Text>
              </TouchableOpacity>

              {/* Mostra items afegits */}
              <ScrollView style={{ height: 120 }}>
                {newInvoice.invoice_lines_attributes.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemText}>
                      {item.product_id} - {item.label} (x{item.quantity || 1}) -
                      Total: ${(item.quantity || 1) * (item.price || 0)}
                    </Text>
                    <Button
                      title="Delete"
                      color="red"
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
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalActions}>
              <Button title="Save" onPress={handleCreateInvoice} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  invoiceItem: { padding: 16, marginBottom: 12, backgroundColor: '#ffffff' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  contentWrapper: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 8,
    height: 650,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkbox: { flexDirection: 'row', alignItems: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around' },
  searchProductsInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  quantityInputContainer: {
    width: '20%',
  },
  addItemButton: { zIndex: -1 },
})

export default InvoicesList
