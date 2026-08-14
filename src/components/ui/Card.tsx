import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}

export default function Card({ children, className = "", as = "div" }: CardProps) {
  const Comp = as;
  return (
    <Comp
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </Comp>
  );
}
