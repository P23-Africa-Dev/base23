import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onClick"
> {
  onClick?: (checked: boolean) => void;
}

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2 text-[16px] font-medium text-[#0B1727]">
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={props.checked}
          onClick={() => props.onClick && props.onClick(!props.checked)}
          className={cn(
            "h-4.5 w-4.5 border-2 border-black accent-deepBlack dark:accent-white",
            className,
          )}
        />
        {props.children}
      </label>
    </div>
  );
};
