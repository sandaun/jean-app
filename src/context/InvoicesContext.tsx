import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { Components } from '../api/generated/client'
import { useApi } from '../api'

type InvoiceContextType = {
  invoices: Components.Schemas.Invoice[]
  loading: boolean
  fetchInvoices: () => Promise<void>
  updateInvoice: (
    updatedInvoice: Components.Schemas.InvoiceUpdatePayload,
  ) => Promise<void>
  deleteInvoice: (invoiceId: number) => Promise<void>
  finalizeInvoice: (invoiceId: number) => Promise<void>
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export const InvoicesProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoicesState] = useState<Components.Schemas.Invoice[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const api = useApi()

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.getInvoices({ page: 1, per_page: 100 })
      setInvoicesState(data.invoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }, [api])

  const updateInvoice = async (
    updatedInvoice: Components.Schemas.InvoiceUpdatePayload,
  ) => {
    try {
      await api.putInvoice(
        { id: updatedInvoice.id },
        { invoice: updatedInvoice },
      )

      const { data } = await api.getInvoice({ id: updatedInvoice.id })

      setInvoicesState((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === data.id ? data : invoice,
        ),
      )
    } catch (error) {
      console.error('Error updating invoice:', error)
    }
  }

  const deleteInvoice = async (invoiceId: number) => {
    try {
      await api.deleteInvoice({ id: invoiceId })
      setInvoicesState((prevInvoices) =>
        prevInvoices.filter((invoice) => invoice.id !== invoiceId),
      )
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const finalizeInvoice = async (invoiceId: number) => {
    try {
      const invoice = invoices.find((inv) => inv.id === invoiceId)
      if (!invoice) return

      const { customer_id, ...rest } = invoice
      const invoiceToUpdate = {
        ...rest,
        customer_id: customer_id ?? undefined,
        finalized: true,
      }

      await api.putInvoice({ id: invoice.id }, { invoice: invoiceToUpdate })

      setInvoicesState((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, finalized: true } : inv,
        ),
      )
    } catch (error) {
      console.error('Error finalizing invoice:', error)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        fetchInvoices,
        updateInvoice,
        deleteInvoice,
        finalizeInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

export const useInvoices = () => {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoices must be used within an InvoicesProvider')
  }
  return context
}
