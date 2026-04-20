"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

export function SlideOver({ open, onClose, title, children, width = "md" }: SlideOverProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className={`absolute right-0 top-0 bottom-0 w-full ${widths[width]} bg-bg-surface border-l border-bg-border flex flex-col animate-slide-in-right`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border flex-shrink-0">
          <h2 className="font-semibold text-white font-display">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
