import { Components } from '../api/generated/client'

export const getInitialInvoice =
  (): Components.Schemas.InvoiceCreatePayload => ({
    customer_id: 0,
    date: new Date().toISOString().split('T')[0],
    deadline: new Date().toISOString().split('T')[0],
    paid: false,
    finalized: false,
    invoice_lines_attributes: [],
  })

export const getInitialUpdateInvoice =
  (): Components.Schemas.InvoiceUpdatePayload => ({
    id: 0,
    customer_id: 0,
    date: new Date().toISOString().split('T')[0],
    deadline: new Date().toISOString().split('T')[0],
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

export const INITIAL_INVOICE_LINE_UPDATE: Components.Schemas.InvoiceLineUpdatePayload =
  {
    id: 0,
    product_id: 0,
    label: '',
    quantity: 1,
    unit: undefined,
    vat_rate: undefined,
    price: '',
    tax: '',
  }
