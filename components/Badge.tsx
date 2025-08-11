import { ReactNode } from "react";

type Variant = "green" | "red" | "orange" | "gray" | "blue" | "neutral";

const variantToClass: Record<Variant, string> = {
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  orange: "bg-amber-100 text-amber-800",
  gray: "bg-gray-100 text-gray-800",
  blue: "bg-blue-100 text-blue-800",
  neutral: "bg-black/10 text-black/80 dark:bg-white/10 dark:text-white/80",
};

export default function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: Variant }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${variantToClass[variant]}`}>{children}</span>;
}


