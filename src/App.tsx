/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Header, TabType } from "./components/Header.tsx";
import { VisualCalculator } from "./components/VisualCalculator.tsx";
import { TerminalEmulator } from "./components/TerminalEmulator.tsx";
import { CodeViewer } from "./components/CodeViewer.tsx";
import { TestRunner } from "./components/TestRunner.tsx";
import { BestPracticesGuide } from "./components/BestPracticesGuide.tsx";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("calculator");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "calculator" && <VisualCalculator />}
        {activeTab === "terminal" && <TerminalEmulator />}
        {activeTab === "code" && <CodeViewer />}
        {activeTab === "tests" && <TestRunner />}
        {activeTab === "guide" && <BestPracticesGuide />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Calculadora Modular Python 3</span>
            <span aria-hidden="true">·</span>
            <span>Arquitetura Limpa & Tratamento de Exceções</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PEP 8 · PEP 257 · PEP 484 · SOLID</span>
            <span aria-hidden="true">·</span>
            <span>Compatível com Python 3.8+</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
