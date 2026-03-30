import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-pf-full font-body font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-pf-primary-ctn focus-visible:ring-offset-2 focus-visible:ring-offset-pf-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-pf-primary-ctn text-pf-on-primary-ctn shadow-[0_0_20px_-5px_rgba(255,83,91,0.5)] hover:shadow-[0_0_32px_-2px_rgba(255,83,91,0.7)] hover:-translate-y-[1px] active:translate-y-0',
        secondary:
          'bg-pf-secondary-ctn text-pf-on-secondary-ctn hover:bg-opacity-90',
        ghost:
          'bg-transparent text-pf-primary hover:bg-[rgba(91,64,63,0.15)]',
        outline:
          'border border-pf-primary-ctn bg-transparent text-pf-primary-ctn hover:bg-pf-primary-ctn/10',
      },
      size: {
        default: 'h-12 px-7 text-[15px]',
        sm: 'h-10 px-5 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
