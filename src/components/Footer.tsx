'use client';

import { useAppStore } from '@/store/useStore';
import { getDictionary } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, MessageCircle } from 'lucide-react';
import { FaGithub as Github, FaLinkedin as Linkedin } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  const { language } = useAppStore();
  const dict = getDictionary(language);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'profile', 'main'));
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    };
    fetchProfile();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">

          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {profile?.name || 'Data Analyst'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} {profile?.name}. {dict.footer.rights}
            </p>
          </div>

          <div className="flex space-x-6">
            {profile?.socials?.github && (
              <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            )}
            {profile?.socials?.linkedin && (
              <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            )}
            {profile?.socials?.telegram && (
              <a href={profile.socials.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0088cc] dark:hover:text-[#0088cc] transition-colors" aria-label="Telegram">
                <MessageCircle size={20} />
              </a>
            )}
            {profile?.socials?.email && (
              <a href={`mailto:${profile.socials.email}`} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
            )}
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
