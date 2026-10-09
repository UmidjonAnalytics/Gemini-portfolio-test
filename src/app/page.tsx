'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Certificates from '@/components/Certificates';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <div className="flex flex-col">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Certificates />
        <Testimonials />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
