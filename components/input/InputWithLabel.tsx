import { cn } from "@/lib/utils";

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  htmlFor: string;
  inputClassName?: string;
}

export const InputWithLabel = ({
  label,
  htmlFor,
  className,
  inputClassName,
  ...props
}: InputWithLabelProps) => {
  return (
    <div className={cn("relative w-full mt-2", className)}>
      <label
        htmlFor={htmlFor}
        className="absolute z-10 -top-2.5 left-8 bg-white px-3 text-base font-light text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      >
        {label}
      </label>
      <input
        id={htmlFor}
        className={cn(
          "w-full h-14.25 max-h-14.25 rounded-[20px] border-[#6D6D6D] border-2 px-4 focus:border-[#6D6D6D] outline-none",
          inputClassName,
        )}
        {...props}
      />
    </div>
  );
};

export default InputWithLabel;
