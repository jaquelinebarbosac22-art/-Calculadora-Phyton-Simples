/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CALCULADORA_PY = `"""
Módulo Calculadora - Implementação com Boas Práticas e Tratamento de Exceções.

Este módulo implementa uma calculadora completa em Python 3, seguindo princípios
de código limpo (Clean Code), tipagem estática (PEP 484), documentação no padrão
PEP 257 e um sistema robusto de exceções personalizadas para lidar defensivamente
com erros matemáticos e de entrada do usuário.

Autor: Engenharia de Software
Versão: 2.0.0
"""

from typing import Union, Tuple, Optional, List
import math
import sys


# ============================================================================
# HIERARQUIA DE EXCEÇÕES PERSONALIZADAS
# ============================================================================

class CalculadoraError(Exception):
    """
    Classe base para todas as exceções lançadas pela calculadora.
    Permite capturar genericamente qualquer erro originado deste módulo.
    """
    def __init__(self, mensagem: str = "Ocorreu um erro no cálculo.") -> None:
        self.mensagem = mensagem
        super().__init__(self.mensagem)


class DivisaoPorZeroError(CalculadoraError):
    """Lançada quando ocorre uma tentativa de divisão ou módulo por zero."""
    def __init__(self, mensagem: str = "Erro Matemático: Divisão por zero não é permitida.") -> None:
        super().__init__(mensagem)


class ValorInvalidoError(CalculadoraError):
    """
    Lançada quando um valor numérico viola regras do domínio matemático
    (ex.: raiz quadrada de número negativo nos reais, fatorial negativo).
    """
    def __init__(self, mensagem: str = "Erro de Domínio: O valor informado é inválido para a operação.") -> None:
        super().__init__(mensagem)


class OperacaoInvalidaError(CalculadoraError):
    """Lançada quando a operação solicitada não é reconhecida pela calculadora."""
    def __init__(self, operacao: str) -> None:
        mensagem = f"Operação inválida ou não suportada: '{operacao}'."
        super().__init__(mensagem)


class EstouroNumericoError(CalculadoraError):
    """Lançada quando o cálculo ultrapassa os limites computacionais do hardware."""
    def __init__(self, mensagem: str = "Erro de Estouro: Resultado excede o limite computacional permitido.") -> None:
        super().__init__(mensagem)


# ============================================================================
# FUNÇÕES ARITMÉTICAS PURAS (RESPONSABILIDADE ÚNICA)
# ============================================================================

Numero = Union[int, float]


def somar(a: Numero, b: Numero) -> float:
    """
    Retorna a soma de dois números reais.

    Args:
        a: O primeiro número (parcela).
        b: O segundo número (parcela).

    Returns:
        float: Resultado da adição de a com b.

    Exemplo:
        >>> somar(4.5, 2.5)
        7.0
    """
    return float(a + b)


def subtrair(a: Numero, b: Numero) -> float:
    """
    Retorna a subtração entre dois números (minuendo menos subtraendo).

    Args:
        a: Minuendo.
        b: Subtraendo.

    Returns:
        float: Diferença calculada.

    Exemplo:
        >>> subtrair(10, 4)
        6.0
    """
    return float(a - b)


def multiplicar(a: Numero, b: Numero) -> float:
    """
    Retorna o produto de dois números.

    Args:
        a: Primeiro fator.
        b: Segundo fator.

    Returns:
        float: Produto calculado.

    Raises:
        EstouroNumericoError: Se o produto exceder os limites de ponto flutuante.
    """
    try:
        resultado = a * b
        if math.isinf(resultado):
            raise OverflowError()
        return float(resultado)
    except OverflowError as exc:
        raise EstouroNumericoError("Multiplicação resultou em overflow numérico.") from exc


def dividir(a: Numero, b: Numero) -> float:
    """
    Retorna a divisão real entre dividendo e divisor.

    Args:
        a: Dividendo.
        b: Divisor (não pode ser zero).

    Returns:
        float: Quociente da divisão.

    Raises:
        DivisaoPorZeroError: Se o divisor (b) for igual a zero.
    """
    if b == 0:
        raise DivisaoPorZeroError("Não é possível dividir um número por zero (indeterminação matemática).")
    return float(a / b)


def divisao_inteira(a: Numero, b: Numero) -> int:
    """
    Retorna o quociente inteiro da divisão.

    Args:
        a: Dividendo.
        b: Divisor.

    Returns:
        int: Quociente inteiro.

    Raises:
        DivisaoPorZeroError: Se b for igual a zero.
    """
    if b == 0:
        raise DivisaoPorZeroError("Divisão inteira por zero não é permitida.")
    return int(a // b)


def modulo(a: Numero, b: Numero) -> float:
    """
    Retorna o resto da divisão (módulo) de a por b.

    Args:
        a: Dividendo.
        b: Divisor.

    Returns:
        float: Resto da divisão.

    Raises:
        DivisaoPorZeroError: Se b for igual a zero.
    """
    if b == 0:
        raise DivisaoPorZeroError("Operação de resto/módulo com divisor zero não é permitida.")
    return float(a % b)


def potencia(base: Numero, expoente: Numero) -> float:
    """
    Eleva a base ao expoente fornecido.

    Args:
        base: Base da potência.
        expoente: Expoente da potência.

    Returns:
        float: Resultado da potenciação.

    Raises:
        DivisaoPorZeroError: Se base for 0 e expoente for negativo.
        ValorInvalidoError: Se base for negativa com expoente fracionário.
        EstouroNumericoError: Se o cálculo estourar a capacidade de float.
    """
    if base == 0 and expoente < 0:
        raise DivisaoPorZeroError("Zero elevado a um expoente negativo equivale a divisão por zero.")

    try:
        resultado = math.pow(base, expoente)
        return float(resultado)
    except ValueError as exc:
        raise ValorInvalidoError(f"Operação inválida no conjunto dos reais: {base} ^ {expoente}") from exc
    except OverflowError as exc:
        raise EstouroNumericoError("O resultado da exponenciação é excessivamente grande.") from exc


def raiz_quadrada(radicando: Numero) -> float:
    """
    Calcula a raiz quadrada principal no conjunto dos números reais.

    Args:
        radicando: Valor não negativo do qual se deseja extrair a raiz.

    Returns:
        float: Raiz quadrada calculada.

    Raises:
        ValorInvalidoError: Se radicando for negativo (não possui raiz real).
    """
    if radicando < 0:
        raise ValorInvalidoError(
            f"Raiz quadrada de {radicando} é indefinida nos números reais. Radicando deve ser >= 0."
        )
    return float(math.sqrt(radicando))


def fatorial(n: int) -> int:
    """
    Calcula o fatorial de um número natural n (n!).

    Args:
        n: Número inteiro não negativo (máximo 100 para segurança de memória).

    Returns:
        int: O fatorial calculado.

    Raises:
        ValorInvalidoError: Se n for negativo ou não for inteiro.
        EstouroNumericoError: Se n ultrapassar 100 para evitar congelamento.
    """
    if not isinstance(n, int):
        # Tenta verificar se é um float equivalente a inteiro (ex: 5.0)
        if isinstance(n, (float,)) and n.is_integer():
            n = int(n)
        else:
            raise ValorInvalidoError(f"Fatorial é definido exclusivamente para números inteiros. Recebido: {n}")

    if n < 0:
        raise ValorInvalidoError(f"Fatorial de número negativo ({n}!) não existe na matemática convencional.")

    if n > 100:
        raise EstouroNumericoError("Fatorial limitado a n <= 100 para prevenir estouro de memória.")

    return math.factorial(n)


def porcentagem(total: Numero, percentual: Numero) -> float:
    """
    Calcula uma porcentagem sobre um valor total.

    Args:
        total: Valor base (100%).
        percentual: Taxa percentual a aplicar.

    Returns:
        float: Valor correspondente à porcentagem.

    Exemplo:
        >>> porcentagem(200, 15)
        30.0
    """
    return float((total * percentual) / 100.0)


# ============================================================================
# CLASSE DE GESTÃO E HISTÓRICO
# ============================================================================

class Calculadora:
    """
    Gerenciador da calculadora com memória e histórico auditável de operações.
    Aplica encapsulamento para garantir que dados internos não sejam corrompidos.
    """

    def __init__(self) -> None:
        self._historico: List[str] = []
        self._memoria: float = 0.0

    @property
    def memoria(self) -> float:
        """Retorna o valor atualmente gravado na memória."""
        return self._memoria

    def gravar_memoria(self, valor: Numero) -> None:
        """Salva um valor na memória."""
        self._memoria = float(valor)

    def somar_memoria(self, valor: Numero) -> None:
        """Adiciona um valor ao montante da memória."""
        self._memoria += float(valor)

    def limpar_memoria(self) -> None:
        """Zera o valor armazenado na memória."""
        self._memoria = 0.0

    def registrar_historico(self, expressao: str, resultado: Union[Numero, str]) -> None:
        """Adiciona uma entrada ao histórico de execuções."""
        registro = f"{expressao} = {resultado}"
        self._historico.append(registro)

    def obter_historico(self) -> List[str]:
        """Retorna uma cópia da lista de histórico para preservar o encapsulamento."""
        return list(self._historico)

    def limpar_historico(self) -> None:
        """Limpa todo o histórico de cálculos."""
        self._historico.clear()


# ============================================================================
# FUNÇÕES DE INTERFACE COM O USUÁRIO (ENTRADA & VALIDAÇÃO DEFENSIVA)
# ============================================================================

def obter_numero(mensagem: str) -> float:
    """
    Lê uma entrada do usuário e garante a conversão para ponto flutuante.
    Trata exceções de ValueError repetindo a solicitação até obter um valor válido.

    Args:
        mensagem: Texto de instrução para o usuário.

    Returns:
        float: Número válido digitado pelo usuário.
    """
    while True:
        try:
            entrada = input(mensagem).strip().replace(",", ".")
            if not entrada:
                print("  [!] Entrada vazia. Por favor, digite um valor numérico.")
                continue
            return float(entrada)
        except ValueError:
            print("  [!] Valor inválido! Digite apenas números válidos (ex.: 10, -3.5, 0.25).")
        except (KeyboardInterrupt, EOFError):
            print("\\nOperação cancelada pelo usuário.")
            raise


def obter_inteiro(mensagem: str) -> int:
    """
    Lê uma entrada do usuário e garante a conversão para número inteiro.

    Args:
        mensagem: Texto exibido no prompt.

    Returns:
        int: Inteiro digitado pelo usuário.
    """
    while True:
        try:
            entrada = input(mensagem).strip()
            return int(entrada)
        except ValueError:
            print("  [!] Valor inválido! Digite um número inteiro (ex.: 5, 0, 12).")
        except (KeyboardInterrupt, EOFError):
            print("\\nOperação cancelada pelo usuário.")
            raise


def exibir_menu() -> None:
    """Exibe o menu de opções formatado e intuitivo."""
    print("\\n" + "=" * 54)
    print("           CALCULADORA MODULAR PYTHON 3")
    print("=" * 54)
    print(" 1. Adição (+)                 7. Potenciação (^)")
    print(" 2. Subtração (-)              8. Raiz Quadrada (√)")
    print(" 3. Multiplicação (*)          9. Fatorial (!)")
    print(" 4. Divisão Real (/)          10. Porcentagem (%)")
    print(" 5. Divisão Inteira (//)      11. Ver Histórico")
    print(" 6. Resto da Divisão (%)      12. Memória (M+/MR/MC)")
    print(" 0. Sair do Programa")
    print("=" * 54)


def executar_fluxo(calc: Calculadora, opcao: str) -> bool:
    """
    Roteia a opção selecionada para a função matemática correspondente,
    aplicando a estrutura defensiva try...except...else...finally.

    Args:
        calc: Instância ativa da Calculadora.
        opcao: Código da operação selecionada.

    Returns:
        bool: False se o usuário solicitou sair, True para continuar.
    """
    if opcao == "0":
        print("\\nObrigado por utilizar a Calculadora Python! Até logo.")
        return False

    if opcao == "11":
        historico = calc.obter_historico()
        if not historico:
            print("\\n[Histórico vazio] Nenhum cálculo foi realizado ainda.")
        else:
            print("\\n--- Histórico de Cálculos ---")
            for idx, item in enumerate(historico, start=1):
                print(f" {idx:02d}. {item}")
        return True

    if opcao == "12":
        print(f"\\nValor atual na memória: {calc.memoria}")
        sub_op = input("Deseja (1) Zerar, (2) Somar novo valor ou (3) Manter? [1/2/3]: ").strip()
        if sub_op == "1":
            calc.limpar_memoria()
            print("Memória zerada com sucesso.")
        elif sub_op == "2":
            val = obter_numero("Digite o valor para adicionar à memória: ")
            calc.somar_memoria(val)
            print(f"Novo valor em memória: {calc.memoria}")
        return True

    # Bloco defensivo principal com tratamento detalhado de exceções
    try:
        expressao_str = ""
        resultado: Union[float, int] = 0.0

        if opcao in {"1", "2", "3", "4", "5", "6", "7", "10"}:
            num1 = obter_numero("Digite o primeiro número: ")
            num2 = obter_numero("Digite o segundo número: ")

            if opcao == "1":
                resultado = somar(num1, num2)
                expressao_str = f"{num1} + {num2}"
            elif opcao == "2":
                resultado = subtrair(num1, num2)
                expressao_str = f"{num1} - {num2}"
            elif opcao == "3":
                resultado = multiplicar(num1, num2)
                expressao_str = f"{num1} * {num2}"
            elif opcao == "4":
                resultado = dividir(num1, num2)
                expressao_str = f"{num1} / {num2}"
            elif opcao == "5":
                resultado = divisao_inteira(num1, num2)
                expressao_str = f"{num1} // {num2}"
            elif opcao == "6":
                resultado = modulo(num1, num2)
                expressao_str = f"{num1} % {num2}"
            elif opcao == "7":
                resultado = potencia(num1, num2)
                expressao_str = f"{num1} ^ {num2}"
            elif opcao == "10":
                resultado = porcentagem(num1, num2)
                expressao_str = f"{num2}% de {num1}"

        elif opcao == "8":
            num = obter_numero("Digite o número para extrair a raiz quadrada: ")
            resultado = raiz_quadrada(num)
            expressao_str = f"√{num}"

        elif opcao == "9":
            n = obter_inteiro("Digite um número inteiro não-negativo para o fatorial: ")
            resultado = fatorial(n)
            expressao_str = f"{n}!"

        else:
            raise OperacaoInvalidaError(opcao)

    except DivisaoPorZeroError as erro_div:
        print(f"\\n[ERRO MATEMÁTICO] {erro_div}")
    except ValorInvalidoError as erro_val:
        print(f"\\n[ERRO DE VALOR] {erro_val}")
    except EstouroNumericoError as erro_estouro:
        print(f"\\n[ERRO DE CAPACIDADE] {erro_estouro}")
    except OperacaoInvalidaError as erro_op:
        print(f"\\n[ERRO DE OPERAÇÃO] {erro_op}")
    except Exception as erro_inesperado:
        # Tratamento defensivo final para capturar anomalias imprevistas
        print(f"\\n[ERRO INESPERADO] Uma falha não catalogada ocorreu: {erro_inesperado}")
    else:
        # Executado apenas quando o bloco try transcorre com sucesso absoluto
        print(f"\\n>>> RESULTADO: {resultado}")
        calc.registrar_historico(expressao_str, resultado)
    finally:
        # Executado sempre, independente de erro ou sucesso
        print("-" * 54)

    return True


def main() -> None:
    """Ponto de entrada principal do programa."""
    calc = Calculadora()
    print("Iniciando a Calculadora Python...")

    try:
        continuar = True
        while continuar:
            exibir_menu()
            escolha = input("Escolha uma opção [0-12]: ").strip()
            continuar = executar_fluxo(calc, escolha)
    except KeyboardInterrupt:
        print("\\n\\nPrograma interrompido com sucesso pelo usuário (Ctrl+C). Até breve!")
        sys.exit(0)


if __name__ == "__main__":
    main()
`;

export const TEST_CALCULADORA_PY = `"""
Módulo de Testes Unitários - test_calculadora.py
Testa rigorosamente as funções matemáticas e as asserções de exceções.
"""

import unittest
from calculadora import (
    somar,
    subtrair,
    multiplicar,
    dividir,
    divisao_inteira,
    modulo,
    potencia,
    raiz_quadrada,
    fatorial,
    porcentagem,
    Calculadora,
    DivisaoPorZeroError,
    ValorInvalidoError,
    EstouroNumericoError,
)


class TestOperacoesBasicas(unittest.TestCase):
    """Testes para as operações aritméticas fundamentais."""

    def test_soma(self):
        self.assertEqual(somar(10, 5), 15.0)
        self.assertEqual(somar(-7, 3), -4.0)
        self.assertAlmostEqual(somar(0.1, 0.2), 0.3, places=7)

    def test_subtracao(self):
        self.assertEqual(subtrair(10, 4), 6.0)
        self.assertEqual(subtrair(3, 8), -5.0)

    def test_multiplicacao(self):
        self.assertEqual(multiplicar(6, 7), 42.0)
        self.assertEqual(multiplicar(10, 0), 0.0)
        self.assertEqual(multiplicar(-4, -5), 20.0)

    def test_divisao_valida(self):
        self.assertEqual(dividir(20, 4), 5.0)
        self.assertEqual(dividir(7, 2), 3.5)

    def test_divisao_por_zero_lanca_excecao(self):
        """Verifica se dividir por zero lança a exceção customizada DivisaoPorZeroError."""
        with self.assertRaises(DivisaoPorZeroError):
            dividir(10, 0)

        with self.assertRaises(DivisaoPorZeroError):
            divisao_inteira(15, 0)

        with self.assertRaises(DivisaoPorZeroError):
            modulo(8, 0)


class TestOperacoesAvancadas(unittest.TestCase):
    """Testes para potenciação, raízes e fatorial."""

    def test_potencia(self):
        self.assertEqual(potencia(2, 3), 8.0)
        self.assertEqual(potencia(5, 0), 1.0)
        self.assertEqual(potencia(2, -1), 0.5)

    def test_potencia_zero_expoente_negativo(self):
        """0^(-1) deve lançar DivisaoPorZeroError."""
        with self.assertRaises(DivisaoPorZeroError):
            potencia(0, -2)

    def test_raiz_quadrada_valida(self):
        self.assertEqual(raiz_quadrada(144), 12.0)
        self.assertEqual(raiz_quadrada(0), 0.0)
        self.assertAlmostEqual(raiz_quadrada(2), 1.41421356, places=6)

    def test_raiz_quadrada_negativa_lanca_excecao(self):
        """Raiz de número negativo deve lançar ValorInvalidoError nos reais."""
        with self.assertRaises(ValorInvalidoError):
            raiz_quadrada(-25)

    def test_fatorial_valido(self):
        self.assertEqual(fatorial(0), 1)
        self.assertEqual(fatorial(1), 1)
        self.assertEqual(fatorial(5), 120)

    def test_fatorial_negativo_lanca_excecao(self):
        with self.assertRaises(ValorInvalidoError):
            fatorial(-3)

    def test_porcentagem(self):
        self.assertEqual(porcentagem(250, 10), 25.0)
        self.assertEqual(porcentagem(80, 50), 40.0)


class TestGestaoCalculadora(unittest.TestCase):
    """Testes para o estado interno da classe Calculadora (Histórico e Memória)."""

    def setUp(self):
        self.calc = Calculadora()

    def test_memoria(self):
        self.assertEqual(self.calc.memoria, 0.0)
        self.calc.gravar_memoria(50)
        self.assertEqual(self.calc.memoria, 50.0)
        self.calc.somar_memoria(25)
        self.assertEqual(self.calc.memoria, 75.0)
        self.calc.limpar_memoria()
        self.assertEqual(self.calc.memoria, 0.0)

    def test_historico(self):
        self.calc.registrar_historico("10 + 5", 15.0)
        self.calc.registrar_historico("20 * 2", 40.0)
        historico = self.calc.obter_historico()
        self.assertEqual(len(historico), 2)
        self.assertIn("10 + 5 = 15.0", historico[0])


if __name__ == "__main__":
    unittest.main()
`;

export const README_MD = `# Calculadora Python 3 — Boas Práticas & Tratamento de Exceções

Uma implementação profissional de calculadora em Python, desenvolvida com foco estrito em **qualidade de software**, **modularidade**, **manutenibilidade** e **resiliência a falhas**.

---

## 🎯 Destaques de Engenharia de Software

1. **Princípio da Responsabilidade Única (SRP - SOLID)**:
   - Funções matemáticas são **puras** e isoladas do fluxo de entrada e saída (I/O).
   - Nenhuma função de cálculo usa \`input()\` ou \`print()\` diretamente.
   - A camada de apresentação (terminal / CLI) lida com entrada de dados e exibição de resultados.

2. **Tipagem Estática (PEP 484)**:
   - Todas as funções e métodos possuem anotações completas de tipo (\`Numero = Union[int, float]\`, \`float\`, \`int\`, etc.).
   - Facilita a inspeção estática com **Mypy** e autocompletar de IDEs.

3. **Hierarquia de Exceções Personalizadas**:
   - \`CalculadoraError\`: Classe base abstrata.
   - \`DivisaoPorZeroError\`: Falha específica de divisão ou módulo por zero.
   - \`ValorInvalidoError\`: Violação de domínio real (ex: raiz quadrada de negativo, fatorial negativo).
   - \`OperacaoInvalidaError\`: Opção ou símbolo não suportado.
   - \`EstouroNumericoError\`: Overflow computacional.

4. **Tratamento Defensivo com Ciclo Completo \`try / except / else / finally\`**:
   - \`try\`: Executa o cálculo ou conversão de tipo.
   - \`except\`: Trata individualmente cada exceção conhecida, fornecendo orientações claras ao usuário.
   - \`else\`: Registra no histórico e exibe o resultado **apenas se nenhuma falha ocorreu**.
   - \`finally\`: Executa a finalização e separação visual de ciclo.

5. **Documentação Rigorosa (PEP 257)**:
   - Docstrings em formato padrão com seções \`Args\`, \`Returns\`, \`Raises\` e exemplos com \`doctest\`.

6. **Testes Unitários Automatizados (\`unittest\`)**:
   - Cobertura de cenários nominais, valores limite (zero, negativos, floats) e testes de lançamento de exceções com \`assertRaises\`.

---

## 🚀 Como Executar

### 1. Executar a Calculadora Interativa
\`\`\`bash
python calculadora.py
\`\`\`

### 2. Executar os Testes de Unidade
\`\`\`bash
python -m unittest test_calculadora.py -v
\`\`\`
`;
