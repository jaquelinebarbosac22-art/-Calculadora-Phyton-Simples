/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, X, Shield, Code, Cpu, BookOpen, Layers, Terminal } from "lucide-react";

interface PracticeCard {
  id: string;
  title: string;
  category: string;
  summary: string;
  badCode: string;
  goodCode: string;
  explanation: string;
  benefits: string[];
}

const PRACTICES: PracticeCard[] = [
  {
    id: "srp",
    title: "1. Funções Puras e Princípio da Responsabilidade Única (SRP)",
    category: "Arquitetura & Clean Code",
    summary:
      "Separação estrita entre lógica de cálculo matemático e operações de entrada e saída (I/O).",
    badCode: `# ❌ PRÁTICA RUIM: Mistura cálculo com input() e print()
def somar():
    a = float(input("Digite o primeiro: "))
    b = float(input("Digite o segundo: "))
    print(f"Resultado: {a + b}")
# Inviável para testes automatizados ou interfaces web`,
    goodCode: `# ✅ BOA PRÁTICA: Função pura desacoplada
def somar(a: float, b: float) -> float:
    """Retorna a soma de dois números reais."""
    return float(a + b)
# Testável, reaproveitável em CLI, Web ou API!`,
    explanation:
      "Uma função deve fazer apenas uma coisa e fazê-la bem. Ao remover input() e print() de dentro dos cálculos, as funções tornam-se puras (mesmas entradas sempre geram as mesmas saídas sem efeitos colaterais).",
    benefits: [
      "Permite escrever testes unitários automáticos",
      "Pode ser reutilizada em APIs REST, GUIs ou linha de comando",
      "Facilita manutenção e leitura do código",
    ],
  },
  {
    id: "exceptions",
    title: "2. Hierarquia de Exceções Personalizadas de Domínio",
    category: "Tratamento de Erros",
    summary:
      "Definição de classes de erro específicas para representar falhas de regras de negócio e matemáticas.",
    badCode: `# ❌ PRÁTICA RUIM: Retornar string mágica ou erro genérico
def dividir(a, b):
    if b == 0:
        return "Erro: divisão por zero" # Retorno de tipo misto quebra o resto do programa!`,
    goodCode: `# ✅ BOA PRÁTICA: Exceção customizada herdada de CalculadoraError
class CalculadoraError(Exception):
    """Classe base para erros da calculadora."""
    pass

class DivisaoPorZeroError(CalculadoraError):
    """Tentativa de divisão por zero."""
    pass

def dividir(a: float, b: float) -> float:
    if b == 0:
        raise DivisaoPorZeroError("Divisão por zero não é permitida.")
    return a / b`,
    explanation:
      "Nunca retorne mensagens de erro no lugar de números. O retorno de tipos inconsistentes (ex.: ora float, ora string) provoca erros silenciosos mais adiante. Lançar exceções tipadas permite que o chamador decida como tratar cada cenário.",
    benefits: [
      "Contrato de tipos preservado (sempre retorna float)",
      "Possibilidade de capturar erros específicos com precisão cirúrgica",
      "Mensagens contextuais claras para o usuário final",
    ],
  },
  {
    id: "try_except_else_finally",
    title: "3. Estrutura Completa: try...except...else...finally",
    category: "Controle de Fluxo Defensivo",
    summary:
      "Uso correto das cláusulas else e finally para orquestrar o ciclo de vida do cálculo.",
    badCode: `# ❌ PRÁTICA RUIM: Captura cega e mistura de fluxos
try:
    res = calcular(op, a, b)
    salvar_historico(res)
    exibir(res)
except:
    print("Deu erro!")`,
    goodCode: `# ✅ BOA PRÁTICA: Ciclo de vida explícito
try:
    resultado = dividir(num1, num2)
except DivisaoPorZeroError as e:
    print(f"[ERRO MATEMÁTICO] {e}")
except ValorInvalidoError as e:
    print(f"[ERRO DE VALOR] {e}")
else:
    # Executa APENAS se nenhuma exceção foi lançada!
    print(f"Sucesso: {resultado}")
    calc.registrar_historico(expressao, resultado)
finally:
    # Executa SEMPRE, para limpeza ou separador visual
    print("-" * 50)`,
    explanation:
      "A cláusula 'else' é uma das funcionalidades mais elegantes do Python: ela garante que o salvamento no histórico e a exibição de sucesso só ocorram se o bloco try transcorreu 100% limpo.",
    benefits: [
      "Evita que históricos sejam corrompidos com cálculos com erro",
      "Garante a execução de instruções de limpeza em finally",
      "Elimina blocos try excessivamente longos",
    ],
  },
  {
    id: "type_hints",
    title: "4. Tipagem Estática com Type Hints (PEP 484)",
    category: "Segurança de Tipos",
    summary:
      "Declaração explícita dos tipos de argumentos esperados e tipo do valor retornado.",
    badCode: `# ❌ PRÁTICA RUIM: Parâmetros e retornos sem especificação
def potencia(b, e):
    return b ** e`,
    goodCode: `# ✅ BOA PRÁTICA: Anotações com Union e checagem
from typing import Union

Numero = Union[int, float]

def potencia(base: Numero, expoente: Numero) -> float:
    """Eleva a base ao expoente fornecido."""
    ...`,
    explanation:
      "Python é dinâmico, mas o uso de Type Hints transforma a experiência do desenvolvedor: previne envio acidental de strings para funções numéricas e habilita autocompletar poderoso no VS Code, PyCharm e verificação com Mypy.",
    benefits: [
      "Detecção precoce de incompatibilidades de tipo",
      "Documentação viva embutida na assinatura do código",
      "Suporte de análise estática profissional",
    ],
  },
  {
    id: "docstrings",
    title: "5. Documentação Estruturada com Docstrings (PEP 257)",
    category: "Documentação de Software",
    summary:
      "Documentação clara com seções de Parâmetros (Args), Retorno (Returns) e Exceções (Raises).",
    badCode: `# ❌ PRÁTICA RUIM: Comentário solto ou sem documentação
# calcula a raiz
def raiz(n):
    return n ** 0.5`,
    goodCode: `# ✅ BOA PRÁTICA: Docstring no padrão PEP 257
def raiz_quadrada(radicando: float) -> float:
    """
    Calcula a raiz quadrada principal no conjunto dos números reais.

    Args:
        radicando: Valor não negativo do qual se deseja extrair a raiz.

    Returns:
        float: Raiz quadrada calculada.

    Raises:
        ValorInvalidoError: Se radicando < 0 (sem raiz nos reais).
    """
    ...`,
    explanation:
      "Docstrings permitem que comandos nativos como help(raiz_quadrada) exibam documentação completa diretamente no terminal, além de alimentarem geradores automáticos de manuais (Sphinx, MkDocs).",
    benefits: [
      "Qualquer desenvolvedor entende as pré-condições da função",
      "Explicita quais exceções podem ser disparadas",
      "Permite testes rápidos de documentação via doctest",
    ],
  },
  {
    id: "input_sanitization",
    title: "6. Sanitização Contínua de Entradas do Usuário",
    category: "Experiência do Usuário (UX)",
    summary:
      "Laços defensivos que tratam ValueError de digitação sem encerrar o programa abruptamente.",
    badCode: `# ❌ PRÁTICA RUIM: Quebra com ValueError se digitar letra
num = float(input("Digite um número: ")) # Se digitar 'dez', o programa morre!`,
    goodCode: `# ✅ BOA PRÁTICA: Tratamento defensivo em loop
def obter_numero(mensagem: str) -> float:
    while True:
        try:
            entrada = input(mensagem).strip().replace(",", ".")
            return float(entrada)
        except ValueError:
            print("  [!] Valor inválido! Digite apenas números válidos (ex.: 10, -3.5).")`,
    explanation:
      "Um software de qualidade nunca deve quebrar na cara do usuário por causa de um erro de digitação. A função obter_numero() acolhe o usuário, substitui vírgula por ponto (padrão brasileiro/europeu) e repete educadamente até receber um valor numérico correto.",
    benefits: [
      "Imunidade contra falhas de digitação acidentais",
      "Suporte a vírgulas e pontos decimais (10,5 vira 10.5)",
      "Experiência de uso fluida sem frustração",
    ],
  },
];

export const BestPracticesGuide: React.FC = () => {
  const [selectedPractice, setSelectedPractice] = useState<string>("srp");
  const current = PRACTICES.find((p) => p.id === selectedPractice) || PRACTICES[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
          <span>Manual de Engenharia de Software</span>
          <span aria-hidden="true">·</span>
          <span>Arquitetura Limpa em Python</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Guia de Boas Práticas & Tratamento de Exceções
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          Entenda cada decisão técnica aplicada no projeto da calculadora para transformar um script amador em um módulo Python profissional, seguro e testável.
        </p>
      </div>

      {/* Nav pill list / selector */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-slate-800 scrollbar-none">
        {PRACTICES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPractice(p.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
              selectedPractice === p.id
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {p.title.split(".")[0]}. {p.title.split(".")[1]?.split("e")[0]?.trim() || p.title}
          </button>
        ))}
      </div>

      {/* Main Focus Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context & Benefits (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              {current.category}
            </span>
            <h2 className="text-xl font-bold text-white mt-1 mb-3">{current.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{current.explanation}</p>

            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                Vantagens Diretas no Software:
              </h3>
              <ul className="space-y-2.5">
                {current.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Code Comparison (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Bad code card */}
          <div className="rounded-2xl border border-rose-900/50 bg-slate-950 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 font-mono">
                <X className="h-4 w-4 text-rose-400" />
                Abordagem Frágil (A Evitar)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Anti-Padrão</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-950 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed">
              <code>{current.badCode}</code>
            </pre>
          </div>

          {/* Good code card */}
          <div className="rounded-2xl border border-emerald-900/50 bg-slate-950 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Check className="h-4 w-4 text-emerald-400" />
                Abordagem Profissional (Aplicada no Projeto)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Padrão da Indústria</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-950 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
              <code>{current.goodCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
