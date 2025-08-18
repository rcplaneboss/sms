import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-all group",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-gray-100",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        danger:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 dark:text-gray-100",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-10 py-5 text-lg",
      },
      withIcon: {
        true: "gap-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      withIcon: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  icon?: boolean;
}

export function Button({
  href,
  children,
  variant,
  size,
  withIcon,
  icon = true,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, withIcon }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon && (
          <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
      {icon && (
        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
