import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, Sparkles } from "lucide-react";
import { Link } from "wouter";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryActionLabel,
  primaryActionHref,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`p-10 sm:p-12 text-center rounded-2xl border border-dashed border-border/70 bg-card text-card-foreground shadow-2xs flex flex-col items-center justify-center space-y-5 max-w-2xl mx-auto ${className}`}>
      
      {/* Icon Container with Accent Glow Ring */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
          <Icon className="w-8 h-8" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 bg-accent text-accent-foreground rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Helpful Text */}
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-sans font-extrabold text-lg text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons (Primary & Secondary) */}
      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {primaryActionLabel && (
            primaryActionHref ? (
              <Link href={primaryActionHref}>
                <Button className="font-bold text-xs h-10 px-5 rounded-xl shadow-xs">
                  {primaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button onClick={onPrimaryAction} className="font-bold text-xs h-10 px-5 rounded-xl shadow-xs">
                {primaryActionLabel}
              </Button>
            )
          )}

          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Link href={secondaryActionHref}>
                <Button variant="outline" className="font-bold text-xs h-10 px-5 rounded-xl">
                  {secondaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={onSecondaryAction} className="font-bold text-xs h-10 px-5 rounded-xl">
                {secondaryActionLabel}
              </Button>
            )
          )}
        </div>
      )}

    </Card>
  );
}
