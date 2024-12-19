import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useApi } from '../api'
import { Components } from '../api/generated/client'
import { calculateAndFormatInvoiceTotal } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import Header from '../components/Header'
import StatusPills from '../components/StatusPills'
import { useInvoices } from '../context/InvoicesContext'
import InvoiceModal from '../components/InvoiceModal'
import { getInitialInvoice } from '../constants/constants'

type InvoicesListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoicesList'
>

type InvoiceWithCustomer = Components.Schemas.Invoice & {
  customer?: Components.Schemas.Customer
}

const InvoicesList = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [allProducts, setAllProducts] = useState<Components.Schemas.Product[]>(
    [],
  )
  const [newInvoice, setNewInvoice] =
    useState<Components.Schemas.InvoiceCreatePayload>(getInitialInvoice())

  const { invoices, loading, fetchInvoices } = useInvoices()

  const navigation = useNavigation<InvoicesListNavigationProp>()

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

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleOpenModal = () => {
    setNewInvoice(getInitialInvoice())
    setModalVisible(true)
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

  const renderItem = ({ item }: { item: InvoiceWithCustomer }) => {
    return (
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
            <Text style={styles.invoiceItemData}>Invoice #{item.id}</Text>
            <Text style={styles.invoiceItemData}>Date: {item.date}</Text>
          </View>
          <View style={styles.invoiceItemTotalContainer}>
            <Text style={styles.invoiceItemTotal}>
              {calculateAndFormatInvoiceTotal(item.invoice_lines)}
            </Text>

            <StatusPills
              paid={item.paid}
              finalized={item.finalized}
              date={item.date}
              deadline={item.deadline}
            />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={'Invoice List'}
          rightButtonSymbol="+"
          onRightButtonPress={handleOpenModal}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={invoices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          </>
        )}
        <InvoiceModal
          title="Create Invoice"
          setInvoice={setNewInvoice}
          visible={modalVisible}
          invoice={newInvoice}
          allProducts={allProducts}
          onClose={() => setModalVisible(false)}
          onSave={handleCreateInvoice}
        />
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
  invoiceItemData: {
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
})

export default InvoicesList
