// Animation utilities for MovieMuse
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleOnHover = {
  whileHover: { scale: 1.05 },
  transition: { duration: 0.2 }
};

export const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.6 }
};

export const glowEffect = {
  boxShadow: [
    '0 0 20px rgba(308, 56%, 85%, 0.3)',
    '0 0 40px rgba(308, 56%, 85%, 0.6)',
    '0 0 20px rgba(308, 56%, 85%, 0.3)'
  ],
  transition: {
    boxShadow: { 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};