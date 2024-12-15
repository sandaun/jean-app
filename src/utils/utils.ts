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
