import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm heading-tag ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-white border border-brand-primary hover:bg-brand-brown hover:border-brand-brown active:bg-bg active:border-bg active:text-brand-brown',
        secondary:
          'border bg-brand-brown text-white hover:bg-brand-cream hover:border-brand-brown hover:text-brand-brown active:border-brand-primary active:text-brand-primary',
        tertiary:
          'border border-bg hover:border-brand-brown active:border-brand-primary active:text-brand-primary',
        link: 'transition-all rounded-none duration-100 border-b !px-0 !py-0 cursor-pointer hover:!pb-[4px] hover:!-mb-[2px] hover:text-brand-primary active:!pb-0 active:!-mb-0',
        multiselect:
          'border border-bg border-brand-brown hover:bg-brand-brown/10',
        multiselected: 'border border-brand-primary text-brand-primary'
      },
      size: {
        default: 'px-4 py-1 mb-1',
        sm: 'px-3 py-0.5 text-xs',
        lg: 'px-8 py-2 text-lg',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
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
