/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Download, FileCode, CheckCircle2, FileText, Info } from "lucide-react";
import { CALCULADORA_PY, TEST_CALCULADORA_PY, README_MD } from "../data/pythonCode.ts";

type FileTab = "calculadora.py" | "test_calculadora.py" | "README.md";

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FileTab>("calculadora.py");
  const [copied, setCopied] = useState<boolean>(false);

  const getFileContent = (): string => {
    switch (activeFile) {
      case "calculadora.py":
        return CALCULADORA_PY;
      case "test_calculadora.py":
        return TEST_CALCULADORA_PY;
      case "README.md":
        return README_MD;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCurrentFile = () => {
    const content = getFileContent();
    const mime = activeFile.endsWith(".py") ? "text/x-python" : "text/markdown";
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const codeText = getFileContent();
  const lines = codeText.split("\n");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
            <span>Código-Fonte Completo & Documentado</span>
            <span aria-hidden="true">·</span>
            <span>PEP 8 · PEP 257 · PEP 484</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Arquivos do Projeto Python
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspecione o código-fonte original, pronto para download, estudo e execução direta em qualquer ambiente Python 3.8+.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copiado!" : "Copiar Código"}</span>
          </button>
          <button
            onClick={downloadCurrentFile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Baixar {activeFile}</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Tab Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFile("calculadora.py")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeFile === "calculadora.py"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>calculadora.py</span>
            </button>

            <button
              onClick={() => setActiveFile("test_calculadora.py")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeFile === "test_calculadora.py"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>test_calculadora.py</span>
            </button>

            <button
              onClick={() => setActiveFile("README.md")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeFile === "README.md"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>README.md</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span>{lines.length} linhas</span>
            <span>Python 3.10+</span>
            <span>UTF-8</span>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="p-4 overflow-x-auto max-h-[640px] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, index) => {
                const lineNum = index + 1;
                return (
                  <tr key={index} className="hover:bg-slate-900/60 transition-colors">
                    <td className="w-12 pr-4 text-right text-slate-600 select-none text-xs tabular-nums border-r border-slate-800/80">
                      {lineNum}
                    </td>
                    <td className="pl-4 whitespace-pre text-slate-200">
                      {renderSyntaxHighlightedLine(line)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Lightweight, dependable Python syntax highlighter
function renderSyntaxHighlightedLine(line: string): React.ReactNode {
  if (line.trim().startsWith("#")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.trim().startsWith('"""') || line.trim().endsWith('"""')) {
    return <span className="text-amber-300/80 italic">{line}</span>;
  }

  // Common keywords regex
  const keywordRegex = /\b(def|class|import|from|return|try|except|else|finally|raise|if|elif|while|for|in|as|with|pass|None|True|False|float|int|str|bool|Union|Tuple|Optional|List)\b/g;

  const parts = line.split(keywordRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (
          [
            "def",
            "class",
            "import",
            "from",
            "return",
            "try",
            "except",
            "else",
            "finally",
            "raise",
            "if",
            "elif",
            "while",
            "for",
            "in",
            "as",
            "with",
            "pass",
          ].includes(part)
        ) {
          return (
            <span key={i} className="text-purple-400 font-semibold">
              {part}
            </span>
          );
        }
        if (["None", "True", "False"].includes(part)) {
          return (
            <span key={i} className="text-amber-400 font-semibold">
              {part}
            </span>
          );
        }
        if (["float", "int", "str", "bool", "Union", "Tuple", "Optional", "List"].includes(part)) {
          return (
            <span key={i} className="text-cyan-400 font-semibold">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
