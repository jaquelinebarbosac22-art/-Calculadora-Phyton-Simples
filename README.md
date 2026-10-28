# 🧮 Calculadora Modular em Python 3

> Implementação de uma calculadora em Python com foco em **Clean Code**, **funções puras (SRP)**, **tipagem estática (PEP 484)**, **hierarquia de exceções personalizadas** e **testes unitários automatizados (`unittest`)**.

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Code Style: PEP 8](https://img.shields.io/badge/code%20style-PEP%208-brightgreen.svg)](https://peps.python.org/pep-0008/)
[![Typing: PEP 484](https://img.shields.io/badge/typing-PEP%20484-informational.svg)](https://peps.python.org/pep-0484/)
[![Tests: Unittest](https://img.shields.io/badge/tests-12%20passed-success.svg)](https://docs.python.org/3/library/unittest.html)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Boas Práticas de Engenharia Adotadas](#-boas-práticas-de-engenharia-adotadas)
- [Hierarquia de Exceções Personalizadas](#-hierarquia-de-exceções-personalizadas)
- [Operações Suportadas](#-operações-suportadas)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos e Instalação](#-pré-requisitos-e-instalação)
- [Como Executar](#-como-executar)
- [Como Rodar os Testes Unitários](#-como-rodar-os-testes-unitários)
- [Exemplo de Uso e Tratamento](#-exemplo-de-uso-e-tratamento)
- [Licença](#-licença)

---

## 📖 Visão Geral

Este projeto foi construído para demonstrar como elevar um script de cálculo a um padrão de código **profissional, manutenível e resiliente a falhas**.

Em vez de misturar entrada de dados (`input`), impressão em tela (`print`) e cálculos no mesmo bloco, o código é estruturado em **camadas bem definidas**:
1. **Núcleo Matemático**: Funções puras e desacopladas.
2. **Camada de Exceções**: Erros de domínio tipados para evitar comportamentos inesperados.
3. **Camada de Estado**: Gerenciamento de histórico e memória encapsulada.
4. **Camada de Interface (CLI)**: Sanitização contínua de entrada com tratamento defensivo.

---

## 🛠 Boas Práticas de Engenharia Adotadas

| Princípio | Como é aplicado no código | Benefício |
| :--- | :--- | :--- |
| **SRP (Responsabilidade Única)** | As funções matemáticas apenas calculam; não usam `input()` nem `print()`. | Código testável e reutilizável em Web, CLI ou APIs. |
| **Tipagem Estática (PEP 484)** | Anotações como `Numero = Union[int, float]` em argumentos e retornos. | Detecção precoce de bugs e autocompletar em IDEs. |
| **Docstrings Estruturadas (PEP 257)** | Documentação completa com seções `Args`, `Returns`, `Raises` e exemplos. | Compatível com `help()` e geradores automáticos de documentação. |
| **Tratamento Defensivo Completo** | Estrutura completa `try...except...else...finally`. | `else` garante que apenas operações válidas sejam gravadas no histórico. |
| **Sanitização Tolerante de Entrada** | Funções `obter_numero()` tratam `ValueError` e aceitam tanto vírgula quanto ponto decimal. | O programa nunca encerra por erro de digitação acidental do usuário. |
| **Testes Unitários Automatizados** | Bateria completa no padrão `unittest.TestCase` com validação de exceções (`assertRaises`). | Garantia contínua de integridade do código. |

---

## 🚨 Hierarquia de Exceções Personalizadas

Para evitar o anti-padrão de retornar strings mágicas (como `return "Erro"`) ou usar capturas cegas (`except Exception:`), o projeto implementa uma árvore de exceções dedicada:

```text
Exception
 └── CalculadoraError (Classe base abstrata do módulo)
      ├── DivisaoPorZeroError     -> Tentativa de divisão ou módulo por zero
      ├── ValorInvalidoError       -> Violação de domínio (raiz quadrada de negativo, fatorial negativo)
      ├── OperacaoInvalidaError   -> Opção ou símbolo não suportado
      └── EstouroNumericoError    -> Overflow computacional
🔢 Operações Suportadas
Aritmética Fundamental: Adição (+), Subtração (-), Multiplicação (*), Divisão Real (/)
Divisão Especial: Divisão Inteira (//), Resto / Módulo (%)
Matemática Avançada: Potenciação (^), Raiz Quadrada Real (√), Fatorial (!), Porcentagem (%)
Recursos Adicionais:
Memória de cálculo (M+,SENHOR,MC)
Histórico auditável de operações realizadas
Suporte a expressões aritméticas
📁 Estrutura do Repositório
code
Texto
.
├── calculadora.py       # Módulo principal (funções puras, classes, CLI interativa)
├── test_calculadora.py  # Bateria completa de testes automatizados com unittest
└── README.md            # Documentação completa do projeto
⚙️ Pré-requisitos e Instalação
Apenas o Python 3.8 ou superior instalado em sua máquina. O projeto utiliza exclusivamente a biblioteca padrão do Python, dispensando dependências externas (pip install).
Clone o repositório:
code
Bash
git clone https://github.com/SEU_USUARIO/calculadora-python.git
cd calculadora-python
🚀 Como Executar
Inicie a calculadora interativa com o comando:
code
Bash
python calculadora.py
Ou em ambientes Linux/macOS:
code
Bash
python3 calculadora.py
🧪 Como Rodar os Testes Unitários
Execute a suíte de testes de forma verbosa para visualizar cada asserção:
code
Bash
python -m unittest test_calculadora.py -v
Exemplo de Saída dos Testes:
code
Texto
test_soma (test_calculadora.TestOperacoesBasicas) ... ok
test_subtracao (test_calculadora.TestOperacoesBasicas) ... ok
test_multiplicacao (test_calculadora.TestOperacoesBasicas) ... ok
test_divisao_valida (test_calculadora.TestOperacoesBasicas) ... ok
test_divisao_por_zero_lanca_excecao (test_calculadora.TestOperacoesBasicas) ... ok
test_potencia (test_calculadora.TestOperacoesAvancadas) ... ok
test_potencia_zero_expoente_negativo (test_calculadora.TestOperacoesAvancadas) ... ok
test_raiz_quadrada_valida (test_calculadora.TestOperacoesAvancadas) ... ok
test_raiz_quadrada_negativa_lanca_excecao (test_calculadora.TestOperacoesAvancadas) ... ok
test_fatorial_valido (test_calculadora.TestOperacoesAvancadas) ... ok
test_fatorial_negativo_lanca_excecao (test_calculadora.TestOperacoesAvancadas) ... ok
test_porcentagem (test_calculadora.TestOperacoesBasicas) ... ok
test_memoria (test_calculadora.TestGestaoCalculadora) ... ok
test_historico (test_calculadora.TestGestaoCalculadora) ... ok

----------------------------------------------------------------------
Ran 14 tests in 0.003s

OK
💻 Exemplo de Uso como Módulo
Você também pode importar a calculadora em outros scripts ou APIs Python:
code
Python
from calculadora import (
    dividir,
    raiz_quadrada,
    DivisaoPorZeroError,
    ValorInvalidoError
)

# 1. Divisão segura com captura cirúrgica da exceção
try:
    resultado = dividir(10, 0)
except DivisaoPorZeroError as erro:
    print(f"Tratamento defensivo: {erro}")
else:
    print(f"Resultado: {resultado}")

# 2. Raiz quadrada com validação de números reais
try:
    raiz = raiz_quadrada(-9)
except ValorInvalidoError as erro:
    print(f"Erro capturado com sucesso: {erro}")
📄 Licença
Distribuído sob a licença COM. Consulte LICENÇA para mais informações.
