import { motion, AnimatePresence, Variants } from 'framer-motion';
import React, { ReactNode } from 'react';

// ============================================
// Animation Variants
// ============================================

// Fade animations
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } }
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

// Scale animations
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Slide animations
export const slideInFromLeft: Variants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.3 } }
};

export const slideInFromRight: Variants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.3 } }
};

export const slideInFromBottom: Variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.3 } }
};

// Container variants for staggered children
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

export const staggerContainerSlow: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

// Card item variants (for use with staggerContainer)
export const cardItem: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

export const listItem: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// Hover animations for cards
export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' as const }
};

export const hoverLift = {
    y: -4,
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
    transition: { duration: 0.2, ease: 'easeOut' as const }
};

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 }
};

// ============================================
// Animation Components
// ============================================

interface AnimatedProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

// Fade In Component
export const FadeIn = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Fade In Up Component
export const FadeInUp = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeInUp}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Fade In Down Component  
export const FadeInDown = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeInDown}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Scale In Component
export const ScaleIn = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={scaleIn}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Pop In Component (with spring)
export const PopIn = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={popIn}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Slide In From Left
export const SlideInLeft = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={slideInFromLeft}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Slide In From Right
export const SlideInRight = ({ children, className = '', delay = 0 }: AnimatedProps) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={slideInFromRight}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);

interface StaggerContainerProps extends AnimatedProps {
    staggerSpeed?: 'fast' | 'normal' | 'slow';
}

// Stagger Container for child animations
export const StaggerContainer = ({
    children,
    className = '',
    staggerSpeed = 'normal'
}: StaggerContainerProps) => {
    const variants = staggerSpeed === 'fast'
        ? staggerContainerFast
        : staggerSpeed === 'slow'
            ? staggerContainerSlow
            : staggerContainer;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Animated Card with hover effects
interface AnimatedCardProps extends AnimatedProps {
    onClick?: () => void;
    hoverEffect?: 'scale' | 'lift' | 'both' | 'none';
}

export const AnimatedCard = ({
    children,
    className = '',
    onClick,
    hoverEffect = 'scale'
}: AnimatedCardProps) => {
    const getWhileHover = () => {
        switch (hoverEffect) {
            case 'scale': return hoverScale;
            case 'lift': return hoverLift;
            case 'both': return { ...hoverScale, ...hoverLift };
            default: return {};
        }
    };

    return (
        <motion.div
            variants={cardItem}
            whileHover={getWhileHover()}
            whileTap={tapScale}
            onClick={onClick}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Animated List Item
export const AnimatedListItem = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        variants={listItem}
        className={className}
    >
        {children}
    </motion.div>
);

// Page transition wrapper
export const PageTransition = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

// Modal/Overlay animation wrapper
export const ModalAnimation = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// Backdrop animation for modals
export const BackdropAnimation = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
    >
        {children}
    </motion.div>
);

// Counter animation (for stats)
interface CounterAnimationProps {
    value: number;
    duration?: number;
    className?: string;
}

export const CounterAnimation = ({ value, duration = 2, className = '' }: CounterAnimationProps) => {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
        >
            <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {value.toLocaleString()}
            </motion.span>
        </motion.span>
    );
};

// Floating animation for decorative elements
export const FloatingElement = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        animate={{
            y: [0, -10, 0],
        }}
        transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// Pulse animation for attention-grabbing elements
export const PulseElement = ({ children, className = '' }: AnimatedProps) => (
    <motion.div
        animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// Shimmer/Skeleton loading animation
export const ShimmerLoader = ({ className = '' }: { className?: string }) => (
    <motion.div
        animate={{
            backgroundPosition: ['200% 0', '-200% 0']
        }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
        }}
        className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
    />
);

export default {
    FadeIn,
    FadeInUp,
    FadeInDown,
    ScaleIn,
    PopIn,
    SlideInLeft,
    SlideInRight,
    StaggerContainer,
    AnimatedCard,
    AnimatedListItem,
    PageTransition,
    ModalAnimation,
    BackdropAnimation,
    CounterAnimation,
    FloatingElement,
    PulseElement,
    ShimmerLoader,
    // Variants for direct use with motion components
    fadeIn,
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    popIn,
    slideInFromLeft,
    slideInFromRight,
    slideInFromBottom,
    staggerContainer,
    staggerContainerFast,
    staggerContainerSlow,
    cardItem,
    listItem,
    hoverScale,
    hoverLift,
    tapScale
};
