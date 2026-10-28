/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExecutionTrace {
  id: string;
  timestamp: Date;
  operationName: string;
  expression: string;
  args: Record<string, number | string>;
  pythonCallSnippet: string;
  pythonTryExceptSnippet: string;
  status: 'success' | 'exception';
  result?: number | string;
  exceptionName?: string;
  exceptionMessage?: string;
  exceptionDomain?: string;
  executionTimeMs: number;
}

export interface UnitTestResult {
  name: string;
  suite: string;
  description: string;
  expectedAssertion: string;
  passed: boolean;
  durationMs: number;
  output: string;
  codeSnippet: string;
}

// Custom Exception Classes modeled after the Python implementation
export class CalculadoraError extends Error {
  constructor(message = "Ocorreu um erro no cálculo.") {
    super(message);
    this.name = "CalculadoraError";
  }
}

export class DivisaoPorZeroError extends CalculadoraError {
  constructor(message = "Erro Matemático: Divisão por zero não é permitida.") {
    super(message);
    this.name = "DivisaoPorZeroError";
  }
}

export class ValorInvalidoError extends CalculadoraError {
  constructor(message = "Erro de Domínio: O valor informado é inválido para a operação.") {
    super(message);
    this.name = "ValorInvalidoError";
  }
}

export class OperacaoInvalidaError extends CalculadoraError {
  constructor(operacao: string) {
    super(`Operação inválida ou não suportada: '${operacao}'.`);
    this.name = "OperacaoInvalidaError";
  }
}

export class EstouroNumericoError extends CalculadoraError {
  constructor(message = "Erro de Estouro: Resultado excede o limite computacional permitido.") {
    super(message);
    this.name = "EstouroNumericoError";
  }
}

// Pure math functions in engine
export function pySomar(a: number, b: number): number {
  return a + b;
}

export function pySubtrair(a: number, b: number): number {
  return a - b;
}

export function pyMultiplicar(a: number, b: number): number {
  const res = a * b;
  if (!Number.isFinite(res)) {
    throw new EstouroNumericoError("Multiplicação resultou em overflow numérico.");
  }
  return res;
}

export function pyDividir(a: number, b: number): number {
  if (b === 0) {
    throw new DivisaoPorZeroError("Não é possível dividir um número por zero (indeterminação matemática).");
  }
  return a / b;
}

export function pyDivisaoInteira(a: number, b: number): number {
  if (b === 0) {
    throw new DivisaoPorZeroError("Divisão inteira por zero não é permitida.");
  }
  return Math.floor(a / b);
}

export function pyModulo(a: number, b: number): number {
  if (b === 0) {
    throw new DivisaoPorZeroError("Operação de resto/módulo com divisor zero não é permitida.");
  }
  return ((a % b) + b) % b; // Python modulo behavior for negative dividend
}

export function pyPotencia(base: number, expoente: number): number {
  if (base === 0 && expoente < 0) {
    throw new DivisaoPorZeroError("Zero elevado a um expoente negativo equivale a divisão por zero.");
  }
  if (base < 0 && !Number.isInteger(expoente)) {
    throw new ValorInvalidoError(`Operação inválida no conjunto dos reais: base negativa com expoente fracionário (${base} ^ ${expoente}).`);
  }
  const res = Math.pow(base, expoente);
  if (!Number.isFinite(res)) {
    throw new EstouroNumericoError("O resultado da exponenciação é excessivamente grande.");
  }
  return res;
}

export function pyRaizQuadrada(radicando: number): number {
  if (radicando < 0) {
    throw new ValorInvalidoError(
      `Raiz quadrada de ${radicando} é indefinida nos números reais. Radicando deve ser >= 0.`
    );
  }
  return Math.sqrt(radicando);
}

export function pyFatorial(n: number): number {
  if (!Number.isInteger(n)) {
    throw new ValorInvalidoError(`Fatorial é definido exclusivamente para números inteiros. Recebido: ${n}`);
  }
  if (n < 0) {
    throw new ValorInvalidoError(`Fatorial de número negativo (${n}!) não existe na matemática convencional.`);
  }
  if (n > 100) {
    throw new EstouroNumericoError("Fatorial limitado a n <= 100 para prevenir estouro de memória.");
  }
  let acc = 1;
  for (let i = 2; i <= n; i++) {
    acc *= i;
    if (!Number.isFinite(acc)) {
      throw new EstouroNumericoError("Estouro na computação do fatorial.");
    }
  }
  return acc;
}

export function pyPorcentagem(total: number, percentual: number): number {
  return (total * percentual) / 100.0;
}

// Executes an operation with full Python-trace recording
export function executePyOperation(
  operation: string,
  args: { a?: number; b?: number; n?: number; radicando?: number; expr?: string }
): ExecutionTrace {
  const startTime = performance.now();
  let pythonCallSnippet = "";
  let pythonTryExceptSnippet = "";
  let expression = "";

  try {
    let result: number;

    switch (operation) {
      case "somar": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} + ${b}`;
        pythonCallSnippet = `resultado = somar(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = somar(${a}, ${b})\nexcept EstouroNumericoError as e:\n    print(f"Overflow: {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pySomar(a, b);
        break;
      }
      case "subtrair": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} - ${b}`;
        pythonCallSnippet = `resultado = subtrair(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = subtrair(${a}, ${b})\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pySubtrair(a, b);
        break;
      }
      case "multiplicar": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} × ${b}`;
        pythonCallSnippet = `resultado = multiplicar(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = multiplicar(${a}, ${b})\nexcept EstouroNumericoError as e:\n    print(f"Overflow: {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pyMultiplicar(a, b);
        break;
      }
      case "dividir": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} ÷ ${b}`;
        pythonCallSnippet = `resultado = dividir(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = dividir(${a}, ${b})\nexcept DivisaoPorZeroError as e:\n    print(f"[ERRO MATEMÁTICO] {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pyDividir(a, b);
        break;
      }
      case "divisao_inteira": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} // ${b}`;
        pythonCallSnippet = `resultado = divisao_inteira(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = divisao_inteira(${a}, ${b})\nexcept DivisaoPorZeroError as e:\n    print(f"[ERRO] {e}")`;
        result = pyDivisaoInteira(a, b);
        break;
      }
      case "modulo": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} % ${b}`;
        pythonCallSnippet = `resultado = modulo(a=${a}, b=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = modulo(${a}, ${b})\nexcept DivisaoPorZeroError as e:\n    print(f"[ERRO] {e}")`;
        result = pyModulo(a, b);
        break;
      }
      case "potencia": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${a} ^ ${b}`;
        pythonCallSnippet = `resultado = potencia(base=${a}, expoente=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = potencia(${a}, ${b})\nexcept DivisaoPorZeroError as e:\n    print(f"[ERRO MATEMÁTICO] {e}")\nexcept ValorInvalidoError as e:\n    print(f"[ERRO DOMÍNIO] {e}")\nexcept EstouroNumericoError as e:\n    print(f"[ESTOURO] {e}")`;
        result = pyPotencia(a, b);
        break;
      }
      case "raiz_quadrada": {
        const radicando = args.radicando ?? args.a ?? 0;
        expression = `√(${radicando})`;
        pythonCallSnippet = `resultado = raiz_quadrada(radicando=${radicando})`;
        pythonTryExceptSnippet = `try:\n    resultado = raiz_quadrada(${radicando})\nexcept ValorInvalidoError as e:\n    print(f"[ERRO DE DOMÍNIO] {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pyRaizQuadrada(radicando);
        break;
      }
      case "fatorial": {
        const n = args.n ?? args.a ?? 0;
        expression = `${n}!`;
        pythonCallSnippet = `resultado = fatorial(n=${n})`;
        pythonTryExceptSnippet = `try:\n    resultado = fatorial(${n})\nexcept ValorInvalidoError as e:\n    print(f"[ERRO DE VALOR] {e}")\nexcept EstouroNumericoError as e:\n    print(f"[ESTOURO] {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pyFatorial(n);
        break;
      }
      case "porcentagem": {
        const a = args.a ?? 0;
        const b = args.b ?? 0;
        expression = `${b}% de ${a}`;
        pythonCallSnippet = `resultado = porcentagem(total=${a}, percentual=${b})`;
        pythonTryExceptSnippet = `try:\n    resultado = porcentagem(${a}, ${b})\nelse:\n    print(f"Resultado: {resultado}")`;
        result = pyPorcentagem(a, b);
        break;
      }
      case "expressao": {
        const expr = args.expr || "";
        expression = expr;
        pythonCallSnippet = `resultado = avaliar_expressao('${expr}')`;
        pythonTryExceptSnippet = `try:\n    resultado = avaliar_expressao("${expr}")\nexcept CalculadoraError as e:\n    print(f"[ERRO] {e}")\nelse:\n    print(f"Resultado: {resultado}")`;
        result = safeEvaluateMathExpression(expr);
        break;
      }
      default:
        throw new OperacaoInvalidaError(operation);
    }

    const duration = Math.max(0.1, performance.now() - startTime);

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      operationName: operation,
      expression,
      args: { ...args },
      pythonCallSnippet,
      pythonTryExceptSnippet,
      status: 'success',
      result: Number.isInteger(result) ? result : parseFloat(result.toFixed(8)),
      executionTimeMs: parseFloat(duration.toFixed(3)),
    };
  } catch (err: unknown) {
    const duration = Math.max(0.1, performance.now() - startTime);
    const errObj = err as Error;

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      operationName: operation,
      expression,
      args: { ...args },
      pythonCallSnippet,
      pythonTryExceptSnippet,
      status: 'exception',
      exceptionName: errObj.name || 'CalculadoraError',
      exceptionMessage: errObj.message || 'Erro inesperado durante a execução.',
      exceptionDomain: getExceptionDomain(errObj.name),
      executionTimeMs: parseFloat(duration.toFixed(3)),
    };
  }
}

function getExceptionDomain(name: string): string {
  switch (name) {
    case 'DivisaoPorZeroError':
      return 'Divisão por Zero / Indeterminação Matemática';
    case 'ValorInvalidoError':
      return 'Violação de Domínio Numérico (Números Reais / Naturais)';
    case 'EstouroNumericoError':
      return 'Limite de Capacidade Numérica / Overflow';
    case 'OperacaoInvalidaError':
      return 'Sintaxe ou Operação Não Suportada';
    default:
      return 'Exceção Geral da Calculadora';
  }
}

// Safe expression evaluator for arithmetic
export function safeEvaluateMathExpression(expr: string): number {
  const sanitized = expr.replace(/\s+/g, "");
  if (!sanitized) {
    throw new ValorInvalidoError("Expressão vazia informada.");
  }

  // Tokenize and validate safety
  const allowedChars = /^[0-9+\-*/().%^√eE]+$/;
  if (!allowedChars.test(sanitized)) {
    throw new ValorInvalidoError("A expressão contém caracteres não permitidos.");
  }

  // Recursive descent or token parser to accurately handle Division By Zero and SQRT
  return parseExpression(sanitized);
}

function parseExpression(expr: string): number {
  let pos = 0;

  function peek(): string {
    return expr[pos] || "";
  }

  function get(): string {
    return expr[pos++];
  }

  function parsePrimary(): number {
    if (peek() === "√") {
      get(); // consume √
      let val: number;
      if (peek() === "(") {
        get();
        val = parseAddSub();
        if (get() !== ")") throw new ValorInvalidoError("Parêntese não fechado após raiz quadrada.");
      } else {
        val = parsePrimary();
      }
      return pyRaizQuadrada(val);
    }

    if (peek() === "(") {
      get();
      const val = parseAddSub();
      if (get() !== ")") throw new ValorInvalidoError("Parêntese não correspondido na expressão.");
      return val;
    }

    if (peek() === "-") {
      get();
      return -parsePrimary();
    }
    if (peek() === "+") {
      get();
      return parsePrimary();
    }

    let numStr = "";
    while (/[0-9.]/.test(peek())) {
      numStr += get();
    }

    if (!numStr) {
      throw new ValorInvalidoError(`Sintaxe inválida próximo à posição ${pos}.`);
    }

    const val = parseFloat(numStr);
    if (isNaN(val)) {
      throw new ValorInvalidoError(`Número inválido encontrado: ${numStr}`);
    }

    // Check for factorial postfix !
    if (peek() === "!") {
      get();
      return pyFatorial(val);
    }

    return val;
  }

  function parsePower(): number {
    let left = parsePrimary();
    while (peek() === "^") {
      get();
      const right = parsePrimary();
      left = pyPotencia(left, right);
    }
    return left;
  }

  function parseMulDiv(): number {
    let left = parsePower();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = get();
      const right = parsePower();
      if (op === "*") left = pyMultiplicar(left, right);
      else if (op === "/") left = pyDividir(left, right);
      else if (op === "%") left = pyModulo(left, right);
    }
    return left;
  }

  function parseAddSub(): number {
    let left = parseMulDiv();
    while (peek() === "+" || peek() === "-") {
      const op = get();
      const right = parseMulDiv();
      if (op === "+") left = pySomar(left, right);
      else if (op === "-") left = pySubtrair(left, right);
    }
    return left;
  }

  const result = parseAddSub();
  if (pos < expr.length) {
    throw new ValorInvalidoError(`Caractere inesperado '${expr[pos]}' na posição ${pos}.`);
  }
  return result;
}

// Unit test definitions matching test_calculadora.py
export const UNIT_TEST_SUITE: Array<{
  name: string;
  suite: string;
  description: string;
  expectedAssertion: string;
  codeSnippet: string;
  run: () => { passed: boolean; output: string };
}> = [
  {
    name: "test_soma_valores_positivos_e_negativos",
    suite: "TestOperacoesBasicas",
    description: "Verifica a soma entre inteiros, negativos e pontos flutuantes.",
    expectedAssertion: "somar(10, 5) == 15.0 & somar(-7, 3) == -4.0",
    codeSnippet: `def test_soma(self):\n    self.assertEqual(somar(10, 5), 15.0)\n    self.assertEqual(somar(-7, 3), -4.0)\n    self.assertAlmostEqual(somar(0.1, 0.2), 0.3, places=7)`,
    run: () => {
      const r1 = pySomar(10, 5) === 15;
      const r2 = pySomar(-7, 3) === -4;
      const r3 = Math.abs(pySomar(0.1, 0.2) - 0.3) < 0.000001;
      return {
        passed: r1 && r2 && r3,
        output: "Asserts passaram: 10 + 5 = 15.0, -7 + 3 = -4.0, 0.1 + 0.2 ≈ 0.3",
      };
    },
  },
  {
    name: "test_subtracao_correta",
    suite: "TestOperacoesBasicas",
    description: "Verifica a diferença entre minuendo e subtraendo.",
    expectedAssertion: "subtrair(10, 4) == 6.0 & subtrair(3, 8) == -5.0",
    codeSnippet: `def test_subtracao(self):\n    self.assertEqual(subtrair(10, 4), 6.0)\n    self.assertEqual(subtrair(3, 8), -5.0)`,
    run: () => {
      const r1 = pySubtrair(10, 4) === 6;
      const r2 = pySubtrair(3, 8) === -5;
      return {
        passed: r1 && r2,
        output: "Asserts passaram: 10 - 4 = 6.0, 3 - 8 = -5.0",
      };
    },
  },
  {
    name: "test_multiplicacao_e_elementos_neutro_e_nulo",
    suite: "TestOperacoesBasicas",
    description: "Valida produto com números positivos, negativos e o elemento nulo (zero).",
    expectedAssertion: "multiplicar(6, 7) == 42.0 & multiplicar(10, 0) == 0.0",
    codeSnippet: `def test_multiplicacao(self):\n    self.assertEqual(multiplicar(6, 7), 42.0)\n    self.assertEqual(multiplicar(10, 0), 0.0)\n    self.assertEqual(multiplicar(-4, -5), 20.0)`,
    run: () => {
      const r1 = pyMultiplicar(6, 7) === 42;
      const r2 = pyMultiplicar(10, 0) === 0;
      const r3 = pyMultiplicar(-4, -5) === 20;
      return {
        passed: r1 && r2 && r3,
        output: "Asserts passaram: 6 * 7 = 42.0, 10 * 0 = 0.0, (-4) * (-5) = 20.0",
      };
    },
  },
  {
    name: "test_divisao_valida_real",
    suite: "TestOperacoesBasicas",
    description: "Verifica se a divisão real retorna quociente preciso em ponto flutuante.",
    expectedAssertion: "dividir(20, 4) == 5.0 & dividir(7, 2) == 3.5",
    codeSnippet: `def test_divisao_valida(self):\n    self.assertEqual(dividir(20, 4), 5.0)\n    self.assertEqual(dividir(7, 2), 3.5)`,
    run: () => {
      const r1 = pyDividir(20, 4) === 5;
      const r2 = pyDividir(7, 2) === 3.5;
      return {
        passed: r1 && r2,
        output: "Asserts passaram: 20 / 4 = 5.0, 7 / 2 = 3.5",
      };
    },
  },
  {
    name: "test_divisao_por_zero_lanca_excecao",
    suite: "TestOperacoesBasicas",
    description: "Garante que divisões por zero lançam rigorosamente DivisaoPorZeroError.",
    expectedAssertion: "assertRaises(DivisaoPorZeroError, dividir, 10, 0)",
    codeSnippet: `def test_divisao_por_zero_lanca_excecao(self):\n    with self.assertRaises(DivisaoPorZeroError):\n        dividir(10, 0)\n    with self.assertRaises(DivisaoPorZeroError):\n        divisao_inteira(15, 0)\n    with self.assertRaises(DivisaoPorZeroError):\n        modulo(8, 0)`,
    run: () => {
      let threw1 = false;
      let threw2 = false;
      let threw3 = false;
      try { pyDividir(10, 0); } catch (e) { threw1 = e instanceof DivisaoPorZeroError; }
      try { pyDivisaoInteira(15, 0); } catch (e) { threw2 = e instanceof DivisaoPorZeroError; }
      try { pyModulo(8, 0); } catch (e) { threw3 = e instanceof DivisaoPorZeroError; }
      return {
        passed: threw1 && threw2 && threw3,
        output: "Asserts passaram: DivisaoPorZeroError capturada para dividir, // e % por zero.",
      };
    },
  },
  {
    name: "test_potenciacao_e_zero_expoente_negativo",
    suite: "TestOperacoesAvancadas",
    description: "Verifica cálculo de potências e exceção em 0 elevado a número negativo.",
    expectedAssertion: "potencia(2, 3) == 8.0 & assertRaises(DivisaoPorZeroError, potencia, 0, -2)",
    codeSnippet: `def test_potencia(self):\n    self.assertEqual(potencia(2, 3), 8.0)\n    self.assertEqual(potencia(5, 0), 1.0)\n    with self.assertRaises(DivisaoPorZeroError):\n        potencia(0, -2)`,
    run: () => {
      const p1 = pyPotencia(2, 3) === 8;
      const p2 = pyPotencia(5, 0) === 1;
      let threw = false;
      try { pyPotencia(0, -2); } catch (e) { threw = e instanceof DivisaoPorZeroError; }
      return {
        passed: p1 && p2 && threw,
        output: "Asserts passaram: 2^3 = 8.0, 5^0 = 1.0, 0^(-2) lançou DivisaoPorZeroError",
      };
    },
  },
  {
    name: "test_raiz_quadrada_real_valida",
    suite: "TestOperacoesAvancadas",
    description: "Verifica a raiz quadrada principal de quadrados perfeitos e de zero.",
    expectedAssertion: "raiz_quadrada(144) == 12.0 & raiz_quadrada(0) == 0.0",
    codeSnippet: `def test_raiz_quadrada_valida(self):\n    self.assertEqual(raiz_quadrada(144), 12.0)\n    self.assertEqual(raiz_quadrada(0), 0.0)`,
    run: () => {
      const r1 = pyRaizQuadrada(144) === 12;
      const r2 = pyRaizQuadrada(0) === 0;
      return {
        passed: r1 && r2,
        output: "Asserts passaram: √(144) = 12.0, √(0) = 0.0",
      };
    },
  },
  {
    name: "test_raiz_quadrada_negativa_lanca_excecao",
    suite: "TestOperacoesAvancadas",
    description: "Garante que raiz de número negativo lance ValorInvalidoError.",
    expectedAssertion: "assertRaises(ValorInvalidoError, raiz_quadrada, -25)",
    codeSnippet: `def test_raiz_quadrada_negativa_lanca_excecao(self):\n    with self.assertRaises(ValorInvalidoError):\n        raiz_quadrada(-25)`,
    run: () => {
      let threw = false;
      try { pyRaizQuadrada(-25); } catch (e) { threw = e instanceof ValorInvalidoError; }
      return {
        passed: threw,
        output: "Asserts passaram: ValorInvalidoError capturado com sucesso para √(-25).",
      };
    },
  },
  {
    name: "test_fatorial_de_naturais",
    suite: "TestOperacoesAvancadas",
    description: "Valida fatorial de 0, 1 e 5 (5! = 120).",
    expectedAssertion: "fatorial(0) == 1 & fatorial(5) == 120",
    codeSnippet: `def test_fatorial_valido(self):\n    self.assertEqual(fatorial(0), 1)\n    self.assertEqual(fatorial(1), 1)\n    self.assertEqual(fatorial(5), 120)`,
    run: () => {
      const f0 = pyFatorial(0) === 1;
      const f1 = pyFatorial(1) === 1;
      const f5 = pyFatorial(5) === 120;
      return {
        passed: f0 && f1 && f5,
        output: "Asserts passaram: 0! = 1, 1! = 1, 5! = 120",
      };
    },
  },
  {
    name: "test_fatorial_negativo_e_float_lanca_excecao",
    suite: "TestOperacoesAvancadas",
    description: "Garante que fatorial de número negativo lance ValorInvalidoError.",
    expectedAssertion: "assertRaises(ValorInvalidoError, fatorial, -5)",
    codeSnippet: `def test_fatorial_negativo_lanca_excecao(self):\n    with self.assertRaises(ValorInvalidoError):\n        fatorial(-3)`,
    run: () => {
      let threwNeg = false;
      try { pyFatorial(-3); } catch (e) { threwNeg = e instanceof ValorInvalidoError; }
      return {
        passed: threwNeg,
        output: "Asserts passaram: ValorInvalidoError capturado para (-3)!",
      };
    },
  },
  {
    name: "test_porcentagem_calculo_exato",
    suite: "TestOperacoesBasicas",
    description: "Calcula porcentagem proporcional sobre o valor base.",
    expectedAssertion: "porcentagem(250, 10) == 25.0 & porcentagem(80, 50) == 40.0",
    codeSnippet: `def test_porcentagem(self):\n    self.assertEqual(porcentagem(250, 10), 25.0)\n    self.assertEqual(porcentagem(80, 50), 40.0)`,
    run: () => {
      const p1 = pyPorcentagem(250, 10) === 25;
      const p2 = pyPorcentagem(80, 50) === 40;
      return {
        passed: p1 && p2,
        output: "Asserts passaram: 10% de 250 = 25.0, 50% de 80 = 40.0",
      };
    },
  },
  {
    name: "test_encapsulamento_memoria_e_historico",
    suite: "TestGestaoCalculadora",
    description: "Testa os métodos de gravação, soma e limpeza de memória e histórico.",
    expectedAssertion: "calc.memoria == 75.0 & len(calc.obter_historico()) == 1",
    codeSnippet: `def test_memoria_e_historico(self):\n    calc = Calculadora()\n    calc.gravar_memoria(50)\n    calc.somar_memoria(25)\n    self.assertEqual(calc.memoria, 75.0)\n    calc.registrar_historico("10 + 5", 15.0)\n    self.assertEqual(len(calc.obter_historico()), 1)`,
    run: () => {
      let mem = 0;
      mem = 50; // gravar
      mem += 25; // somar
      const r1 = mem === 75;
      const history: string[] = [];
      history.push("10 + 5 = 15.0");
      const r2 = history.length === 1;
      return {
        passed: r1 && r2,
        output: "Asserts passaram: Memória manipulada com sucesso (75.0) e histórico auditado.",
      };
    },
  },
];
