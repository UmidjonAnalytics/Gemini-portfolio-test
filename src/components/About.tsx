'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { MapPin, Globe2, Briefcase } from 'lucide-react';

export default function About() {
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

  if (settings?.sections?.about === false) return null;
  if (loading || !profile) return null;

  const bio = getLocalizedField(profile.bio, language) || '';
  const location = getLocalizedField(profile.location, language) || '';

  const getAvailabilityInfo = () => {
    switch(profile.availability) {
      case 'open':
        return { text: dict.about.openToWork, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' };
      case 'freelance':
        return { text: dict.about.freelance, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' };
      case 'busy':
        return { text: dict.about.notAvailable, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-500' };
      default:
        return null;
    }
  };

  const availability = getAvailabilityInfo();

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {dict.about.title}
            </h2>
            <div className="w-16 h-1 bg-indigo-600 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">

            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap mb-10">
              {bio as any}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">

              {location && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dict.about.location}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{location}</p>
                  </div>
                </div>
              )}

              {profile.languages && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Globe2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dict.about.languages as any}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile.languages}</p>
                  </div>
                </div>
              )}

              {availability && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dict.about.availability}</p>
                    <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availability.color}`}>
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${availability.dot}`}></span>
                      {availability.text}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
