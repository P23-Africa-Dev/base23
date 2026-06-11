"use client";

import { Button } from "@/components/ui/button";
import images from "@/constants/image";
import { getRandomCompanyDescription } from "@/utils/companyDescriptionTemplates";
import {
  ImageOptimizationError,
  optimizeImageToMaxSize,
  validateImageForOptimization,
} from "@/utils/imageOptimizer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi2";

// StepTwoForm - Company Information
type Step2FormData = {
  company_name: string;
  company_description: string;
  industry: string;
  country: string;
  number_of_employees: string;
  years_of_operation: string;
  year_established: string;
  profile_picture?: File | null;
};

type Step2Props = {
  defaultValues: {
    company_name?: string;
    industry?: string;
    country?: string;
    number_of_employees?: string;
    years_of_operation?: string;
    year_established?: string;
    name?: string;
    offer_value?: string;
  };
  onNext: (data: Step2FormData & { profile_picture: File | null }) => void;
  restoredProfilePic?: File | null;
  restoredProfilePicPreview?: string | null;
};

export default function StepTwoForm({
  defaultValues,
  onNext,
  restoredProfilePic,
  restoredProfilePicPreview,
}: Step2Props) {
  const [preview, setPreview] = useState<string | null>(
    restoredProfilePicPreview || null,
  );
  const [optimizing, setOptimizing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    restoredProfilePic || null,
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  // Calculate year established - use provided value or calculate from years_of_operation
  // This ensures consistency between the description template and the display
  const calculatedYearEstablished = useMemo(() => {
    // If year_established is provided directly, use it
    if (defaultValues.year_established) {
      return defaultValues.year_established;
    }
    // Otherwise, calculate from years_of_operation
    const currentYear = new Date().getFullYear();
    const yearsOp = parseInt(defaultValues.years_of_operation || "") || 0;
    return yearsOp > 0 ? String(currentYear - yearsOp) : undefined;
  }, [defaultValues.year_established, defaultValues.years_of_operation]);

  // Generate a random company description template based on prefill data
  // useMemo ensures the same template is used throughout the component lifecycle
  const defaultDescription = useMemo(() => {
    return getRandomCompanyDescription({
      company_name: defaultValues.company_name,
      industry: defaultValues.industry,
      country: defaultValues.country,
      years_of_operation: defaultValues.years_of_operation,
      year_established: calculatedYearEstablished,
      number_of_employees: defaultValues.number_of_employees,
      name: defaultValues.name,
      offer_value: defaultValues.offer_value,
    });
  }, [defaultValues, calculatedYearEstablished]);

  // Typewriter animation states
  const [fullDescription, setFullDescription] = useState(defaultDescription);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true); // Only animate on initial load and regenerate
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter animation effect - only runs when shouldAnimate is true
  useEffect(() => {
    if (!shouldAnimate) return;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // Reset states
    setDisplayedText("");
    setIsTypingComplete(false);

    let currentIndex = 0;
    const typingSpeed = 15; // milliseconds per character

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullDescription.length) {
        setDisplayedText(fullDescription.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setIsTypingComplete(true);
        setIsRegenerating(false);
        setShouldAnimate(false); // Stop animating after completion
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [fullDescription, shouldAnimate]);

  // Handle regenerate description
  const handleRegenerateDescription = useCallback(() => {
    setIsRegenerating(true);
    setShouldAnimate(true); // Enable animation for regeneration

    const newDescription = getRandomCompanyDescription({
      company_name: defaultValues.company_name,
      industry: defaultValues.industry,
      country: defaultValues.country,
      years_of_operation: defaultValues.years_of_operation,
      year_established: calculatedYearEstablished,
      number_of_employees: defaultValues.number_of_employees,
      name: defaultValues.name,
      offer_value: defaultValues.offer_value,
    });

    setFullDescription(newDescription);
  }, [defaultValues, calculatedYearEstablished]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormData>({
    defaultValues: {
      company_name: defaultValues.company_name || "",
      company_description: defaultDescription,
      industry: defaultValues.industry || "",
      country: defaultValues.country || "",
      number_of_employees: defaultValues.number_of_employees || "",
      years_of_operation: defaultValues.years_of_operation || "",
      year_established: defaultValues.year_established || "",
    },
  });

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

  // Update form value when fullDescription changes
  useEffect(() => {
    setValue("company_description", fullDescription);
  }, [fullDescription, setValue]);

  const companyDescription = watch("company_description");

  const onSubmit = (data: Step2FormData) => {
    // Validate file presence
    if (!selectedFile) {
      setFileError("Profile picture is required");
      scrollToTop();
      return;
    }
    setFileError(null);

    scrollToTop();
    onNext({
      ...data,
      profile_picture: selectedFile,
    });
  };

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={stepContainerRef}
        className="relative z-7 mt-8 h-[1200px]  w-full overflow-hidden p-5 md:mt-5 md:h-[570px] md:overflow-y-auto lg:mt-0 lg:h-auto"
      >
        <div className="mx-auto max-w-[650px]">
          {/* Heading */}
          <div className="mb-10 lg:pt-5">
            <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              About your company
            </h2>
            <p className="max-w-sm pr-5 text-[15px] font-normal text-primary lg:max-w-full lg:text-[17px] dark:text-black">
              This helps members recognize and trust you.
            </p>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mr-2 space-y-7 px-3 md:px-0"
          >
            {/* Profile Picture Upload */}

            <div className="flex w-full max-w-full items-center space-x-4 lg:max-w-md lg:space-x-10">
              <label className="relative flex h-[90px] w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#E2E6E9] lg:w-[118px] lg:max-w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setSelectedFile(null);
                      setPreview(null);
                      setFileError("Profile picture is required");
                      return;
                    }
                    // Validate file type
                    if (!file.type.startsWith("image/")) {
                      setFileError("Only image files are allowed");
                      toast.error("Please select an image file");
                      e.target.value = "";
                      setSelectedFile(null);
                      setPreview(null);
                      return;
                    }

                    // Pre-validate the file before attempting optimization
                    const validation = validateImageForOptimization(file, 5);
                    if (!validation.isValid) {
                      setFileError(validation.error || "Invalid image file");
                      toast.error(validation.error || "Invalid image file");
                      e.target.value = "";
                      setSelectedFile(null);
                      setPreview(null);
                      return;
                    }

                    // If file needs optimization (over 5MB)
                    if (validation.needsOptimization) {
                      setOptimizing(true);
                      toast.dismiss();
                      const progressToastId = toast.loading(
                        "Optimizing large image... This may take a few seconds.",
                        {
                          duration: 30000,
                        },
                      );

                      try {
                        const optimized = await optimizeImageToMaxSize(file, 5);
                        setOptimizing(false);
                        toast.dismiss(progressToastId);
                        toast.success("Image optimized successfully!");
                        setSelectedFile(optimized);
                        setPreview(URL.createObjectURL(optimized));
                        setFileError(null);
                      } catch (error) {
                        setOptimizing(false);
                        toast.dismiss(progressToastId);

                        // Handle specific error types
                        if (error instanceof ImageOptimizationError) {
                          switch (error.code) {
                            case "TOO_LARGE":
                              toast.error(error.message);
                              setFileError(
                                "Image is too large. Maximum size is 20MB.",
                              );
                              break;
                            case "OPTIMIZATION_FAILED":
                              toast.error(
                                "Could not optimize image. Please try a different image.",
                              );
                              setFileError(
                                "Image optimization failed. Try a smaller or less complex image.",
                              );
                              break;
                            default:
                              toast.error(error.message);
                              setFileError(error.message);
                          }
                        } else {
                          toast.error(
                            "Failed to process image. Please try again.",
                          );
                          setFileError("Failed to process image.");
                        }

                        e.target.value = "";
                        setSelectedFile(null);
                        setPreview(null);
                      }
                    } else {
                      // File is already under 5MB, use as-is
                      setSelectedFile(file);
                      setPreview(URL.createObjectURL(file));
                      setFileError(null);
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                {!preview ? (
                  <div className="flex w-full flex-col items-center justify-center">
                    {optimizing ? (
                      <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <img
                        src={images.uploadBg}
                        alt="placeholder"
                        className="h-5 w-5 object-cover"
                      />
                    )}
                    <span className="mt-1 block px-3 text-center text-[7px] text-primary/50 dark:text-black">
                      {optimizing
                        ? "Optimizing image..."
                        : "Click to add profile picture"}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundImage: `url(${preview})`,
                    }}
                    className="h-full w-full bg-cover bg-top bg-no-repeat"
                  ></div>
                )}
              </label>

              <div className="w-full leading-2.5 lg:w-auto">
                <h4 className="mb-2 max-w-full text-[13px] font-semibold text-primary lg:max-w-none lg:font-bold lg:tracking-wide dark:text-black">
                  Add a profile picture
                </h4>
                <p className="text-[10px] leading-3 text-[#8C9AA6] md:text-xs lg:pr-12">
                  Builds trust, personalizes experience, and enhances
                  engagement.
                </p>
                {fileError && (
                  <p className="mt-1 text-xs text-red-500">{fileError}</p>
                )}
              </div>
            </div>

            {/* Company Profile */}
            <div className="relative w-full max-w-[610px] lg:max-w-[620px]">
              <div className="mt-10 mb-5 flex flex-row gap-6 lg:mb-2 lg:flex-row lg:justify-between lg:gap-0">
                <div className="sm:mb-0 lg:mb-4">
                  <h2 className="text-[15.5px] font-bold tracking-wider text-deepBlack lg:text-[14.5px] lg:tracking-wide">
                    Company Name
                  </h2>
                  <p className="text-[12px] font-normal tracking-wider text-[#8C9AA6]">
                    {defaultValues.company_name || "Not provided"}
                  </p>
                </div>
                <div className="flex flex-col text-left lg:w-[180px]">
                  <h2 className="text-[15.5px] font-bold tracking-wider text-darkBlue lg:tracking-wide">
                    Industry
                  </h2>
                  <p className="text-[12px] font-normal tracking-wider text-[#8C9AA6]">
                    {defaultValues.industry || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-8 pb-4 lg:flex-row">
                <div className="w-full">
                  <h2 className="mb-2 text-[16.5px] font-bold tracking-wider text-deepBlack lg:text-[14.5px] lg:tracking-wide">
                    About Company
                  </h2>
                  <div className="relative no-scrollbar h-[200px] w-full rounded-lg border border-[#8C9AA6] leading-relaxed lg:h-[210px] lg:w-[90%] lg:max-w-sm">
                    {/* Hidden input for form submission */}
                    <input type="hidden" {...register("company_description")} />
                    {/* Typewriter animation textarea */}
                    <textarea
                      value={displayedText}
                      onChange={(e) => {
                        // User is editing - update text without triggering animation
                        setDisplayedText(e.target.value);
                        setValue("company_description", e.target.value);
                        setIsTypingComplete(true);
                        setShouldAnimate(false); // Prevent animation on user edit
                      }}
                      placeholder="Tell us about your company..."
                      className="no-scrollbar h-[180px] w-full resize-none px-4 py-4 pb-10 text-[12px] leading-4 font-normal text-darkBlue outline-none lg:pr-3 lg:text-[12px] lg:leading-5 lg:font-light"
                    />
                    {/* Rewrite button inside textarea */}
                    <button
                      type="button"
                      onClick={handleRegenerateDescription}
                      disabled={isRegenerating || !isTypingComplete}
                      className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-white/80 px-2 py-1 text-[10px] text-primary/60 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      title="Regenerate description"
                    >
                      <HiOutlineSparkles
                        className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`}
                      />
                      <span>Rewrite</span>
                    </button>
                    {/* Typing cursor indicator */}
                    {!isTypingComplete && (
                      <span className="absolute bottom-3 left-4 inline-block h-4 w-[2px] animate-pulse bg-primary" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-5 lg:gap-8">
                  <div className="flex flex-col text-left lg:text-left">
                    <h2 className="text-[15.5px] font-bold tracking-wider whitespace-nowrap text-darkBlue lg:text-[14.5px]">
                      Company's Address
                    </h2>
                    <p className="text-[12px] font-normal text-[#8C9AA6]">
                      {defaultValues.country || "Not provided"}
                    </p>
                  </div>
                  <div className="flex flex-col text-left lg:text-left">
                    <h2 className="text-[15.5px] font-bold tracking-wider whitespace-nowrap text-darkBlue lg:text-[14.5px]">
                      Numbers of Employee
                    </h2>
                    <p className="text-[12px] font-normal text-[#8C9AA6]">
                      {defaultValues.number_of_employees || "Not provided"}
                    </p>
                  </div>
                  <div className="flex flex-col text-left lg:text-left">
                    <h2 className="text-[15.5px] font-bold tracking-wider text-darkBlue lg:text-[14.5px]">
                      Year Founded
                    </h2>
                    <p className="text-[12px] font-normal text-[#8C9AA6]">
                      {calculatedYearEstablished || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                  fontSize: "12px",
                },
                success: {
                  duration: 4000,
                  style: {
                    background: "#031c5b",
                    fontSize: "12px",
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: "#ef4444",
                    fontSize: "12px",
                  },
                },
              }}
            />

            {/* Submit */}
            <div className="mt-20 flex flex-col items-center lg:-mt-3 lg:w-[440px]">
              <Button
                type="submit"
                className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90"
              >
                Proceed
              </Button>
            </div>
          </form>

          {/* Login/Signups */}
          <div className="mt-10 -ml-12 w-[400px] px-4 text-left lg:hidden lg:px-0">
            <p className="mb-1 pl-10 text-sm font-extralight">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold text-deepBlack italic hover:underline dark:text-deepBlack"
              >
                Sign In
              </a>
            </p>
            <p className="pl-10 text-sm">
              <a
                href="/help"
                className="font-bold text-deepBlack italic hover:underline dark:text-deepBlack"
              >
                Need Help?
              </a>
            </p>
          </div>
        </div>
      </div>

      <img
        src={images.bottomFormBgP}
        className="absolute md:hidden top-[58%] z-2 h-auto w-full object-cover"
        alt=""
      />
    </div>
  );
}
