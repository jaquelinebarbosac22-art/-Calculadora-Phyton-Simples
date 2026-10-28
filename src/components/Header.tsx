/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Download, Terminal, Cpu, Code2, CheckCircle2, BookOpen } from "lucide-react";
import { CALCULADORA_PY } from "../data/pythonCode.ts";

export type TabType = "calculator" | "terminal" | "code" | "tests" | "guide";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const downloadPythonFile = () => {
    const blob = new Blob([CALCULADORA_PY], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calculadora.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Calculadora Python
          </span>
        </div>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single line */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "calculator"
                ? "bg-slate-800 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Calculadora Visual</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "terminal"
                ? "bg-slate-800 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Terminal Python</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "code"
                ? "bg-slate-800 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Código-Fonte (.py)</span>
          </button>

          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "tests"
                ? "bg-slate-800 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Testes Unitários</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "guide"
                ? "bg-slate-800 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Boas Práticas</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={downloadPythonFile}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            title="Baixar calculadora.py pronta para execução"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar .py</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/60 px-4 py-2 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
            activeTab === "calculator" ? "bg-slate-800 text-emerald-400 font-medium" : "text-slate-400"
          }`}
        >
          Calculadora
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
            activeTab === "terminal" ? "bg-slate-800 text-emerald-400 font-medium" : "text-slate-400"
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
            activeTab === "code" ? "bg-slate-800 text-emerald-400 font-medium" : "text-slate-400"
          }`}
        >
          Código Python
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
            activeTab === "tests" ? "bg-slate-800 text-emerald-400 font-medium" : "text-slate-400"
          }`}
        >
          Testes (12)
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
            activeTab === "guide" ? "bg-slate-800 text-emerald-400 font-medium" : "text-slate-400"
          }`}
        >
          Guia de Boas Práticas
        </button>
      </div>
    </header>
  );
};
