import { Components } from '../api/generated/client'

export const getInitialInvoice =
  (): Components.Schemas.InvoiceCreatePayload => ({
    customer_id: 0,
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    paid: false,
    finalized: false,
    invoice_lines_attributes: [],
  })

export const INITIAL_INVOICE_LINE: Components.Schemas.InvoiceLineCreatePayload =
  {
    product_id: 0,
    label: '',
    quantity: 1,
    unit: undefined,
    vat_rate: undefined,
    price: '',
    tax: '',
  }
