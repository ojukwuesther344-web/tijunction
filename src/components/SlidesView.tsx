/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface SlidesViewProps {
  onComplete: () => void;
}

const ONBOARDING_SLIDES = [
  {
    title: "Take Pictures.\nMake Memories.",
    highlight: "Take Pictures.",
    description: "We believe your college or university memories are important to you.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&h=500&q=80",
    color: "from-cyan-400 to-sky-500"
  },
  {
    title: "Save Pictures.\nSave Memories.",
    highlight: "Save Pictures.",
    description: "We believe in making & saving beautiful memories together on campus.",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&h=500&q=80",
    color: "from-sky-400 to-blue-500"
  },
  {
    title: "Privacy Protection\nis our First Priority.",
    highlight: "Privacy Protection",
    description: "Our Priority is your privacy. Your images are safe and private.",
    image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=500&h=500&q=80",
    color: "from-blue-400 to-indigo-500"
  },
  {
    title: "Free Unlimited\nStorage Space.",
    highlight: "Free Unlimited",
    description: "We offer free unlimited storage space to save your university memories.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=500&h=500&q=80",
    color: "from-cyan-400 to-blue-600"
  }
];

export default function SlidesView({ onComplete }: SlidesViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white p-6 relative overflow-hidden">
      {/* Wave shape overlay at top mimicking screenshot */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-sky-100 to-transparent -z-10 rounded-b-[40px]"></div>

      {/* Header Skip Link */}
      <div className="flex justify-end p-2 mt-2">
        <button 
          id="skip-onboarding-btn"
          onClick={onComplete}
          className="text-sm font-semibold text-slate-400 hover:text-cyan-500 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Round circular frame with unique borders */}
            <div className={`relative w-64 h-64 rounded-full p-2 bg-gradient-to-br ${currentSlide.color} shadow-xl mb-8 overflow-hidden`}>
              <img 
                src={currentSlide.image} 
                alt="Onboarding" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight whitespace-pre-line leading-snug">
              {currentSlide.title}
            </h2>
            
            <p className="text-slate-500 font-medium text-sm mt-4 px-6 leading-relaxed">
              {currentSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Indicators and Actions */}
      <div className="flex flex-col items-center gap-6 max-w-sm mx-auto w-full mb-6">
        {/* Carousel indicators */}
        <div id="carousel-dots" className="flex items-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-cyan-500' : 'w-2.5 bg-slate-200'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Circular Next Button */}
        <button
          id="next-slide-btn"
          onClick={handleNext}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-cyan-400/30 hover:scale-105 transition-transform"
        >
          <ChevronRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
