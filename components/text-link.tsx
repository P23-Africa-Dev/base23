import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({
  className = "",
  children,
  ...props
}: LinkProps) {
  return (
    <Link
      className={cn(
        "font-semibold text-[16px] italic text-[#0B1727] decoration-neutral-300 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
