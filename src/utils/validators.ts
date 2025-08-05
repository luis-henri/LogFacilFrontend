export function isValidCpf(cpf: string | null | undefined): boolean {
  // Retorna falso se o valor for nulo, indefinido ou não for uma string
  if (typeof cpf !== 'string') return false;

  // Remove todos os caracteres que não são dígitos
  const cpfLimpo = cpf.replace(/[^\d]+/g, '');

  // Verifica se o CPF tem 11 dígitos ou se é uma sequência de dígitos repetidos (ex: 111.111.111-11)
  if (cpfLimpo.length !== 11 || !!cpfLimpo.match(/(\d)\1{10}/)) {
    return false;
  }

  // Converte a string em um array de números
  const digits = cpfLimpo.split('').map(el => +el);

  // Função interna para calcular o dígito verificador
  const calcularResto = (count: number): number => {
    // Multiplica os primeiros 'count' dígitos pela sequência decrescente e soma os resultados
    const soma = digits
      .slice(0, count)
      .reduce((soma, el, index) => soma + el * (count + 1 - index), 0);
    
    // Calcula o resto da divisão da soma por 11
    const resto = (soma * 10) % 11;

    // Se o resto for 10 ou 11, o dígito verificador é 0
    return resto < 10 ? resto : 0;
  };

  // O CPF é válido apenas se ambos os dígitos verificadores estiverem corretos
  return calcularResto(9) === digits[9] && calcularResto(10) === digits[10];
}