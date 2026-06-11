import type { Variants } from 'framer-motion';

export const slideEditContainerRightVariants: Variants = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.15 } },
};

export const singleSlideFadeVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
    exit: { opacity: 0, y: 40, transition: { duration: 0.25 } },
};
