"use client";

import { Button } from "@/components/ui/button";
import { StepThreeData, stepThreeSchema } from "@/constants/formSchema";
import images from "@/constants/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

interface StepThreeProps {
  defaultValues?: Partial<StepThreeData>;
  onNext: (data: StepThreeData) => void;
}

const sampleTags = [
  { label: "Business Strategy", value: "business_strategy" },
  { label: "Sales Skills", value: "sales_skills" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Leadership", value: "leadership" },
  { label: "Market Research", value: "market_research" },
  { label: "Critical Thinking", value: "critical_thinking" },
  { label: "Problem Solving", value: "problem_solving" },
  { label: "Idea Generation", value: "idea_generation" },
  { label: "Team Management", value: "team_management" },
];

export default function StepThreeForm({
  defaultValues,
  onNext,
}: StepThreeProps) {
  // Payment modal removed - subscription happens on dashboard after user is authenticated
  // const [showPaymentModal, setShowPaymentModal] = useState(false);

  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = useCallback(() => {
    // Scroll container (mobile)
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Fallback (desktop / window scroll)
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: defaultValues as StepThreeData,
  });

  const greatAtSelected = watch("great_at") || [];
  const helpWithSelected = watch("can_help_with") || [];

  const toggleTag = (field: "great_at" | "can_help_with", value: string) => {
    const selected = field === "great_at" ? greatAtSelected : helpWithSelected;
    if (selected.includes(value)) {
      setValue(
        field,
        selected.filter((v) => v !== value),
      );
    } else if (selected.length < 3) {
      setValue(field, [...selected, value]);
    }
  };

  // Directly proceed to registration - payment/subscription will be on dashboard
  const onSubmit = (data: StepThreeData) => {
    scrollToTop();

    onNext(data);
  };

  return (
    <>
      <div className="overflow-hidden w-full ">
        <div
          ref={stepContainerRef}
          className="relative z-7 mt-8 h-[1200px] w-full overflow-hidden md:overflow-y-auto p-5 md:mt-5 md:h-[870px]  lg:h-full lg:mt-0 "
        >
          <div className="relative  mx-auto max-w-md xl:max-w-[650px]">
            {/* Heading */}
            <div className="mb-4">
              <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
                Industry of operations
              </h2>
              <p className="pr-6 text-[14px] font-normal text-primary lg:text-[17px] dark:text-black">
                We’ll use this to find your ideal candidate.
              </p>
            </div>

            <div className="w-full xl:max-w-[590px]">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mr-6 space-y-6 lg:mr-0"
              >
                {/* I'm great at */}
                <div className="space-y-3 py-2">
                  <h4 className="mb-2 text-base font-bold dark:text-black">
                    Select Industry
                  </h4>

                  <div className="-ml-1.5 no-scrollbar flex max-h-[40vh] flex-wrap gap-3 overflow-y-auto py-2">
                    {sampleTags.map((tag) => {
                      const isSelected = greatAtSelected.includes(tag.value);
                      const disableRest =
                        greatAtSelected.length >= 3 && !isSelected;

                      return (
                        <button
                          type="button"
                          key={tag.value}
                          onClick={() => toggleTag("great_at", tag.value)}
                          className={`flex items-center justify-center space-x-2 rounded-3xl px-2 py-2 pr-3 xl:pr-6 xl:pl-4 font-GtrialsTh text-[14px] tracking-wide transition-all duration-200 md:px-10 lg:text-base ${
                            isSelected
                              ? "bg-[#2ABFBB] font-bold text-secondaryWhite shadow-[0px_4px_2px_-1px_rgba(0,0,0,0.12),0px_4px_0px_-1px_rgba(0,0,0,0.12)]"
                              : "font-semibold text-[#0B1727]/60 shadow-md"
                          } ${disableRest ? "pointer-events-none opacity-40 blur-[1px]" : ""}`}
                        >
                          <img
                            src={
                              isSelected ? images.checkedBadge : images.badge
                            }
                            alt=""
                            className="h-7 w-7"
                          />
                          <span className="whitespace-wrap">{tag.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {errors.great_at && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.great_at.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="mt-13 flex flex-col items-center lg:mt-0 lg:w-[400px]">
                  <Button
                    type="submit"
                    className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90"
                  >
                    Proceed
                  </Button>

                  <div className="mt-4 self-start text-left text-primary md:hidden lg:px-0">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <a
                        href="/login"
                        className="font-bold text-primary italic hover:underline"
                      >
                        Sign In
                      </a>
                    </p>
                    <span className="text-sm text-primary">
                      <a
                        href="/help"
                        className="font-bold text-primary italic hover:underline"
                      >
                        Need Help?
                      </a>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <img
          src={images.bottomFormBgP}
          className="absolute md:hidden  top-[60%] z-2 h-auto w-full object-cover"
          alt=""
        />
      </div>
    </>
  );
}
