import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-pf-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pf-outline focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-pf-primary-ctn text-pf-on-primary-ctn hover:bg-pf-primary-ctn/80",
        secondary:
          "border-transparent bg-pf-secondary-ctn text-pf-on-secondary-ctn hover:bg-pf-secondary-ctn/80",
        destructive:
          "border-transparent bg-pf-error-ctn text-pf-on-error-ctn hover:bg-pf-error-ctn/80",
        outline: "text-pf-on-surface",
        active: "border-transparent bg-pf-primary-ctn text-white text-[11px] uppercase tracking-wider",
        savings: "border-transparent bg-pf-tertiary-fixed text-pf-on-tertiary-fixed font-mono text-[11px]",
        popular: "border-transparent bg-gradient-to-br from-pf-tertiary-ctn to-pf-tertiary text-[#251A00] text-[11px] uppercase tracking-wider",
        pending: "border-transparent bg-pf-surface-high text-pf-tertiary text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
