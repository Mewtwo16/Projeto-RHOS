export function formatarCPF(cpf: string): string {
  if (!cpf) return ''
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

export function formatarData(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data
  return date.toLocaleDateString('pt-BR')
}

export function formatarDataHora(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data
  return date.toLocaleString('pt-BR')
}

export function formatarTelefone(telefone: string): string {
  if (!telefone) return ''
  const cleaned = telefone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return telefone
}

export function formatarCEP(cep: string): string {
  if (!cep) return ''
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function truncarTexto(texto: string, tamanho: number): string {
  if (!texto || texto.length <= tamanho) return texto
  return texto.substring(0, tamanho) + '...'
}

export function capitalizarPalavras(texto: string): string {
  if (!texto) return ''
  return texto
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatarDataParaMySQL(dateString: string): string {
  if (!dateString) return '1990-01-01'
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return '1990-01-01'
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}
