import { Button } from "@/components/ui/button";
import images from "@/constants/image";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface StepThreeProps {
  defaultValues?: { great_at?: string[]; can_help_with?: string[] };
  onNext: (data: { great_at: string[]; can_help_with: string[] }) => void;
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
  const router = useRouter();
  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = useCallback(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  const [greatAtSelected, setGreatAtSelected] = useState<string[]>(
    defaultValues?.great_at ?? [],
  );
  const [helpWithSelected, setHelpWithSelected] = useState<string[]>(
    defaultValues?.can_help_with ?? [],
  );

  const toggleTag = (field: "great_at" | "can_help_with", value: string) => {
    const selected = field === "great_at" ? greatAtSelected : helpWithSelected;
    const set = field === "great_at" ? setGreatAtSelected : setHelpWithSelected;
    if (selected.includes(value)) {
      set(selected.filter((v) => v !== value));
    } else if (selected.length < 3) {
      set([...selected, value]);
    }
  };

  const handleProceed = () => {
    scrollToTop();
    onNext({ great_at: greatAtSelected, can_help_with: helpWithSelected });
    router.push("/dashboard");
  };

  return (
    <>
      <div className="overflow-hidden w-full ">
        <div
          ref={stepContainerRef}
          className="relative z-7 mt-8 h-300 w-full overflow-hidden md:overflow-y-auto p-5 md:mt-5 md:h-217.5 lg:h-full lg:mt-0 "
        >
          <div className="relative  mx-auto max-w-md xl:max-w-162.5">
            {/* Heading */}
            <div className="mb-4">
              <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
                Industry of operations
              </h2>
              <p className="pr-6 text-[14px] font-normal text-primary lg:text-[17px] dark:text-black">
                We’ll use this to find your ideal candidate.
              </p>
            </div>

            <div className="w-full xl:max-w-147.5">
              <div className="mr-6 space-y-6 lg:mr-0">
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
                          className={`flex items-center justify-center space-x-2 rounded-[20px] px-2 py-2 pr-3 xl:pr-6 xl:pl-4 font-GtrialsTh text-[14px] tracking-wide transition-all duration-200 md:px-10 lg:text-base shadow-[0px_3px_2px_0px_#21212133] ${
                            isSelected
                              ? "bg-[#2ABFBB] font-bold text-secondaryWhite"
                              : "font-semibold text-[#0B1727]/60 shadow-md bg-white"
                          } ${disableRest ? "pointer-events-none opacity-40 blur-[1px]" : ""}`}
                        >
                          <Image
                            src={
                              isSelected ? images.checkedBadge : images.badge
                            }
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7"
                          />
                          <span className="whitespace-wrap">{tag.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="h-16 lg:h-6" />
                <div className="flex flex-col items-center lg:w-100">
                  <Button
                    type="button"
                    onClick={handleProceed}
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
              </div>
            </div>
          </div>
        </div>

        <Image
          src={images.bottomFormBgP}
          fill
          className="absolute md:hidden  top-[60%] z-2 h-auto w-full object-cover"
          alt=""
        />
      </div>
    </>
  );
}
