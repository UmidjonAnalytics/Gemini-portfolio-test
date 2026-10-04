'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  User as UserIcon,
  Wrench,
  FolderOpen,
  Briefcase,
  Award,
  GraduationCap,
  MessageSquare,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user && pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Profile', href: '/admin/profile', icon: UserIcon },
    { name: 'Skills', href: '/admin/skills', icon: Wrench },
    { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
    { name: 'Experience', href: '/admin/experience', icon: Briefcase },
    { name: 'Certificates', href: '/admin/certificates', icon: Award },
    { name: 'Education', href: '/admin/education', icon: GraduationCap },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare }, // Reusing icon
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Danger Zone', href: '/admin/danger-zone', icon: AlertTriangle, className: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky top-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-full flex flex-col">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white hidden lg:block">Admin Panel</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">{user.email}</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                      item.className
                    )}
                  >
                    <item.icon className={cn('mr-3 flex-shrink-0 h-5 w-5', isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500')} aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t dark:border-gray-700">
              <Link
                 href="/"
                 className="flex items-center w-full px-4 py-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                 target="_blank"
              >
                <FileText className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                View Public Site
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
