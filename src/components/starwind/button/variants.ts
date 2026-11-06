import { tv } from "tailwind-variants";

export const button = tv({
  base: [
    "inline-flex max-w-full items-center justify-center gap-1.5 rounded-md font-medium whitespace-normal text-center leading-snug",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "transition-all outline-none focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
    "aria-invalid:border-error aria-invalid:focus-visible:ring-error/40",
  ],
  variants: {
    variant: {
      default: "bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-outline/50",
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50 dark:bg-[var(--cta)] dark:text-[var(--cta-foreground)] dark:hover:bg-[var(--cta-hover)] dark:focus-visible:ring-white/35",
      secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-secondary/50",
      outline: "dark:border-input focus-visible:ring-outline/50 bg-background dark:bg-input/30 focus-visible:border-outline hover:bg-muted dark:hover:bg-input/50 hover:text-foreground border shadow-xs",
      ghost: "hover:bg-muted hover:text-foreground focus-visible:ring-outline/50",
      info: "bg-info text-info-foreground hover:bg-info/90 focus-visible:ring-info/50",
      success: "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/50",
      warning: "bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning/50",
      error: "bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error/50",
    },
    size: {
      sm: "min-h-9 h-auto px-4 py-2 text-sm has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-3.5",
      md: "min-h-11 h-auto px-5 py-2.5 text-base has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-4.5",
      lg: "min-h-12 h-auto px-8 py-3 text-lg has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
      "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-3.5",
      icon: "size-11 [&_svg:not([class*='size-'])]:size-4.5",
      "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
