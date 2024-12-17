import React, { useEffect, useState } from 'react'
import {
  TextInput,
  FlatList,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native'
import { useApi } from '../api'
import { Paths } from '../api/generated/client'

type FetchCustomersResponse =
  Paths.GetSearchCustomers.Responses.$200['customers']

const DEBOUNCE_DELAY = 300

const SearchCustomers = ({
  onSelect,
  selectedCustomerName,
}: {
  onSelect: (id: number) => void
  selectedCustomerName?: string
}) => {
  const [query, setQuery] = useState(selectedCustomerName || '')
  const [allCustomers, setAllCustomers] = useState<FetchCustomersResponse>([])
  const [filteredCustomers, setFilteredCustomers] =
    useState<FetchCustomersResponse>([])
  const api = useApi()

  // Sincronitza el nom del client seleccionat quan canviï
  useEffect(() => {
    if (selectedCustomerName) {
      setQuery(selectedCustomerName)
    }
  }, [selectedCustomerName])

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const { data } = await api.getSearchCustomers({
          query: '',
        })
        setAllCustomers(data.customers)
      } catch (error) {
        console.error('Error fetching all customers:', error)
      }
    }

    fetchAllCustomers()
  }, [api])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 1) {
        const lowerText = query.toLowerCase()
        const filtered = allCustomers.filter(
          (customer) =>
            customer.first_name.toLowerCase().startsWith(lowerText) ||
            customer.last_name.toLowerCase().startsWith(lowerText),
        )
        setFilteredCustomers(filtered.slice(0, 30))
      } else {
        setFilteredCustomers([])
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeout)
  }, [query, allCustomers])

  const handleSelectCustomer = (customer: FetchCustomersResponse[0]) => {
    setQuery(`${customer.first_name} ${customer.last_name}`)
    onSelect(customer.id)
    setFilteredCustomers([])
  }

  const isQueryMatchingCustomer = () => {
    return allCustomers.some(
      (customer) =>
        `${customer.first_name} ${customer.last_name}`.toLowerCase() ===
        query.toLowerCase(),
    )
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search customers"
        value={query}
        onChangeText={(text) => {
          setQuery(text)
        }}
      />
      <View style={styles.listContainer}>
        {query.length > 0 && filteredCustomers.length > 0 && (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Text
                style={styles.item}
                onPress={() => handleSelectCustomer(item)}
              >
                {item.first_name} {item.last_name}
              </Text>
            )}
            ListEmptyComponent={
              !isQueryMatchingCustomer() ? (
                <Text style={styles.emptyText}>No results found</Text>
              ) : null
            }
            style={styles.list}
          />
        )}
        {query.length > 0 &&
          filteredCustomers.length === 0 &&
          !isQueryMatchingCustomer() && (
            <Text style={styles.emptyText}>No results found</Text>
          )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  listContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 50,
    backgroundColor: 'white',
  },
  list: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    padding: 10,
    color: '#999',
  },
})

export default SearchCustomers
