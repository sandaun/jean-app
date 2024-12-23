import { Components } from '../api/generated/client'

export const isOverdue = (
  date: string | null,
  deadline: string | null,
): boolean => {
  if (!date || !deadline) {
    return false
  }

  const currentDate = new Date()
  const deadlineDate = new Date(deadline)

  return currentDate > deadlineDate
}

export const formatToEuro = (value: string | number | null): string => {
  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return '0,00 €'
  }
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
