'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FolderOpen,
  Award,
  MessageSquare,
  CheckCircle2,
  CircleDashed,
  Wrench,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    certificates: 0,
    messages: 0,
    skills: 0,
    experience: 0,
    education: 0,
  });

  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      setStats(prev => ({ ...prev, projects: snap.docs.filter(d => d.data().published).length }));
    });

    const unsubCertificates = onSnapshot(collection(db, 'certificates'), (snap) => {
      setStats(prev => ({ ...prev, certificates: snap.docs.filter(d => d.data().published).length }));
    });

    const unsubMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      setStats(prev => ({ ...prev, messages: snap.docs.filter(d => !d.data().read).length }));
    });

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      setStats(prev => ({ ...prev, skills: snap.docs.filter(d => d.data().published).length }));
    });

    const unsubExperience = onSnapshot(collection(db, 'experience'), (snap) => {
      setStats(prev => ({ ...prev, experience: snap.docs.filter(d => d.data().published).length }));
    });

    const unsubEducation = onSnapshot(collection(db, 'education'), (snap) => {
      setStats(prev => ({ ...prev, education: snap.docs.filter(d => d.data().published).length }));
    });

    const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (doc) => {
      setProfileExists(doc.exists());
      setLoading(false);
    });

    return () => {
      unsubProjects();
      unsubCertificates();
      unsubMessages();
      unsubSkills();
      unsubExperience();
      unsubEducation();
      unsubProfile();
    };
  }, []);

  const checklist = [
    { name: 'Complete Profile', done: profileExists, href: '/admin/profile' },
    { name: 'Add Skills', done: stats.skills > 0, href: '/admin/skills' },
    { name: 'Add a Project', done: stats.projects > 0, href: '/admin/projects' },
    { name: 'Add Experience', done: stats.experience > 0, href: '/admin/experience' },
    { name: 'Add Education', done: stats.education > 0, href: '/admin/education' },
  ];

  const completedCount = checklist.filter(item => item.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  if (loading) {
    return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published Projects</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.projects}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificates</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.certificates}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread Messages</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.messages}</p>
          </div>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completeness</h2>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="space-y-3">
          {checklist.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group"
            >
              <div className="flex items-center space-x-3">
                {item.done ? (
                  <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                  <CircleDashed className="text-gray-400 group-hover:text-gray-500" size={20} />
                )}
                <span className={cn(
                  "font-medium",
                  item.done ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.name}
                </span>
              </div>
              {!item.done && (
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                  Action required
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
