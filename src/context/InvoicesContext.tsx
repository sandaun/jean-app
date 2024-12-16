import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { Components, Paths } from '../api/generated/client'
import { useApi } from '../api'

type InvoiceContextType = {
  invoices: Paths.GetInvoices.Responses.$200['invoices'] // Ajustat
  loading: boolean
  fetchInvoices: () => Promise<void>
  updateInvoice: (
    updatedInvoice: Paths.GetInvoices.Responses.$200['invoices'][0],
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

  // Funció per fer fetch de les factures
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

  // Actualitzar una factura
  const updateInvoice = async (updatedInvoice: Components.Schemas.Invoice) => {
    try {
      await api.putInvoice(
        { id: updatedInvoice.id },
        { invoice: updatedInvoice },
      )
      setInvoicesState((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === updatedInvoice.id ? updatedInvoice : invoice,
        ),
      )
    } catch (error) {
      console.error('Error updating invoice:', error)
    }
  }

  // Eliminar una factura
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

  // Finalitzar una factura
  const finalizeInvoice = async (invoiceId: number) => {
    try {
      const invoice = invoices.find((inv) => inv.id === invoiceId)
      if (!invoice) return
      await api.putInvoice(
        { id: invoiceId },
        { invoice: { ...invoice, finalized: true } },
      )
      setInvoicesState((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, finalized: true } : inv,
        ),
      )
    } catch (error) {
      console.error('Error finalizing invoice:', error)
    }
  }

  // Fetch inicial
  useEffect(() => {
    fetchInvoices()
  }, [])

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
