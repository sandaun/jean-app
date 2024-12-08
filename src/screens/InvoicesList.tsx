import React, { useEffect, useState } from 'react'
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
} from 'react-native'
import { useApi } from '../api'
import { Paths } from '../api/generated/client'
import SearchCustomers from '../components/SearchCustomers'
import { Dropdown } from 'react-native-element-dropdown'

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
  const [newInvoice, setNewInvoice] = useState({
    customer_id: 0,
    date: '',
    deadline: '',
    paid: false,
    finalized: false,
    invoice_lines_attributes: [],
  })
  const [newItem, setNewItem] = useState({
    product_id: '',
    label: '',
    quantity: 1,
    unit: '',
    vat_rate: '',
    price: '',
    tax: '',
  })
  const api = useApi()

  useEffect(() => {
    fetchInvoices()
  }, [currentPage])

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
    setModalVisible(true)
  }

  const handleAddItem = () => {
    // Afegir el nou item a la llista d'items
    setNewInvoice((prevInvoice) => ({
      ...prevInvoice,
      invoice_lines_attributes: [
        ...prevInvoice.invoice_lines_attributes,
        newItem,
      ],
    }))
    // Buidem els camps del nou item
    setNewItem({
      product_id: '',
      label: '',
      quantity: 1,
      unit: '',
      vat_rate: '',
      price: '',
      tax: '',
    })
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

  const unitOptions = [
    { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Piece', value: 'piece' },
  ]

  const vatRateOptions = [
    { label: '0%', value: '0' },
    { label: '5.5%', value: '5.5' },
    { label: '10%', value: '10' },
    { label: '20%', value: '20' },
  ]

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
          <View style={styles.scrollViewWrapper}>
            <View
              style={{
                backgroundColor: 'orange',
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
                value={newInvoice.deadline}
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
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.rowItem]}
                  placeholder="Product ID"
                  value={newItem.product_id}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, product_id: text })
                  }
                />
                <TextInput
                  style={[styles.input, styles.rowItem]}
                  placeholder="Label"
                  value={newItem.label}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, label: text })
                  }
                />
              </View>
              {/* Quantitat, Preu i Total a la mateixa fila */}
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.rowItem]}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={String(newItem.quantity)}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, quantity: parseInt(text) || 1 })
                  }
                />
                <TextInput
                  style={[styles.input, styles.rowItem]}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={String(newItem.price)}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, price: parseFloat(text) || 0 })
                  }
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.rowItem,
                    { backgroundColor: '#f0f0f0' },
                  ]}
                  editable={false}
                  value={String(newItem.quantity * newItem.price || 0)}
                  placeholder="Total"
                />
              </View>
              {/* Dropdowns */}
              <View style={styles.row}>
                <Dropdown
                  style={[styles.input, styles.rowItem]}
                  data={unitOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Sel. Unit"
                  value={newItem.unit}
                  onChange={(item) =>
                    setNewItem({ ...newItem, unit: item.value })
                  }
                />
                <Dropdown
                  style={[styles.input, styles.rowItem]}
                  data={vatRateOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Sel. VAT Rate"
                  value={newItem.vat_rate}
                  onChange={(item) =>
                    setNewItem({ ...newItem, vat_rate: item.value })
                  }
                />
              </View>
              <TextInput
                style={[styles.input, styles.rowItem]}
                placeholder="Tax"
                keyboardType="numeric"
                value={String(newItem.tax)}
                onChangeText={(text) =>
                  setNewItem({ ...newItem, tax: parseFloat(text) || 0 })
                }
              />
              <Button title="Add Item" onPress={handleAddItem} />

              {/* Mostra items afegits */}
              <ScrollView style={{ height: 120 }}>
                {newInvoice.invoice_lines_attributes.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemText}>
                      {item.product_id} - {item.label} (x{item.quantity}) -
                      Total: ${item.quantity * item.price || 0}
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
  scrollViewWrapper: {
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
})

export default InvoicesList
