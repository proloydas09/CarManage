"use client";

import { LucideIcon, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionHref, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-elevated/30 rounded-3xl border border-white/5 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-display">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
        {description}
      </p>
      
      {(actionHref || onAction) && actionText && (
        actionHref ? (
          <Link href={actionHref} className="btn-primary">
            <Plus className="w-4 h-4" /> {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary">
            <Plus className="w-4 h-4" /> {actionText}
          </button>
        )
      )}
    </div>
  );
}
