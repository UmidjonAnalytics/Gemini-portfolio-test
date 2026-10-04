'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function Experience() {
  const [experience, setExperience] = useState<any[]>([]);
  const { language } = useAppStore();
  const dict = getDictionary(language);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'experience'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((e: any) => e.published)
        .sort((a: any, b: any) => a.order - b.order);
      setExperience(data);
    });
    return () => unsub();
  }, []);

  if (experience.length === 0) return null;

  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {dict.experience.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-600 rounded-full mx-auto mt-4"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/50 ml-4 md:ml-0 md:pl-0">
            {experience.map((item, index) => {
              const role = getLocalizedField(item.role, language);
              const desc = getLocalizedField(item.description, language) || '';
              const endDate = item.endDate === 'present' ? dict.experience.present : item.endDate;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mb-12 relative pl-8 md:pl-0"
                >
                  <div className="absolute left-[-9px] md:left-[50%] md:-ml-[9px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-gray-50 dark:border-gray-950 z-10 shadow-sm" />

                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2 font-medium text-sm md:hidden">
                        <Briefcase size={16} />
                        <span>{item.startDate} — {endDate}</span>
                      </div>

                      <div className={`hidden md:flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2 font-medium text-sm ${index % 2 === 0 ? 'justify-end' : ''}`}>
                        <Briefcase size={16} />
                        <span>{item.startDate} — {endDate}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{role}</h3>
                      <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">{item.company}</h4>

                      <div className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap ${index % 2 === 0 ? 'md:text-right' : 'text-left'}`}>
                        {desc.split('\n').map((line, i) => (
                          <div key={i} className={`flex ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                             <span className="mr-2 opacity-50">•</span><span>{line.replace(/^-\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
