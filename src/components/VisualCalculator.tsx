/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Delete,
  RotateCcw,
  History,
  Sparkles,
  Zap,
  Cpu,
} from "lucide-react";
import { executePyOperation, ExecutionTrace } from "../services/pythonEngine.ts";

export const VisualCalculator: React.FC = () => {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [storedOperand, setStoredOperand] = useState<number | null>(null);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [formulaPreview, setFormulaPreview] = useState<string>("");
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [history, setHistory] = useState<ExecutionTrace[]>([]);
  const [latestTrace, setLatestTrace] = useState<ExecutionTrace | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Append digit
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit);
    }
  };

  // Decimal separator
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
    } else if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  // Clear all (AC)
  const clearAll = () => {
    setDisplayValue("0");
    setStoredOperand(null);
    setPendingOperation(null);
    setWaitingForOperand(false);
    setFormulaPreview("");
  };

  // Backspace
  const backspace = () => {
    if (waitingForOperand) return;
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  // Invert sign (+/-)
  const toggleSign = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue(String(-val));
    }
  };

  // Two-operand operations (+, -, *, /, //, %, ^)
  const handleBinaryOp = (op: string, symbol: string) => {
    const currentVal = parseFloat(displayValue);

    if (storedOperand === null) {
      setStoredOperand(currentVal);
      setPendingOperation(op);
      setFormulaPreview(`${currentVal} ${symbol}`);
      setWaitingForOperand(true);
    } else if (pendingOperation && !waitingForOperand) {
      // Execute chained operation
      const trace = executePyOperation(pendingOperation, { a: storedOperand, b: currentVal });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);

      if (trace.status === "success" && typeof trace.result === "number") {
        setStoredOperand(trace.result);
        setDisplayValue(String(trace.result));
        setFormulaPreview(`${trace.result} ${symbol}`);
      } else {
        // Exception occurred
        setStoredOperand(null);
        setDisplayValue("Erro");
        setFormulaPreview(`${storedOperand} ${symbol} ${currentVal}`);
      }
      setPendingOperation(op);
      setWaitingForOperand(true);
    } else {
      setPendingOperation(op);
      setFormulaPreview(`${storedOperand} ${symbol}`);
    }
  };

  // Calculate equals (=)
  const handleEquals = () => {
    const currentVal = parseFloat(displayValue);
    if (storedOperand === null || pendingOperation === null) {
      return;
    }

    const opSymbolMap: Record<string, string> = {
      somar: "+",
      subtrair: "-",
      multiplicar: "×",
      dividir: "÷",
      divisao_inteira: "//",
      modulo: "%",
      potencia: "^",
      porcentagem: "% de",
    };

    const symbol = opSymbolMap[pendingOperation] || pendingOperation;
    setFormulaPreview(`${storedOperand} ${symbol} ${currentVal} =`);

    const trace = executePyOperation(pendingOperation, { a: storedOperand, b: currentVal });
    setLatestTrace(trace);
    setHistory((prev) => [trace, ...prev.slice(0, 24)]);

    if (trace.status === "success" && trace.result !== undefined) {
      setDisplayValue(String(trace.result));
    } else {
      setDisplayValue("Erro");
    }

    setStoredOperand(null);
    setPendingOperation(null);
    setWaitingForOperand(true);
  };

  // Single operand operations (Square Root, Factorial)
  const handleUnaryOp = (op: "raiz_quadrada" | "fatorial") => {
    const currentVal = parseFloat(displayValue);
    const trace = executePyOperation(op, {
      a: currentVal,
      radicando: currentVal,
      n: currentVal,
    });
    setLatestTrace(trace);
    setHistory((prev) => [trace, ...prev.slice(0, 24)]);

    if (op === "raiz_quadrada") {
      setFormulaPreview(`√(${currentVal}) =`);
    } else {
      setFormulaPreview(`${currentVal}! =`);
    }

    if (trace.status === "success" && trace.result !== undefined) {
      setDisplayValue(String(trace.result));
    } else {
      setDisplayValue("Erro");
    }
    setWaitingForOperand(true);
  };

  // Quick preset triggers to test exceptions immediately
  const triggerPreset = (type: "div_zero" | "raiz_neg" | "fat_neg" | "zero_pow_neg" | "complex_expr") => {
    if (type === "div_zero") {
      setStoredOperand(10);
      setPendingOperation("dividir");
      setDisplayValue("0");
      setFormulaPreview("10 ÷ 0 =");
      const trace = executePyOperation("dividir", { a: 10, b: 0 });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);
      setDisplayValue("Erro");
      setWaitingForOperand(true);
      setStoredOperand(null);
      setPendingOperation(null);
    } else if (type === "raiz_neg") {
      setDisplayValue("-16");
      setFormulaPreview("√(-16) =");
      const trace = executePyOperation("raiz_quadrada", { radicando: -16, a: -16 });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);
      setDisplayValue("Erro");
      setWaitingForOperand(true);
    } else if (type === "fat_neg") {
      setDisplayValue("-5");
      setFormulaPreview("(-5)! =");
      const trace = executePyOperation("fatorial", { n: -5, a: -5 });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);
      setDisplayValue("Erro");
      setWaitingForOperand(true);
    } else if (type === "zero_pow_neg") {
      setStoredOperand(0);
      setPendingOperation("potencia");
      setDisplayValue("-2");
      setFormulaPreview("0 ^ -2 =");
      const trace = executePyOperation("potencia", { a: 0, b: -2 });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);
      setDisplayValue("Erro");
      setWaitingForOperand(true);
      setStoredOperand(null);
      setPendingOperation(null);
    } else if (type === "complex_expr") {
      const expr = "((18 + 6) / 4) * 3";
      setFormulaPreview(`${expr} =`);
      const trace = executePyOperation("expressao", { expr });
      setLatestTrace(trace);
      setHistory((prev) => [trace, ...prev.slice(0, 24)]);
      if (trace.status === "success" && trace.result !== undefined) {
        setDisplayValue(String(trace.result));
      }
      setWaitingForOperand(true);
    }
  };

  // Memory functions
  const memoryAdd = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) setMemoryValue((prev) => prev + val);
  };
  const memoryRecall = () => {
    setDisplayValue(String(memoryValue));
    setWaitingForOperand(true);
  };
  const memoryClear = () => {
    setMemoryValue(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
          <span>Ambiente Interativo de Execução</span>
          <span aria-hidden="true">·</span>
          <span>Python 3.12 Engine</span>
          <span aria-hidden="true">·</span>
          <span>Inspeção em Tempo Real</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Calculadora com Tratamento de Exceções
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          Execute operações matemáticas convencionais e analise como o código Python estruturado
          com funções puras, tipagem estática e exceções personalizadas protege o sistema contra falhas e quebras.
        </p>
      </div>

      {/* Quick Edge-Case Test Bar */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Testes Rápidos de Exceções Matemáticas:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerPreset("div_zero")}
              className="px-2.5 py-1 text-xs rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors whitespace-nowrap shrink-0"
              title="Testar Divisão por Zero"
            >
              10 ÷ 0 (DivisaoPorZeroError)
            </button>
            <button
              onClick={() => triggerPreset("raiz_neg")}
              className="px-2.5 py-1 text-xs rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors whitespace-nowrap shrink-0"
              title="Testar Raiz de Negativo"
            >
              √(-16) (ValorInvalidoError)
            </button>
            <button
              onClick={() => triggerPreset("fat_neg")}
              className="px-2.5 py-1 text-xs rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors whitespace-nowrap shrink-0"
              title="Testar Fatorial Negativo"
            >
              (-5)! (ValorInvalidoError)
            </button>
            <button
              onClick={() => triggerPreset("zero_pow_neg")}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              title="Testar Zero com expoente negativo"
            >
              0 ^ -2
            </button>
            <button
              onClick={() => triggerPreset("complex_expr")}
              className="px-2.5 py-1 text-xs rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors whitespace-nowrap shrink-0"
              title="Expressão Aritmética"
            >
              ((18+6)/4)*3
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Calculator Keypad & Python Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calculator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-sm">
            {/* Screen Display */}
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-right">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  {memoryValue !== 0 && (
                    <span className="text-emerald-400 font-semibold">M: {memoryValue}</span>
                  )}
                </span>
                <span className="truncate max-w-[200px]">{formulaPreview || "Pronto"}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white tabular-nums truncate">
                {displayValue}
              </div>
            </div>

            {/* Memory & Utility Controls */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <button
                onClick={memoryClear}
                className="py-2 text-xs font-mono font-medium rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Limpar Memória (MC)"
              >
                MC
              </button>
              <button
                onClick={memoryRecall}
                className="py-2 text-xs font-mono font-medium rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Recuperar Memória (MR)"
              >
                MR
              </button>
              <button
                onClick={memoryAdd}
                className="py-2 text-xs font-mono font-medium rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Adicionar à Memória (M+)"
              >
                M+
              </button>
              <button
                onClick={clearAll}
                className="py-2 text-xs font-mono font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/40 transition-colors"
                title="Limpar Tudo (AC)"
              >
                AC
              </button>
              <button
                onClick={backspace}
                className="py-2 flex items-center justify-center text-xs font-mono rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
                title="Apagar dígito"
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            {/* Math keypad */}
            <div className="grid grid-cols-5 gap-2">
              {/* Row 1: Advanced math ops */}
              <button
                onClick={() => handleUnaryOp("raiz_quadrada")}
                className="py-2.5 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
                title="Raiz Quadrada: raiz_quadrada(radicando)"
              >
                √
              </button>
              <button
                onClick={() => handleUnaryOp("fatorial")}
                className="py-2.5 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
                title="Fatorial: fatorial(n)"
              >
                n!
              </button>
              <button
                onClick={() => handleBinaryOp("potencia", "^")}
                className="py-2.5 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
                title="Potência: potencia(base, exp)"
              >
                xʸ
              </button>
              <button
                onClick={() => handleBinaryOp("modulo", "%")}
                className="py-2.5 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors"
                title="Resto da Divisão: modulo(a, b)"
              >
                mod
              </button>
              <button
                onClick={() => handleBinaryOp("divisao_inteira", "//")}
                className="py-2.5 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors"
                title="Divisão Inteira: divisao_inteira(a, b)"
              >
                //
              </button>

              {/* Row 2: 7, 8, 9, /, % */}
              <button
                onClick={() => inputDigit("7")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                7
              </button>
              <button
                onClick={() => inputDigit("8")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                8
              </button>
              <button
                onClick={() => inputDigit("9")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                9
              </button>
              <button
                onClick={() => handleBinaryOp("dividir", "÷")}
                className="py-3 font-mono text-base rounded-lg bg-emerald-950/50 border border-emerald-900/60 hover:bg-emerald-900/50 text-emerald-300 font-bold transition-colors"
                title="Divisão Real: dividir(a, b)"
              >
                ÷
              </button>
              <button
                onClick={() => handleBinaryOp("porcentagem", "% de")}
                className="py-3 font-mono text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                title="Porcentagem"
              >
                %
              </button>

              {/* Row 3: 4, 5, 6, *, +/- */}
              <button
                onClick={() => inputDigit("4")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                4
              </button>
              <button
                onClick={() => inputDigit("5")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                5
              </button>
              <button
                onClick={() => inputDigit("6")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                6
              </button>
              <button
                onClick={() => handleBinaryOp("multiplicar", "×")}
                className="py-3 font-mono text-base rounded-lg bg-emerald-950/50 border border-emerald-900/60 hover:bg-emerald-900/50 text-emerald-300 font-bold transition-colors"
                title="Multiplicação: multiplicar(a, b)"
              >
                ×
              </button>
              <button
                onClick={toggleSign}
                className="py-3 font-mono text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                title="Inverter Sinal (+/-)"
              >
                ±
              </button>

              {/* Row 4: 1, 2, 3, -, (empty) */}
              <button
                onClick={() => inputDigit("1")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                1
              </button>
              <button
                onClick={() => inputDigit("2")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                2
              </button>
              <button
                onClick={() => inputDigit("3")}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                3
              </button>
              <button
                onClick={() => handleBinaryOp("subtrair", "-")}
                className="py-3 font-mono text-base rounded-lg bg-emerald-950/50 border border-emerald-900/60 hover:bg-emerald-900/50 text-emerald-300 font-bold transition-colors"
                title="Subtração: subtrair(a, b)"
              >
                -
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`py-3 flex items-center justify-center rounded-lg border transition-colors ${
                  showHistory
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
                title="Alternar Histórico"
              >
                <History className="h-4 w-4" />
              </button>

              {/* Row 5: 0, ., =, + */}
              <button
                onClick={() => inputDigit("0")}
                className="col-span-2 py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                0
              </button>
              <button
                onClick={inputDecimal}
                className="py-3 font-mono text-base font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-colors"
              >
                .
              </button>
              <button
                onClick={() => handleBinaryOp("somar", "+")}
                className="py-3 font-mono text-base rounded-lg bg-emerald-950/50 border border-emerald-900/60 hover:bg-emerald-900/50 text-emerald-300 font-bold transition-colors"
                title="Adição: somar(a, b)"
              >
                +
              </button>
              <button
                onClick={handleEquals}
                className="py-3 font-mono text-base rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20 active:translate-y-0.5 transition-all"
                title="Calcular resultado"
              >
                =
              </button>
            </div>
          </div>

          {/* Collapsible History Drawer */}
          {showHistory && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-emerald-400" />
                  Histórico de Execuções ({history.length})
                </span>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Limpar
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Nenhum cálculo registrado ainda.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setLatestTrace(item)}
                      className="cursor-pointer p-2 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 text-xs font-mono transition-colors"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{item.expression}</span>
                        <span className="text-[10px] text-slate-600">
                          {item.executionTimeMs}ms
                        </span>
                      </div>
                      <div className="mt-1 font-semibold">
                        {item.status === "success" ? (
                          <span className="text-emerald-400">= {item.result}</span>
                        ) : (
                          <span className="text-rose-400">[Exceção] {item.exceptionName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Python Execution & Exception Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Inspetor de Execução & Exceções Python
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rastreamento passo a passo da função Python invocada
                  </p>
                </div>
              </div>

              {latestTrace && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                    latestTrace.status === "success"
                      ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
                      : "bg-rose-950/60 border-rose-800/80 text-rose-300"
                  }`}
                >
                  {latestTrace.status === "success" ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Status: Sucesso
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Exceção Capturada
                    </>
                  )}
                </span>
              )}
            </div>

            {latestTrace ? (
              <div className="space-y-4">
                {/* Status card if exception */}
                {latestTrace.status === "exception" ? (
                  <div className="rounded-xl border border-rose-800/80 bg-rose-950/30 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs uppercase tracking-wider font-mono font-bold text-rose-400">
                          {latestTrace.exceptionName}
                        </div>
                        <div className="text-sm font-medium text-rose-100 mt-1">
                          {latestTrace.exceptionMessage}
                        </div>
                        <div className="mt-2 text-xs text-rose-300/80">
                          <span className="font-semibold text-rose-200">Domínio da Falha:</span>{" "}
                          {latestTrace.exceptionDomain}
                        </div>
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed border-t border-rose-900/40 pt-2">
                          <span className="font-semibold text-emerald-400">Como o Python protegeu:</span> Em vez de travar o programa inteiro com uma falha fatal, a função lançou uma exceção personalizada de domínio e o bloco <code className="text-rose-300 bg-rose-950 px-1 py-0.5 rounded">except {latestTrace.exceptionName}</code> capturou o erro de forma defensiva e comunicou a causa de forma clara.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs uppercase tracking-wider font-mono font-bold text-emerald-400">
                          Execução Nominal com Sucesso
                        </div>
                        <div className="text-sm font-medium text-emerald-100 mt-1">
                          Expressão: <span className="font-mono text-white font-bold">{latestTrace.expression}</span> ={" "}
                          <span className="font-mono text-emerald-300 font-bold">{latestTrace.result}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                          Tempo de processamento:{" "}
                          <span className="font-mono text-emerald-400 tabular-nums">
                            {latestTrace.executionTimeMs} ms
                          </span>{" "}
                          · Bloco <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">else:</code> acionado para persistência.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exact Python Call */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>1. Invocação Direta da Função Python:</span>
                    <span className="text-[11px] text-slate-500 font-mono">def {latestTrace.operationName}()</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    <code>{latestTrace.pythonCallSnippet}</code>
                  </pre>
                </div>

                {/* Try/Except Flow Snippet */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>2. Bloco Defensivo (try...except...else...finally):</span>
                    <span className="text-[11px] text-slate-500 font-mono">calculadora.py:executar_fluxo()</span>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    <code>{latestTrace.pythonTryExceptSnippet}</code>
                  </pre>
                </div>

                {/* Parameters Breakdown */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <div className="font-semibold text-slate-300 mb-2">Parâmetros Validados:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(latestTrace.args).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase">{key}</div>
                        <div className="font-mono text-slate-200 font-semibold truncate">{String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400 mb-3">
                  <Cpu className="h-6 w-6 text-slate-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">
                  Aguardando Execução de Cálculo
                </h4>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Clique nos botões da calculadora ao lado ou utilize um dos atalhos de teste de exceções acima para visualizar o fluxo em tempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
