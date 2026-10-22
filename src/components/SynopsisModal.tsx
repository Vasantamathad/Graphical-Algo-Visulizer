/**
 * Project Synopsis & Academic Information Modal
 * Master of Computer Application (MCA) - Chetan Business School
 */
import React from 'react';
import { X, GraduationCap, Users, BookOpen, Layers, Target, CheckCircle2 } from 'lucide-react';

interface SynopsisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SynopsisModal: React.FC<SynopsisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Graphics Algorithm Visualizer
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Project Synopsis · MCA · Chetan Business School
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0"
            aria-label="Close Synopsis"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 text-sm">
          {/* Institution & Guidance Banner */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-center pb-2 border-b border-slate-850">
              <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wider">
                CHETAN BUSINESS SCHOOL
              </h3>
              <p className="text-xs text-slate-400">
                (Affiliated to Karnatak University, Dharwad & Recognized by AICTE, New Delhi)
              </p>
              <p className="text-[11px] text-slate-500">Tajnagar, Hubballi–580031</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between text-xs pt-1 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Program:</span>{' '}
                <span className="text-slate-200 font-semibold">Master of Computer Application (MCA)</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Under the Guidance of:</span>{' '}
                <span className="text-sky-300 font-semibold">Dr. RaviKumar Roogi</span>
              </div>
            </div>
          </div>

          {/* Project Associates Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Project Associates
              </h4>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-850 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">UUCMS No.</th>
                    <th className="py-2 px-3">Student Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-200">
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126002</td>
                    <td className="py-2 px-3 font-sans">Ananya R Sugandhi</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126006</td>
                    <td className="py-2 px-3 font-sans">Chaitra D Navalgund</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126010</td>
                    <td className="py-2 px-3 font-sans">Iranna B Kumbar</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126015</td>
                    <td className="py-2 px-3 font-sans">Misba Pallan</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126023</td>
                    <td className="py-2 px-3 font-sans">Riya V Navade</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sky-400">P02DR25S126037</td>
                    <td className="py-2 px-3 font-sans">Vasanta S Mathad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                1. Problem Statement
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-850">
              Computer graphics algorithms are generally taught using mathematical formulas, pseudocode, and static diagrams. Students often find it difficult to understand how individual pixels are selected and how graphical objects are generated step by step.
              The proposed project, “Graphics Algorithm Visualizer”, aims to develop an educational and interactive software tool that visually demonstrates the working of fundamental computer graphics algorithms. The system allows users to enter input values and observe the execution of algorithms such as DDA, Bresenham line drawing, midpoint circle drawing, and line-clipping algorithms.
            </p>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. Core Objectives
              </h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950/40 p-3 rounded border border-slate-850">
              <li>Interactive educational tool for learning basic computer graphics algorithms step by step.</li>
              <li>Implementation of Digital Differential Analyzer (DDA) line-drawing algorithm.</li>
              <li>Implementation of Bresenham integer line-drawing algorithm for all octants.</li>
              <li>Implementation of Midpoint Line-drawing algorithm with implicit function evaluations.</li>
              <li>Implementation of Midpoint Circle-drawing algorithm with 8-way symmetry display.</li>
              <li>Implementation of Cohen–Sutherland 4-bit outcode line-clipping algorithm.</li>
              <li>Implementation of Sutherland–Hodgman polygon clipping algorithm with 4 boundary edge cases.</li>
              <li>Coordinate grid displaying pixels, continuous ideal geometry, clipping windows, and polygons.</li>
              <li>Real-time calculations, decision parameters (pk, d, outcodes, intersections), and algorithm progress.</li>
              <li>Execution controls: Start, pause, step-by-step, reset, and rate adjustment.</li>
            </ul>
          </div>

          {/* Bibliography */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                3. Academic Bibliography
              </h4>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside font-mono bg-slate-950/40 p-3 rounded border border-slate-850">
              <li>Hearn, D., Baker, M. P., and Carithers, W. Computer Graphics with OpenGL. Pearson Education.</li>
              <li>Foley, J. D., van Dam, A., Feiner, S. K., and Hughes, J. F. Computer Graphics: Principles and Practice. Addison-Wesley.</li>
              <li>Rogers, D. F. Procedural Elements for Computer Graphics. McGraw-Hill.</li>
              <li>Cambridge Computer Graphics Teaching Resources. “Computer Graphics and Image Processing”.</li>
              <li>Drexel University, Department of Computer Science. “Line Drawing and Clipping”.</li>
              <li>INFLIBNET. “Midpoint Circle Drawing Procedure”.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-colors"
          >
            Close Synopsis
          </button>
        </div>
      </div>
    </div>
  );
};
