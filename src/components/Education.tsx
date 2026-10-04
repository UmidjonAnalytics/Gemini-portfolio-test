'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function Education() {
  const [education, setEducation] = useState<any[]>([]);
  const { language } = useAppStore();
  const dict = getDictionary(language);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'education'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((e: any) => e.published)
        .sort((a: any, b: any) => a.order - b.order);
      setEducation(data);
    });
    return () => unsub();
  }, []);

  if (education.length === 0) return null;

  return (
    <section id="education" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {dict.education.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-600 rounded-full mx-auto mt-4"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {education.map((item, index) => {
            const institution = getLocalizedField(item.institution, language);
            const degree = getLocalizedField(item.degree, language);
            const field = getLocalizedField(item.field, language);
            const endDate = item.endDate === 'present' ? dict.experience.present : item.endDate;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <GraduationCap size={28} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {institution}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 mt-2 sm:mt-0 rounded-full text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {item.startDate} — {endDate}
                    </span>
                  </div>

                  <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                    {degree}
                  </div>

                  {field && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {field}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
