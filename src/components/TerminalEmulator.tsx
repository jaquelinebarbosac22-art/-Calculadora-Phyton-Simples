/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, RotateCcw, Play, HelpCircle } from "lucide-react";
import {
  pySomar,
  pySubtrair,
  pyMultiplicar,
  pyDividir,
  pyDivisaoInteira,
  pyModulo,
  pyPotencia,
  pyRaizQuadrada,
  pyFatorial,
  pyPorcentagem,
  DivisaoPorZeroError,
  ValorInvalidoError,
  EstouroNumericoError,
} from "../services/pythonEngine.ts";

interface TerminalLine {
  id: string;
  type: "system" | "prompt" | "input" | "output" | "error" | "success" | "banner";
  content: string;
}

type StepState =
  | { state: "MENU" }
  | { state: "OP_TWO_NUMS_1"; op: string; opName: string }
  | { state: "OP_TWO_NUMS_2"; op: string; opName: string; num1: number }
  | { state: "OP_SQRT" }
  | { state: "OP_FAT" }
  | { state: "OP_MEM" }
  | { state: "EXITED" };

export const TerminalEmulator: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [step, setStep] = useState<StepState>({ state: "MENU" });
  const [promptText, setPromptText] = useState<string>("Escolha uma opção [0-12]: ");
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const appendLine = (line: Omit<TerminalLine, "id">) => {
    setLines((prev) => [...prev, { ...line, id: Math.random().toString(36).substring(2, 9) }]);
  };

  const getMenuBanner = (): string[] => [
    "======================================================",
    "           CALCULADORA MODULAR PYTHON 3",
    "======================================================",
    " 1. Adição (+)                 7. Potenciação (^)",
    " 2. Subtração (-)              8. Raiz Quadrada (√)",
    " 3. Multiplicação (*)          9. Fatorial (!)",
    " 4. Divisão Real (/)          10. Porcentagem (%)",
    " 5. Divisão Inteira (//)      11. Ver Histórico",
    " 6. Resto da Divisão (%)      12. Memória (M+/MR/MC)",
    " 0. Sair do Programa",
    "======================================================",
  ];

  const resetTerminal = () => {
    const initial: TerminalLine[] = [
      { id: "1", type: "system", content: "Python 3.12.2 (main, Mar  8 2026, 12:00:00) [GCC 13.2.0] on linux" },
      { id: "2", type: "system", content: 'Type "help", "copyright", "credits" or "license" for more information.' },
      { id: "3", type: "system", content: "$ python3 calculadora.py" },
      { id: "4", type: "output", content: "Iniciando a Calculadora Python..." },
      ...getMenuBanner().map((b, idx) => ({ id: `b_${idx}`, type: "banner" as const, content: b })),
    ];
    setLines(initial);
    setStep({ state: "MENU" });
    setPromptText("Escolha uma opção [0-12]: ");
    setCurrentInput("");
  };

  useEffect(() => {
    resetTerminal();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCommand = (rawInput: string) => {
    const text = rawInput.trim();
    // Record user command
    appendLine({ type: "input", content: `${promptText}${text}` });

    // Handle states
    switch (step.state) {
      case "MENU": {
        if (text === "0") {
          appendLine({ type: "output", content: "\nObrigado por utilizar a Calculadora Python! Até logo." });
          appendLine({ type: "system", content: "Process finished with exit code 0" });
          setStep({ state: "EXITED" });
          setPromptText("$ ");
          return;
        }

        if (text === "11") {
          if (history.length === 0) {
            appendLine({ type: "output", content: "\n[Histórico vazio] Nenhum cálculo foi realizado ainda." });
          } else {
            appendLine({ type: "output", content: "\n--- Histórico de Cálculos ---" });
            history.forEach((h, idx) => {
              appendLine({ type: "output", content: ` ${String(idx + 1).padStart(2, "0")}. ${h}` });
            });
          }
          appendLine({ type: "output", content: "------------------------------------------------------" });
          getMenuBanner().forEach((b) => appendLine({ type: "banner", content: b }));
          setPromptText("Escolha uma opção [0-12]: ");
          return;
        }

        if (text === "12") {
          appendLine({ type: "output", content: `\nValor atual na memória: ${memory}` });
          appendLine({ type: "output", content: "Opções: (1) Zerar, (2) Somar novo valor, (3) Manter" });
          setStep({ state: "OP_MEM" });
          setPromptText("Escolha [1/2/3]: ");
          return;
        }

        const validTwoNums: Record<string, string> = {
          "1": "Adição (+)",
          "2": "Subtração (-)",
          "3": "Multiplicação (*)",
          "4": "Divisão Real (/)",
          "5": "Divisão Inteira (//)",
          "6": "Resto da Divisão (%)",
          "7": "Potenciação (^)",
          "10": "Porcentagem (%)",
        };

        if (validTwoNums[text]) {
          setStep({ state: "OP_TWO_NUMS_1", op: text, opName: validTwoNums[text] });
          setPromptText("Digite o primeiro número: ");
          return;
        }

        if (text === "8") {
          setStep({ state: "OP_SQRT" });
          setPromptText("Digite o número para extrair a raiz quadrada: ");
          return;
        }

        if (text === "9") {
          setStep({ state: "OP_FAT" });
          setPromptText("Digite um número inteiro não-negativo para o fatorial: ");
          return;
        }

        // Invalid option error caught!
        appendLine({
          type: "error",
          content: `\n[ERRO DE OPERAÇÃO] Operação inválida ou não suportada: '${text}'.`,
        });
        appendLine({ type: "output", content: "------------------------------------------------------" });
        setPromptText("Escolha uma opção [0-12]: ");
        break;
      }

      case "OP_TWO_NUMS_1": {
        const val = parseFloat(text.replace(",", "."));
        if (isNaN(val) || !text) {
          appendLine({
            type: "error",
            content: "  [!] Valor inválido! Digite apenas números válidos (ex.: 10, -3.5, 0.25).",
          });
          setPromptText("Digite o primeiro número: ");
          return;
        }
        setStep({ state: "OP_TWO_NUMS_2", op: step.op, opName: step.opName, num1: val });
        setPromptText("Digite o segundo número: ");
        break;
      }

      case "OP_TWO_NUMS_2": {
        const val = parseFloat(text.replace(",", "."));
        if (isNaN(val) || !text) {
          appendLine({
            type: "error",
            content: "  [!] Valor inválido! Digite apenas números válidos (ex.: 10, -3.5, 0.25).",
          });
          setPromptText("Digite o segundo número: ");
          return;
        }

        const num1 = step.num1;
        const num2 = val;
        const op = step.op;

        try {
          let res: number;
          let exprStr = "";

          if (op === "1") {
            res = pySomar(num1, num2);
            exprStr = `${num1} + ${num2}`;
          } else if (op === "2") {
            res = pySubtrair(num1, num2);
            exprStr = `${num1} - ${num2}`;
          } else if (op === "3") {
            res = pyMultiplicar(num1, num2);
            exprStr = `${num1} * ${num2}`;
          } else if (op === "4") {
            res = pyDividir(num1, num2);
            exprStr = `${num1} / ${num2}`;
          } else if (op === "5") {
            res = pyDivisaoInteira(num1, num2);
            exprStr = `${num1} // ${num2}`;
          } else if (op === "6") {
            res = pyModulo(num1, num2);
            exprStr = `${num1} % ${num2}`;
          } else if (op === "7") {
            res = pyPotencia(num1, num2);
            exprStr = `${num1} ^ ${num2}`;
          } else {
            res = pyPorcentagem(num1, num2);
            exprStr = `${num2}% de ${num1}`;
          }

          // Success block: else:
          appendLine({ type: "success", content: `\n>>> RESULTADO: ${res}` });
          setHistory((prev) => [...prev, `${exprStr} = ${res}`]);
        } catch (err: unknown) {
          if (err instanceof DivisaoPorZeroError) {
            appendLine({ type: "error", content: `\n[ERRO MATEMÁTICO] ${err.message}` });
          } else if (err instanceof ValorInvalidoError) {
            appendLine({ type: "error", content: `\n[ERRO DE VALOR] ${err.message}` });
          } else if (err instanceof EstouroNumericoError) {
            appendLine({ type: "error", content: `\n[ERRO DE CAPACIDADE] ${err.message}` });
          } else {
            appendLine({ type: "error", content: `\n[ERRO INESPERADO] ${(err as Error).message}` });
          }
        } finally {
          appendLine({ type: "output", content: "------------------------------------------------------" });
          getMenuBanner().forEach((b) => appendLine({ type: "banner", content: b }));
          setStep({ state: "MENU" });
          setPromptText("Escolha uma opção [0-12]: ");
        }
        break;
      }

      case "OP_SQRT": {
        const val = parseFloat(text.replace(",", "."));
        if (isNaN(val) || !text) {
          appendLine({
            type: "error",
            content: "  [!] Valor inválido! Digite apenas números válidos (ex.: 25, 0, 4.5).",
          });
          setPromptText("Digite o número para extrair a raiz quadrada: ");
          return;
        }

        try {
          const res = pyRaizQuadrada(val);
          appendLine({ type: "success", content: `\n>>> RESULTADO: ${res}` });
          setHistory((prev) => [...prev, `√(${val}) = ${res}`]);
        } catch (err: unknown) {
          if (err instanceof ValorInvalidoError) {
            appendLine({ type: "error", content: `\n[ERRO DE DOMÍNIO] ${err.message}` });
          }
        } finally {
          appendLine({ type: "output", content: "------------------------------------------------------" });
          getMenuBanner().forEach((b) => appendLine({ type: "banner", content: b }));
          setStep({ state: "MENU" });
          setPromptText("Escolha uma opção [0-12]: ");
        }
        break;
      }

      case "OP_FAT": {
        const val = parseInt(text, 10);
        if (isNaN(val) || !text) {
          appendLine({
            type: "error",
            content: "  [!] Valor inválido! Digite um número inteiro não-negativo (ex.: 5, 0, 8).",
          });
          setPromptText("Digite um número inteiro não-negativo para o fatorial: ");
          return;
        }

        try {
          const res = pyFatorial(val);
          appendLine({ type: "success", content: `\n>>> RESULTADO: ${res}` });
          setHistory((prev) => [...prev, `${val}! = ${res}`]);
        } catch (err: unknown) {
          if (err instanceof ValorInvalidoError) {
            appendLine({ type: "error", content: `\n[ERRO DE VALOR] ${err.message}` });
          } else if (err instanceof EstouroNumericoError) {
            appendLine({ type: "error", content: `\n[ERRO DE CAPACIDADE] ${err.message}` });
          }
        } finally {
          appendLine({ type: "output", content: "------------------------------------------------------" });
          getMenuBanner().forEach((b) => appendLine({ type: "banner", content: b }));
          setStep({ state: "MENU" });
          setPromptText("Escolha uma opção [0-12]: ");
        }
        break;
      }

      case "OP_MEM": {
        if (text === "1") {
          setMemory(0);
          appendLine({ type: "success", content: "Memória zerada com sucesso." });
        } else if (text === "2") {
          const addVal = prompt("Digite o valor para somar à memória:") || "0";
          const parsed = parseFloat(addVal);
          if (!isNaN(parsed)) {
            setMemory((m) => m + parsed);
            appendLine({ type: "success", content: `Novo valor em memória: ${memory + parsed}` });
          }
        } else {
          appendLine({ type: "output", content: "Memória mantida." });
        }
        appendLine({ type: "output", content: "------------------------------------------------------" });
        getMenuBanner().forEach((b) => appendLine({ type: "banner", content: b }));
        setStep({ state: "MENU" });
        setPromptText("Escolha uma opção [0-12]: ");
        break;
      }

      case "EXITED": {
        if (text === "python3 calculadora.py" || text === "python calculadora.py" || text === "run") {
          resetTerminal();
        } else {
          appendLine({ type: "output", content: `sh: comando não encontrado: ${text}. Digite 'python3 calculadora.py' para reiniciar.` });
        }
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(currentInput);
      setCurrentInput("");
    }
  };

  const injectCommand = (cmd: string) => {
    handleCommand(cmd);
    setCurrentInput("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
            <span>Terminal REPL Interativo</span>
            <span aria-hidden="true">·</span>
            <span>Entrada Padrão (stdin) / Saída Padrão (stdout)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Terminal Python 3 CLI
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Experimente o script interativo exatamente como ele roda no terminal do desenvolvedor.
            Digite números, letras erradas ou divisões por zero para ver o tratamento de exceções em ação.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetTerminal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar CLI</span>
          </button>
        </div>
      </div>

      {/* Suggested quick actions */}
      <div className="mb-4 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-semibold">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
          Testes Prontos:
        </span>
        <button
          onClick={() => injectCommand("4")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
        >
          Opção 4 (Divisão)
        </button>
        <button
          onClick={() => injectCommand("8")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
        >
          Opção 8 (Raiz)
        </button>
        <button
          onClick={() => injectCommand("9")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
        >
          Opção 9 (Fatorial)
        </button>
        <button
          onClick={() => injectCommand("11")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
        >
          Opção 11 (Histórico)
        </button>
        <button
          onClick={() => injectCommand("0")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
        >
          Opção 0 (Sair)
        </button>
      </div>

      {/* Terminal Window */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-slate-400 font-sans font-medium">
              bash - python3 calculadora.py
            </span>
          </div>
          <div className="text-[11px] text-slate-500">UTF-8 · Interactive TTY</div>
        </div>

        {/* Terminal Body */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="p-4 sm:p-6 min-h-[440px] max-h-[580px] overflow-y-auto cursor-text text-xs sm:text-sm leading-relaxed"
        >
          {lines.map((line) => {
            if (line.type === "system") {
              return (
                <div key={line.id} className="text-slate-500">
                  {line.content}
                </div>
              );
            }
            if (line.type === "banner") {
              return (
                <div key={line.id} className="text-slate-300 font-medium">
                  {line.content}
                </div>
              );
            }
            if (line.type === "input") {
              return (
                <div key={line.id} className="text-emerald-400 font-semibold">
                  {line.content}
                </div>
              );
            }
            if (line.type === "error") {
              return (
                <div key={line.id} className="text-rose-400 font-bold whitespace-pre-wrap">
                  {line.content}
                </div>
              );
            }
            if (line.type === "success") {
              return (
                <div key={line.id} className="text-emerald-300 font-bold whitespace-pre-wrap">
                  {line.content}
                </div>
              );
            }
            return (
              <div key={line.id} className="text-slate-300 whitespace-pre-wrap">
                {line.content}
              </div>
            );
          })}

          {/* Interactive input row */}
          <div className="flex items-center mt-2 text-emerald-400 font-semibold">
            <span className="shrink-0">{promptText}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs sm:text-sm px-1.5 focus:ring-0"
              autoFocus
              placeholder="digite aqui e pressione Enter..."
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
