import React from "react";

const LoadingState = ({ label = "Loading...", rows = 6 }) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{label}</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 w-full animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/70"
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
