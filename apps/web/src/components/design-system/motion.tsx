'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { motion as motionTokens } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type MotionWrapperProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  delay?: number;
  children?: React.ReactNode;
};

export function FadeIn({ children, className, delay = 0, ...props }: MotionWrapperProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.normal, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: motionTokens.normal } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleOnHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: motionTokens.fast }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
