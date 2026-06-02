import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 명리사주: 보라 그라데이션 primary, 어두운 outline
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-purple-gradient text-white shadow-purple-glow hover:opacity-90 hover:shadow-purple-glow-lg active:scale-[0.98]",
        outline:
          "border border-[rgba(139,92,246,0.45)] bg-transparent text-purple-light hover:bg-[rgba(139,92,246,0.1)] hover:border-purple-mid",
        ghost:
          "text-ink hover:bg-[rgba(139,92,246,0.1)] hover:text-purple-light",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        link:
          "text-purple-bright underline-offset-4 hover:underline px-0 h-auto",
        onDark:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm",
      },
      size: {
        default: "h-9 px-5",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-7 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
