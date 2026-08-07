import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground border border-primary-border/30 shadow-xs hover:scale-[1.02] hover:-translate-y-[1px] hover:shadow-sm hover:brightness-105',
        destructive:
          'bg-destructive text-destructive-foreground border border-destructive-border shadow-xs hover:scale-[1.02] hover:-translate-y-[1px] hover:bg-destructive/90',
        outline:
          'border border-border/80 bg-background text-foreground shadow-2xs hover:scale-[1.02] hover:-translate-y-[1px] hover:bg-muted hover:border-primary/40',
        secondary:
          'bg-secondary text-secondary-foreground border border-secondary-border shadow-2xs hover:scale-[1.02] hover:-translate-y-[1px] hover:bg-secondary/80',
        ghost:
          'text-foreground hover:bg-muted hover:text-primary hover:scale-[1.02]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs font-bold rounded-xl',
        sm: 'h-8 px-3 text-[11px] font-bold rounded-lg',
        lg: 'h-12 px-6 text-sm font-bold rounded-xl',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
