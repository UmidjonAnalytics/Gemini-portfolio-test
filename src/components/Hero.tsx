'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { FileDown, ArrowRight, Mail } from 'lucide-react';
import Image from 'next/image';

const TypeWriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50); // Typing speed

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}<span className="animate-pulse">|</span></span>;
};

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
  if (!value || value <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700"
    >
      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
        {value}+
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
        {label}
      </div>
    </motion.div>
  );
};

export default function Hero() {
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const { language } = useAppStore();
  const dict = getDictionary(language);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (doc) => {
      if (doc.exists()) setProfile(doc.data());
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    });

    return () => { unsubProfile(); unsubSettings(); };
  }, []);

  if (settings?.sections?.hero === false) return null;
  if (loading) return <div className="h-screen animate-pulse bg-gray-100 dark:bg-gray-900"></div>;
  if (!profile) return null;

  const title = getLocalizedField(profile.title, language) || '';
  const tagline = getLocalizedField(profile.tagline, language) || '';

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">{profile.name}</span>
              </h1>

              <div className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium mb-6 h-8">
                <TypeWriter text={title} />
              </div>

              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                {tagline}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center group"
                >
                  {dict.hero.viewProjects}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                {profile.cvUrl && (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full transition-all flex items-center justify-center"
                  >
                    <FileDown size={18} className="mr-2" />
                    {dict.hero.downloadCv}
                  </a>
                )}

                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto p-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Contact"
                >
                  <Mail size={20} />
                </button>
              </div>
            </motion.div>

            {/* Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto lg:mx-0">
              <AnimatedCounter value={profile.counters?.projects} label={dict.hero.projectsCompleted} />
              <AnimatedCounter value={profile.counters?.experienceYears} label={dict.hero.yearsExperience} />
              <AnimatedCounter value={profile.counters?.tools} label={dict.hero.toolsMastered} />
              <AnimatedCounter value={profile.counters?.students} label={dict.hero.studentsTaught} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 max-w-md w-full"
          >
            <div className="relative aspect-square rounded-full overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl">
              {profile.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900 dark:to-gray-800 flex items-center justify-center">
                  <svg className="w-1/2 h-1/2 text-indigo-300 dark:text-indigo-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
