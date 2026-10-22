/**
 * Playback Controls Component for Step-by-Step Algorithm Execution
 */
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

interface PlaybackBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number; // in milliseconds per step (e.g. 600, 300, 150)
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speedMs: number) => void;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  onStepChange,
  onSpeedChange,
}) => {
  const isAtStart = currentStep <= 0;
  const isAtEnd = totalSteps === 0 || currentStep >= totalSteps - 1;

  // Speeds in ms: 1000ms (0.5x), 500ms (1x), 250ms (2x), 100ms (4x)
  const speedOptions = [
    { label: '0.5x', ms: 1000 },
    { label: '1x', ms: 500 },
    { label: '2x', ms: 250 },
    { label: '4x', ms: 100 },
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-md">
      {/* Playback Action Buttons */}
      <div className="flex items-center justify-between w-full md:w-auto gap-1 sm:gap-1.5 order-2 md:order-1">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onJumpToStart}
            disabled={isAtStart}
            title="Jump to Start"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white disabled:text-slate-600 hover:bg-slate-800 disabled:hover:bg-transparent rounded-md transition-colors"
            aria-label="Jump to First Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={isAtStart}
            title="Step Backward"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800 disabled:hover:bg-transparent rounded-md transition-colors"
            aria-label="Step Backward"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onPlayToggle}
            title={isPlaying ? 'Pause Execution (Space)' : 'Play Step-by-Step (Space)'}
            className="px-3.5 sm:px-4 py-2 min-h-[36px] sm:min-h-[40px] bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-semibold rounded-md flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-xs uppercase tracking-wider font-mono">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="text-xs uppercase tracking-wider font-mono">
                  {isAtEnd ? 'Replay' : 'Play'}
                </span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isAtEnd}
            title="Step Forward"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800 disabled:hover:bg-transparent rounded-md transition-colors"
            aria-label="Step Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onJumpToEnd}
            disabled={isAtEnd}
            title="Jump to End"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white disabled:text-slate-600 hover:bg-slate-800 disabled:hover:bg-transparent rounded-md transition-colors"
            aria-label="Jump to Final Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector (shown inline with buttons on mobile) */}
        <div className="flex md:hidden items-center gap-1">
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-md border border-slate-700/60">
            {speedOptions.map((opt) => (
              <button
                key={opt.ms}
                onClick={() => onSpeedChange(opt.ms)}
                className={`px-1.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  playbackSpeed === opt.ms
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Scrubber Slider */}
      <div className="flex-1 flex items-center gap-2 sm:gap-3 w-full md:max-w-md px-1 sm:px-2 order-1 md:order-2">
        <span className="text-[11px] sm:text-xs font-mono text-slate-400 whitespace-nowrap min-w-[45px] sm:min-w-[50px] text-left sm:text-right">
          Step {totalSteps > 0 ? currentStep + 1 : 0}/{totalSteps}
        </span>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40 py-1"
          aria-label="Scrub algorithm steps"
        />
        <span className="text-[11px] sm:text-xs font-mono text-slate-500 whitespace-nowrap min-w-[32px] text-right">
          {totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0}%
        </span>
      </div>

      {/* Speed Selector (Desktop View) */}
      <div className="hidden md:flex items-center gap-1.5 order-3 shrink-0">
        <Gauge className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-md border border-slate-700/60">
          {speedOptions.map((opt) => (
            <button
              key={opt.ms}
              onClick={() => onSpeedChange(opt.ms)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                playbackSpeed === opt.ms
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
