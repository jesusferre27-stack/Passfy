import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pf-skeleton h-5 w-full", className)}
      {...props}
    />
  )
}

export { Skeleton }
