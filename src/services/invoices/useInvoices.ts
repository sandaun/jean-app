import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../api'
import { Components } from '../../api/generated/client'

export interface InvoiceWithCustomer extends Components.Schemas.Invoice {
  customer?: Components.Schemas.Customer // Opcional, segons la resposta
}

// Fetch invoices
export const useFetchInvoices = () => {
  const api = useApi()
  return useQuery<InvoiceWithCustomer[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.getInvoices({ page: 1, per_page: 100 })
      return data.invoices
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch a single invoice by ID
export const useFetchInvoiceById = (id: number) => {
  const api = useApi()
  return useQuery<InvoiceWithCustomer>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await api.getInvoice({ id })
      return data
    },
    enabled: !!id, // Només s'executa si hi ha un `id`
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch customers
export const useFetchCustomers = () => {
  const api = useApi()
  return useQuery<Components.Schemas.Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.getSearchCustomers({ query: '' })
      return data.customers
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch products
export const useFetchProducts = () => {
  const api = useApi()
  return useQuery<Components.Schemas.Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.getSearchProducts({ query: '' })
      return data.products
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Mutation to create an invoice
export const useCreateInvoice = () => {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newInvoice: Components.Schemas.InvoiceCreatePayload) => {
      await api.postInvoices({}, { invoice: newInvoice })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

// Mutation to update an invoice
export const useUpdateInvoice = () => {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updatedInvoice: Components.Schemas.InvoiceUpdatePayload,
    ) => {
      await api.putInvoice(
        { id: updatedInvoice.id },
        { invoice: updatedInvoice },
      )
    },
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
      queryClient.invalidateQueries({
        queryKey: ['invoices', invoiceId] as const,
      })
    },
  })
}

// Mutation to delete an invoice
export const useDeleteInvoice = () => {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.deleteInvoice({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

// Mutation to finalize an invoice
export const useFinalizeInvoice = () => {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data: invoice } = await api.getInvoice({ id })
      await api.putInvoice({ id }, { invoice: { ...invoice, finalized: true } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
      queryClient.invalidateQueries({
        queryKey: ['invoice', id],
      })
    },
  })
}
