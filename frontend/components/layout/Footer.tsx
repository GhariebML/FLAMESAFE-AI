import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-space-800 bg-space-950 py-6 px-4 sm:px-6 text-xs text-fg-muted transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-fg-secondary">FlameSafe AI</span> — Team R² (Mohamed Gharieb, Toka Reda, Mai Hamdy, Amany Atef)
        </div>
        <div className="text-center sm:text-right max-w-xl text-[11px] text-fg-muted">
          Independent hackathon project for the 2026 NASA Space Apps Challenge.
          FlameSafe AI is an independent scientific research intelligence tool and is not officially certified or endorsed by NASA.
        </div>
      </div>
    </footer>
  );
};
