import React, { useMemo, useState } from 'react'
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
import { Components } from '../api/generated/client'
import { calculateAndFormatInvoiceTotal } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import Header from '../components/Header'
import StatusPills from '../components/StatusPills'
import InvoiceModalCreate from '../components/InvoiceModalCreate'
import { getInitialInvoice } from '../constants/constants'
import {
  useFetchInvoices,
  useCreateInvoice,
  InvoiceWithCustomer,
} from '../services/invoices/useInvoices'

type InvoicesListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoicesList'
>

const InvoicesList = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [newInvoice, setNewInvoice] =
    useState<Components.Schemas.InvoiceCreatePayload>(getInitialInvoice())

  const { data: invoices = [], isLoading } = useFetchInvoices()
  const { mutate: createInvoice } = useCreateInvoice()
  const navigation = useNavigation<InvoicesListNavigationProp>()

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

    createInvoice(newInvoice)
    setModalVisible(false)
  }

  const renderItem = useMemo(() => {
    return ({ item }: { item: InvoiceWithCustomer }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('InvoiceDetail', { invoiceId: item.id })
        }
        testID={`invoice-item-${item.id}`}
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
  }, [navigation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title={'Invoice List'}
          rightButtonSymbol="+"
          onRightButtonPress={handleOpenModal}
        />
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={styles.loader}
            testID="loading-indicator"
          />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={invoices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}
        <InvoiceModalCreate
          title="Create Invoice"
          visible={modalVisible}
          invoice={newInvoice}
          setInvoice={setNewInvoice}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
