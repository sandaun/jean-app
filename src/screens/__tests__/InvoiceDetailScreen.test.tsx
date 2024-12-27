import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { Alert } from 'react-native'
import InvoiceDetailScreen from '../InvoiceDetailScreen'
import {
  useFetchInvoiceById,
  useDeleteInvoice,
  useUpdateInvoice,
} from '../../services/invoices/useInvoices'
import { ApiProvider } from '../../api'
import { useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../navigation/AppNavigator'

const mockInvoice = {
  id: 25742,
  customer_id: 10,
  finalized: false,
  paid: false,
  date: '2024-12-17',
  deadline: '2024-12-20',
  tax: '5413.51',
  total: '50125.0',
  customer: {
    id: 10,
    first_name: 'Eli',
    last_name: 'Abernathy',
    address: '287 Cummerata Cove',
    city: 'Annamaeside',
    country: 'Uganda',
    country_code: 'UG',
    zip_code: '51598-6356',
  },
  invoice_lines: [
    {
      id: 47778,
      invoice_id: 25742,
      label: 'Audi S5',
      price: '24450.0',
      quantity: 1,
      tax: '4075.0',
      unit: 'piece',
      vat_rate: '20',
      product_id: 1,
      product: {
        id: 1,
        label: 'Audi S5',
        unit_price: '24450.0',
        vat_rate: '20',
        unit: 'piece',
      },
    },
    {
      id: 47779,
      invoice_id: 25742,
      label: 'Dodge Charger',
      price: '25675.0',
      quantity: 1,
      tax: '1338.51',
      unit: 'piece',
      vat_rate: '5.5',
      product_id: 10,
      product: {
        id: 10,
        label: 'Dodge Charger',
        unit_price: '25675.0',
        vat_rate: '5.5',
        unit: 'piece',
      },
    },
  ],
}

jest.mock('../../services/invoices/useInvoices', () => ({
  useFetchInvoiceById: jest.fn(),
  useDeleteInvoice: jest.fn(),
  useUpdateInvoice: jest.fn(),
  useFetchCustomers: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useFetchProducts: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}))

jest.spyOn(Alert, 'alert')

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(),
  getId: jest.fn(),
  getState: jest.fn(),
  getSearchCustomers: jest.fn().mockResolvedValue({ data: { customers: [] } }),
  getSearchProducts: jest.fn().mockResolvedValue({ data: { products: [] } }),
}

jest.mock('../../api', () => ({
  useApi: () => mockApi,
  ApiProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('../../services/invoices/useInvoices', () => ({
  useFetchInvoiceById: jest.fn().mockReturnValue({
    data: mockInvoice,
    isLoading: false,
  }),
  useDeleteInvoice: jest.fn(),
  useUpdateInvoice: jest.fn(),
  useFetchCustomers: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useFetchProducts: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useFinalizeInvoice: jest.fn().mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValueOnce({}),
  }),
}))

describe('InvoiceDetailScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    getId: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    getParent: jest.fn(),
  } as unknown as NativeStackNavigationProp<RootStackParamList, 'InvoiceDetail'>

  const mockRoute: RouteProp<RootStackParamList, 'InvoiceDetail'> = {
    key: 'InvoiceDetail',
    name: 'InvoiceDetail',
    params: { invoiceId: 1 },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNavigation as jest.Mock).mockReturnValue(mockNavigation)
    ;(useFetchInvoiceById as jest.Mock).mockReturnValue({
      data: mockInvoice,
      isLoading: false,
    })
    ;(useDeleteInvoice as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValueOnce({}),
    })
    ;(useUpdateInvoice as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValueOnce({}),
    })
  })

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ApiProvider url="http://test.com" token="test-token">
        {component}
      </ApiProvider>,
    )
  }

  it('renders loading state', () => {
    ;(useFetchInvoiceById as jest.Mock).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    })

    const { getByTestId } = renderWithProvider(
      <InvoiceDetailScreen route={mockRoute} navigation={mockNavigation} />,
    )

    expect(getByTestId('loading-indicator')).toBeTruthy()
  })

  it('renders invoice details', () => {
    const { getByText } = renderWithProvider(
      <InvoiceDetailScreen route={mockRoute} navigation={mockNavigation} />,
    )

    expect(getByText('Invoice #25742')).toBeTruthy()
    expect(getByText('Eli Abernathy')).toBeTruthy()
    expect(getByText('Audi S5')).toBeTruthy()
    expect(getByText('47778')).toBeTruthy()
  })

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = renderWithProvider(
      <InvoiceDetailScreen route={mockRoute} navigation={mockNavigation} />,
    )

    fireEvent.press(getByTestId('back-button'))
    expect(mockNavigation.goBack).toHaveBeenCalled()
  })

  it('handles delete invoice', async () => {
    const { getByText } = renderWithProvider(
      <InvoiceDetailScreen route={mockRoute} navigation={mockNavigation} />,
    )

    await act(async () => {
      fireEvent.press(getByText('Delete Invoice'))
    })

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      expect.any(Array),
    )
  })

  it('opens edit modal when right button is pressed', async () => {
    const { getByTestId, getByText } = renderWithProvider(
      <InvoiceDetailScreen route={mockRoute} navigation={mockNavigation} />,
    )

    fireEvent.press(getByTestId('right-button'))

    await act(async () => {
      expect(getByText('Edit Invoice')).toBeTruthy()
    })
  })
})
