import { Components } from '../api/generated/client'

export type InvoiceModalCreateProps = {
  mode: 'create'
  visible: boolean
  invoice: Components.Schemas.InvoiceCreatePayload
  onClose: () => void
  onSave: (invoice: Components.Schemas.InvoiceCreatePayload) => void
  setInvoice: React.Dispatch<
    React.SetStateAction<Components.Schemas.InvoiceCreatePayload>
  >
  title: string
}

export type InvoiceModalEditProps = {
  mode: 'edit'
  visible: boolean
  invoice: Components.Schemas.InvoiceUpdatePayload
  onClose: () => void
  onSave: (invoice: Components.Schemas.InvoiceUpdatePayload) => void
  setInvoice: React.Dispatch<
    React.SetStateAction<Components.Schemas.InvoiceUpdatePayload>
  >
  title: string
}
