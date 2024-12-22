import { Components, Paths } from '../api/generated/client'

export const isOverdue = (
  date: string | null,
  deadline: string | null,
): boolean => {
  if (!date || !deadline) return false // Si algun valor és null o buit, retornem false

  const currentDate = new Date() // Data actual
  const deadlineDate = new Date(deadline) // Data de la deadline

  return currentDate > deadlineDate
}

export const formatToEuro = (value: string | number | null): string => {
  const numericValue = Number(value) // Converteix a número
  if (isNaN(numericValue)) return '0,00 €' // Gestiona valors no vàlids
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numericValue)
}

export const calculateAndFormatInvoiceTotal = (
  invoiceLines: Components.Schemas.InvoiceLine[],
): string => {
  const total = invoiceLines.reduce(
    (sum, line) => sum + parseFloat(line.price) * line.quantity,
    0,
  )

  return formatToEuro(total)
}

export const calculateAndFormatInvoiceTaxTotal = (
  invoiceLines: Components.Schemas.InvoiceLine[],
): string => {
  const total = invoiceLines.reduce(
    (sum, line) => sum + parseFloat(line.tax) * line.quantity,
    0,
  )

  return formatToEuro(total)
}

export const mapInvoiceToUpdatePayload = (
  invoice: Paths.GetInvoices.Responses.$200['invoices'][number],
): Components.Schemas.InvoiceUpdatePayload => ({
  id: invoice.id,
  customer_id: invoice.customer_id ?? undefined, // Convertir null a undefined
  finalized: invoice.finalized,
  paid: invoice.paid,
  date: invoice.date,
  deadline: invoice.deadline,
  invoice_lines_attributes: invoice.invoice_lines.map((line) => ({
    id: line.id, // Per actualitzar línies existents
    product_id: line.product_id,
    quantity: line.quantity,
    label: line.label,
    unit: line.unit,
    vat_rate: line.vat_rate,
    price: line.price,
    tax: line.tax,
  })),
})

// export const mapInvoiceToState = (invoice: Invoice): InvoiceState => {
//   const products: SelectedProducts = invoice.invoice_lines.reduce(
//     (obj: SelectedProducts, invoiceLine: Components.Schemas.InvoiceLine) => {
//       if (obj[invoiceLine.label]) {
//         obj[invoiceLine.label] = {
//           product: invoiceLine.product,
//           qty: obj[invoiceLine.label].qty + 1,
//         }
//         return obj
//       }
//       obj[invoiceLine.label] = { product: invoiceLine.product, qty: 1 }
//       return obj
//     },
//     {},
//   )
//   return {
//     id: invoice.id,
//     date: invoice.date,
//     deadline: invoice.deadline,
//     paid: invoice.paid,
//     finalized: invoice.finalized,
//     customer: invoice.customer,
//     products,
//     isEdit: true,
//   }
// }

// export const mapStateToUpdatePayload = (
//   invoice: InvoiceState,
// ): InvoiceUpdatePayload => {
//   const invoiceLineAttributes = Object.values(invoice.products).map(
//     ({ product, qty }) => {
//       return {
//         product_id: product.id,
//         quantity: qty,
//         label: product.label,
//         unit: product.unit,
//         vat_rate: product.vat_rate,
//         price: product.unit_price,
//         tax: product.unit_tax,
//       }
//     },
//   )
//   return {
//     id: invoice.id!,
//     customer_id: invoice.customer!.id,
//     finalized: invoice.finalized,
//     paid: invoice.paid,
//     date: invoice.date,
//     deadline: invoice.deadline,
//     invoice_lines_attributes: invoiceLineAttributes,
//   }
// }

// export const mapStateToCreatePayload = (
//   invoice: InvoiceState,
// ): InvoiceCreatePayload => {
//   const invoiceLineAttributes = Object.values(invoice.products).map(
//     ({ product, qty }) => {
//       console.log('quantity', qty)

//       return {
//         product_id: product.id,
//         quantity: qty,
//         label: product.label,
//         unit: product.unit,
//         vat_rate: product.vat_rate,
//         price: product.unit_price,
//         tax: product.unit_tax,
//       }
//     },
//   )

//   return {
//     customer_id: invoice.customer!.id,
//     finalized: invoice.finalized,
//     paid: invoice.paid,
//     date: invoice.date,
//     deadline: invoice.deadline,
//     invoice_lines_attributes: invoiceLineAttributes,
//   }
// }

// customer_id: invoice.customer_id ?? 0, // Assegurem que no sigui null
// finalized: invoice.finalized,
// paid: invoice.paid,
// date: invoice.date,
// deadline: invoice.deadline,
// invoice_lines_attributes: invoice.invoice_lines.map((line) => ({
//   product_id: line.product_id,
//   label: line.label,
//   quantity: line.quantity,
//   price: parseFloat(line.price),
//   tax: parseFloat(line.tax),
// })),
