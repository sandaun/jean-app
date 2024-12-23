import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import InvoicesList from '../InvoicesList'
import {
  useFetchInvoices,
  useCreateInvoice,
  useFetchCustomers,
  useFetchProducts,
} from '../../services/invoices/useInvoices'
import { ApiProvider } from '../../api'
import { act } from 'react-test-renderer'

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}))

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  getSearchCustomers: jest.fn().mockResolvedValue({ data: { customers: [] } }),
  getSearchProducts: jest.fn().mockResolvedValue({ data: { products: [] } }),
}

jest.mock('../../api', () => ({
  useApi: () => mockApi,
  ApiProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('../../services/invoices/useInvoices', () => ({
  useFetchInvoices: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useCreateInvoice: jest.fn(),
  useFetchCustomers: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useFetchProducts: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}))

jest.spyOn(Alert, 'alert')

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ApiProvider url="http://test.com" token="test-token">
      {component}
    </ApiProvider>,
  )
}

describe('InvoicesList', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  }
  const mockInvoices = [
    {
      id: 1,
      customer: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
      },
      date: '2024-01-01',
      deadline: '2024-02-01',
      paid: false,
      finalized: false,
      invoice_lines: [
        {
          id: 1,
          description: 'Service 1',
          quantity: 1,
          unit_price: 100,
        },
      ],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNavigation as jest.Mock).mockReturnValue(mockNavigation)
    ;(useFetchInvoices as jest.Mock).mockReturnValue({
      data: mockInvoices,
      isLoading: false,
    })
    ;(useCreateInvoice as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
    })
    ;(useFetchCustomers as jest.Mock).mockReturnValue({
      data: [],
    })
    ;(useFetchProducts as jest.Mock).mockReturnValue({
      data: [],
    })
  })

  it('renders loading state', () => {
    ;(useFetchInvoices as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    const { getByTestId } = renderWithProvider(<InvoicesList />)
    expect(getByTestId('loading-indicator')).toBeTruthy()
  })

  it('renders list of invoices', () => {
    const { getByText } = renderWithProvider(<InvoicesList />)
    expect(getByText('John Doe')).toBeTruthy()
    expect(getByText('Invoice #1')).toBeTruthy()
    expect(getByText('Date: 2024-01-01')).toBeTruthy()
  })

  it('navigates to invoice detail when pressing an invoice', () => {
    const { getByText } = renderWithProvider(<InvoicesList />)
    fireEvent.press(getByText('John Doe'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('InvoiceDetail', {
      invoiceId: 1,
    })
  })

  it('opens create invoice modal when pressing add button', async () => {
    const { getByTestId } = renderWithProvider(<InvoicesList />)

    await act(async () => {
      fireEvent.press(getByTestId('right-button'))
    })

    await act(async () => {
      expect(getByTestId('invoice-modal-create')).toBeTruthy()
    })
  })
})
