"use client";

import { Button } from "@/components/ui/button";
import images from "@/constants/image";
import { Check } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type CompanyQuestionsData = {
  business_based: string;
  number_of_employees: string;
  hiring_field_sales: string;
  budget_per_hire: string;
};

type QuestionKey = keyof CompanyQuestionsData;

const QUESTIONS: {
  key: QuestionKey;
  question: string;
  options: string[];
}[] = [
  {
    key: "business_based",
    question: "Where is your business based?",
    options: ["In Africa", "Outside Africa", "Both"],
  },
  {
    key: "number_of_employees",
    question: "How many employees does your business have?",
    options: ["Fewer than 15", "15 to 29", "30 to 50", "50 to 100", "Over 100"],
  },
  {
    key: "hiring_field_sales",
    question:
      "Are you actively looking to hire on-the-ground field sales people in Africa?",
    options: ["Yes", "No"],
  },
  {
    key: "budget_per_hire",
    question: "What is your approximate budget per hire?",
    options: ["Below $500", "$500 and above"],
  },
];

type CompanyStepTwoProps = {
  defaultValues?: Partial<CompanyQuestionsData>;
  onNext: (data: CompanyQuestionsData) => void;
};

export default function CompanyStepTwoForm({
  defaultValues,
  onNext,
}: CompanyStepTwoProps) {
  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Partial<CompanyQuestionsData>>(
    defaultValues ?? {},
  );

  const scrollToTop = useCallback(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop, current]);

  const question = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const selected = answers[question.key];

  const selectOption = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: option }));
  };

  const handleProceed = () => {
    if (!selected) return;
    if (isLast) {
      onNext(answers as CompanyQuestionsData);
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div
        ref={stepContainerRef}
        className="relative z-7 mt-6 w-full overflow-x-hidden p-5 pb-48 md:mt-11 md:h-167.5 md:overflow-y-auto md:pb-5 lg:mt-3 lg:h-auto"
      >
        <div className="mx-auto max-w-md xl:max-w-162.5">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="mb-6 max-w-sm text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              Provide Response Appropriately
            </h2>

            {/* Question indicator */}
            <div className="flex items-center gap-3">
              {QUESTIONS.map((q, index) => {
                const isReached = index <= current;
                return (
                  <span
                    key={q.key}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      isReached
                        ? "bg-pinkLight text-white"
                        : "bg-gray text-grayLight"
                    }`}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-base font-light text-grayLight">
              Question {current + 1}/{QUESTIONS.length}
            </p>
          </div>

          {/* Question */}
          <p className="mb-8 max-w-sm text-lg text-primary dark:text-black">
            {question.question}
          </p>

          {/* Options */}
          <div
            className={`grid gap-6 ${
              question.options.length > 2
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {question.options.map((option) => {
              const isSelected = selected === option;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => selectOption(option)}
                  className={`relative rounded-2xl bg-white px-4 py-8 sm:py-10 text-center transition-all duration-200 ${
                    isSelected
                      ? "shadow-[0px_4px_20px_0px_#2ABFBB40]"
                      : "shadow-[0px_3px_10px_0px_#21212133]"
                  }`}
                >
                  <span
                    className={`text-base font-bold ${
                      isSelected ? "text-pinkLight" : "text-deepBlack"
                    }`}
                  >
                    {option}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-pinkLight">
                      <Check className="h-5 w-5 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <div className="mt-12 md:mt-20 flex flex-col items-center">
            <Button
              type="button"
              onClick={handleProceed}
              disabled={!selected}
              className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90 disabled:opacity-60"
            >
              {isLast ? "Proceed" : "Next"}
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

      <Image
        src={images.bottomFormBgP}
        className="absolute top-[60%] z-2 h-auto w-full object-cover md:hidden"
        fill
        alt=""
      />
    </div>
  );
}
