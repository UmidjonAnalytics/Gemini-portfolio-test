'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const { language } = useAppStore();
  const dict = getDictionary(language);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((t: any) => t.published)
        .sort((a: any, b: any) => a.order - b.order);
      setTestimonials(data);
    });
    return () => unsub();
  }, []);

  if (testimonials.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">

        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {dict.testimonials.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-600 rounded-full mx-auto mt-4"></div>
        </div>

        <div className="max-w-4xl mx-auto relative">

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 text-indigo-100 dark:text-indigo-900/30 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <Quote size={120} className="rotate-180" />
          </div>
          <div className="absolute bottom-0 right-0 text-indigo-100 dark:text-indigo-900/30 transform translate-x-1/2 translate-y-1/4 z-0">
            <Quote size={120} />
          </div>

          <div className="relative z-10 bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-white dark:border-gray-700 shadow-md relative bg-gray-200 dark:bg-gray-700">
                  {current.avatarUrl ? (
                    <Image src={current.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                      {current.name.charAt(0)}
                    </div>
                  )}
                </div>

                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-8 italic">
                  &quot;{getLocalizedField(current.text, language)}&quot;
                </p>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{current.name}</h4>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-1">
                    {getLocalizedField(current.role, language)}
                    {current.company && <span className="text-gray-500 dark:text-gray-400">, {current.company}</span>}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-10">
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition-colors shadow-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex space-x-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300 dark:bg-gray-600'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition-colors shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
