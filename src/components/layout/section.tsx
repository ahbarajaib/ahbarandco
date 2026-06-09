import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "surface";
  id?: string;
};

const variantStyles = {
  primary: "bg-background-primary",
  secondary: "bg-background-secondary",
  surface: "bg-surface",
} as const;

export function Section({
  children,
  className,
  variant = "primary",
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 sm:py-16 md:py-20 lg:py-28",
        variantStyles[variant],
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
