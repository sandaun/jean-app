import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
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

type FetchProductsResponse = Paths.GetSearchProducts.Responses.$200['products']

const DEBOUNCE_DELAY = 300

type SearchProductsProps = {
  onSelect: (id: number) => void
  disabled?: boolean
}

const SearchProducts: React.FC<SearchProductsProps> = forwardRef(
  ({ onSelect, disabled = false }, ref) => {
    const [query, setQuery] = useState('')
    const [allProducts, setAllProducts] = useState<FetchProductsResponse>([])
    const [filteredProducts, setFilteredProducts] =
      useState<FetchProductsResponse>([])
    const [isProductSelected, setIsProductSelected] = useState(false)

    const api = useApi()

    useEffect(() => {
      const fetchAllProducts = async () => {
        try {
          const { data } = await api.getSearchProducts({
            query: '',
          })
          setAllProducts(data.products)
        } catch (error) {
          console.error('Error fetching all products:', error)
        }
      }

      fetchAllProducts()
    }, [api])

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (query.length >= 1 && !isProductSelected) {
          const lowerText = query.toLowerCase()
          const filtered = allProducts.filter((product) =>
            product.label.toLowerCase().startsWith(lowerText),
          )
          setFilteredProducts(filtered.slice(0, 30))
        } else {
          setFilteredProducts([])
        }
      }, DEBOUNCE_DELAY)

      return () => clearTimeout(timeout)
    }, [query, allProducts, isProductSelected])

    const handleSelectProduct = (product: FetchProductsResponse[0]) => {
      setQuery(product.label)
      onSelect(product.id)
      setIsProductSelected(true)
    }

    useImperativeHandle(ref, () => ({
      clearSelection: () => {
        setQuery('')
        setIsProductSelected(false)
      },
    }))

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          placeholder="Search products"
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            setIsProductSelected(false)
          }}
          editable={!disabled}
        />
        {!disabled && !isProductSelected && (
          <View style={styles.listContainer}>
            {query.length > 0 && filteredProducts.length > 0 && (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Text
                    style={styles.item}
                    onPress={() => handleSelectProduct(item)}
                  >
                    {item.label}
                  </Text>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No results found</Text>
                }
                style={styles.list}
              />
            )}
            {query.length > 0 && filteredProducts.length === 0 && (
              <Text style={styles.emptyText}>No results found</Text>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#b0b0b0',
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

export default SearchProducts
