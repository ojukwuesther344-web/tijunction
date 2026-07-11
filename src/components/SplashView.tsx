/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div id="splash-screen" className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-sky-100/40 p-8 relative overflow-hidden">
      {/* Decorative Cyan Waves at standard frame placement */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/30 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
      
      <div></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <Logo size="lg" className="mb-4" />
        <p className="text-slate-500 font-medium text-sm mt-3 tracking-wide">
          Connect • Share • Belong.
        </p>
      </motion.div>

      {/* Modern pulsing loading ring conforming to minimal mobile aesthetics */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-100 border-t-cyan-500 animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium font-mono">v1.2.0 • Sandbox</span>
      </div>
    </div>
  );
}
