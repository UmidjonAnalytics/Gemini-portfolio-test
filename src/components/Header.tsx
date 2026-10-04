'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dict = getDictionary(language);

  const [sections, setSections] = useState({
    projects: false,
    experience: false,
    certificates: false,
    education: false,
    skills: false,
    testimonials: false,
  });

  const [settings, setSettings] = useState<any>({ sections: {} });

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Listeners for content presence
    const unsubProjects = onSnapshot(collection(db, 'projects'), snap =>
      setSections(prev => ({ ...prev, projects: snap.docs.filter(d => d.data().published).length > 0 })));
    const unsubExperience = onSnapshot(collection(db, 'experience'), snap =>
      setSections(prev => ({ ...prev, experience: snap.docs.filter(d => d.data().published).length > 0 })));
    const unsubCertificates = onSnapshot(collection(db, 'certificates'), snap =>
      setSections(prev => ({ ...prev, certificates: snap.docs.filter(d => d.data().published).length > 0 })));
    const unsubEducation = onSnapshot(collection(db, 'education'), snap =>
      setSections(prev => ({ ...prev, education: snap.docs.filter(d => d.data().published).length > 0 })));
    const unsubSkills = onSnapshot(collection(db, 'skills'), snap =>
      setSections(prev => ({ ...prev, skills: snap.docs.filter(d => d.data().published).length > 0 })));
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), snap =>
      setSections(prev => ({ ...prev, testimonials: snap.docs.filter(d => d.data().published).length > 0 })));

    // Listener for manual section toggles
    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), doc => {
      if (doc.exists()) setSettings(doc.data());
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubProjects(); unsubExperience(); unsubCertificates();
      unsubEducation(); unsubSkills(); unsubTestimonials(); unsubSettings();
    };
  }, []);

  const navLinks = [
    { id: 'about', label: dict.about.title, show: settings.sections?.about !== false },
    { id: 'skills', label: dict.nav.skills, show: sections.skills && settings.sections?.skills !== false },
    { id: 'projects', label: dict.nav.projects, show: sections.projects && settings.sections?.projects !== false },
    { id: 'experience', label: dict.nav.experience, show: sections.experience && settings.sections?.experience !== false },
    { id: 'education', label: dict.nav.education, show: sections.education && settings.sections?.education !== false },
    { id: 'certificates', label: dict.nav.certificates, show: sections.certificates && settings.sections?.certificates !== false },
    { id: 'testimonials', label: dict.nav.testimonials, show: sections.testimonials && settings.sections?.testimonials !== false },
    { id: 'contact', label: dict.nav.contact, show: settings.sections?.contact !== false },
  ].filter(link => link.show);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleLanguage = () => {
    const langs: ('en'|'ru'|'uz')[] = ['en', 'ru', 'uz'];
    const nextIdx = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIdx]);
  };

  if (!mounted) return null;

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Portfolio<span className="text-indigo-600 dark:text-indigo-400">.</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-3 border-l pl-6 border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleLanguage}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                title="Switch Language"
              >
                <Globe size={18} className="mr-1" />
                {language.toUpperCase()}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={cn(
        'fixed inset-0 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out md:hidden pt-20',
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full p-6">
          <ul className="space-y-6 flex-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={toggleLanguage}
              className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-6"
            >
              <Globe size={24} className="mr-3" />
              Language: {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
