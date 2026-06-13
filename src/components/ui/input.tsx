import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-border bg-white px-3.5 py-2 text-sm transition-all placeholder:text-text-secondary/40 outline-none hover:border-wood-medium/20 focus-visible:border-wood-medium focus-visible:ring-2 focus-visible:ring-wood-medium/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-background-secondary/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
