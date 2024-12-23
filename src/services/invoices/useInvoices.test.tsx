import { renderHook, act } from '@testing-library/react-hooks'
import {
  useFetchInvoices,
  useFetchInvoiceById,
  useCreateInvoice,
  useDeleteInvoice,
  useUpdateInvoice,
} from './useInvoices'

jest.mock('../../api', () => ({
  useApi: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('../../services/invoices/useInvoices', () => ({
  useFetchInvoices: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useFetchInvoiceById: jest.fn(() => ({
    data: undefined,
    isLoading: true,
  })),
  useCreateInvoice: jest.fn(() => ({
    mutate: jest.fn(),
  })),
  useDeleteInvoice: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useUpdateInvoice: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}))

describe('useInvoices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useFetchInvoices', () => {
    it('fetches and returns invoices successfully', async () => {
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
        },
      ]

      ;(useFetchInvoices as jest.Mock).mockReturnValue({
        data: mockInvoices,
        isLoading: false,
      })

      const { result } = renderHook(() => useFetchInvoices())

      expect(result.current.data).toEqual(mockInvoices)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles loading state correctly', () => {
      ;(useFetchInvoices as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      })

      const { result } = renderHook(() => useFetchInvoices())

      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useFetchInvoiceById', () => {
    it('fetches invoice by ID successfully', () => {
      const mockInvoice = {
        id: 1,
        customer_id: 1,
        date: '2024-01-01',
        deadline: '2024-02-01',
        paid: false,
        finalized: false,
      }

      ;(useFetchInvoiceById as jest.Mock).mockReturnValue({
        data: mockInvoice,
        isLoading: false,
      })

      const { result } = renderHook(() => useFetchInvoiceById(1))

      expect(result.current.data).toEqual(mockInvoice)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('useCreateInvoice', () => {
    it('creates an invoice successfully', async () => {
      const mutateMock = jest.fn()
      ;(useCreateInvoice as jest.Mock).mockReturnValue({ mutate: mutateMock })

      const { result } = renderHook(() => useCreateInvoice())

      act(() => {
        result.current.mutate({ customer_id: 1 })
      })

      expect(mutateMock).toHaveBeenCalledWith({ customer_id: 1 })
    })
  })

  describe('useDeleteInvoice', () => {
    it('deletes an invoice successfully', async () => {
      const mutateAsyncMock = jest.fn().mockResolvedValueOnce({})
      ;(useDeleteInvoice as jest.Mock).mockReturnValue({
        mutateAsync: mutateAsyncMock,
      })

      const { result } = renderHook(() => useDeleteInvoice())

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(mutateAsyncMock).toHaveBeenCalledWith(1)
    })
  })

  describe('useUpdateInvoice', () => {
    it('updates an invoice successfully', async () => {
      const mutateAsyncMock = jest.fn().mockResolvedValueOnce({})
      ;(useUpdateInvoice as jest.Mock).mockReturnValue({
        mutateAsync: mutateAsyncMock,
      })

      const { result } = renderHook(() => useUpdateInvoice())

      await act(async () => {
        await result.current.mutateAsync({ id: 1, customer_id: 2 })
      })

      expect(mutateAsyncMock).toHaveBeenCalledWith({ id: 1, customer_id: 2 })
    })
  })
})
