import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeading = ({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeadingProps) => {
  return (
    <div className={cn(centered && "text-center", "mb-12 md:mb-16", className)}>
      {subtitle && (
        <p className="text-primary uppercase tracking-[0.3em] text-xs md:text-sm font-medium mb-3">
          {subtitle}
        </p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
        {title}
      </h2>
      <div className={cn("w-16 h-px bg-primary", centered && "mx-auto")} />
    </div>
  );
};
