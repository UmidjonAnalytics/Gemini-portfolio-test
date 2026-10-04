import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export async function clearAllData() {
  const collections = ['profile', 'settings', 'skills', 'projects', 'experience', 'education', 'certificates', 'testimonials', 'messages'];

  try {
    for (const col of collections) {
      const querySnapshot = await getDocs(collection(db, col));
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((document) => {
        batch.delete(doc(db, col, document.id));
      });

      await batch.commit();
    }
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}

export async function seedDemoData() {
  try {
    await clearAllData();

    const batch = writeBatch(db);

    // Profile
    const profileRef = doc(db, 'profile', 'main');
    batch.set(profileRef, {
      name: "Alex Data",
      title: {
        en: "Data Analyst",
        ru: "Аналитик Данных",
        uz: "Ma'lumotlar Tahlilchisi"
      },
      tagline: {
        en: "Turning complex data into actionable business insights.",
        ru: "Превращаю сложные данные в понятные бизнес-решения.",
        uz: "Murakkab ma'lumotlarni aniq biznes qarorlariga aylantiraman."
      },
      bio: {
        en: "I am a passionate Data Analyst with 3 years of experience in retail and finance. I specialize in SQL, Python, and Power BI. I enjoy building automated dashboards that help stakeholders make informed decisions.",
        ru: "Я амбициозный аналитик данных с 3-летним опытом работы в ритейле и финансах. Специализируюсь на SQL, Python и Power BI. Люблю создавать автоматизированные дашборды.",
        uz: "Men chakana savdo va moliya sohasida 3 yillik tajribaga ega ma'lumotlar tahlilchisiman. SQL, Python va Power BI bo'yicha mutaxassisman."
      },
      location: { en: "London, UK", ru: "Лондон, Великобритания", uz: "London, Buyuk Britaniya" },
      languages: "English, Russian",
      availability: "open",
      photoUrl: "", // Intentionally empty for demo
      cvUrl: "",
      counters: { projects: 12, experienceYears: 3, tools: 8, students: 0 },
      socials: {
        email: "alex@example.com",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        telegram: "https://t.me/alexdata",
        phone: "+44 123 456 789"
      }
    });

    // Settings
    const settingsRef = doc(db, 'settings', 'main');
    batch.set(settingsRef, {
      defaultLanguage: 'en',
      defaultTheme: 'system',
      accentColor: '#4f46e5',
      seoTitle: 'Alex Data - Portfolio',
      seoDescription: 'Data Analyst Portfolio',
      googleAnalyticsId: '',
      sections: {
        hero: true, about: true, skills: true, projects: true,
        experience: true, education: true, certificates: true,
        testimonials: true, contact: true
      }
    });

    // Skills
    const skills = [
      { cat: 'bi', icon: '📊', name: {en: 'Power BI', ru: 'Power BI', uz: 'Power BI'}, prof: 90 },
      { cat: 'bi', icon: '📈', name: {en: 'Tableau', ru: 'Tableau', uz: 'Tableau'}, prof: 75 },
      { cat: 'programming', icon: '🐍', name: {en: 'Python', ru: 'Python', uz: 'Python'}, prof: 85 },
      { cat: 'databases', icon: '💾', name: {en: 'SQL', ru: 'SQL', uz: 'SQL'}, prof: 95 },
      { cat: 'databases', icon: '🐘', name: {en: 'PostgreSQL', ru: 'PostgreSQL', uz: 'PostgreSQL'}, prof: 80 }
    ];

    skills.forEach((skill, i) => {
      const ref = doc(collection(db, 'skills'));
      batch.set(ref, {
        category: skill.cat,
        icon: skill.icon,
        name: skill.name,
        proficiency: skill.prof,
        order: i,
        published: true
      });
    });

    // Projects
    const projects = [
      {
        title: { en: "Retail Sales Dashboard", ru: "Дашборд розничных продаж", uz: "Chakana savdo boshqaruvi paneli" },
        summary: { en: "Automated daily sales reporting", ru: "Автоматизированная отчетность", uz: "Avtomatlashtirilgan savdo hisoboti" },
        problem: { en: "Manual Excel reports took 4 hours daily.", ru: "Ручные отчеты занимали 4 часа в день.", uz: "Qo'lda yozilgan Excel hisobotlari kuniga 4 soat vaqt olar edi." },
        approach: { en: "Built an automated Power BI dashboard connected to SQL Server.", ru: "Создал дашборд Power BI.", uz: "SQL Serverga ulangan Power BI paneli yaratildi." },
        results: { en: "Saved 20 hours/week. Increased visibility.", ru: "Сэкономлено 20 часов в неделю.", uz: "Haftasiga 20 soat tejaldi." },
        tools: ["Power BI", "SQL", "Excel"],
        domain: "Retail",
        coverImage: "",
        chartJson: '[{"name": "Q1", "value": 400}, {"name": "Q2", "value": 600}, {"name": "Q3", "value": 800}]',
        featured: true,
        order: 0,
        published: true
      },
      {
        title: { en: "Customer Churn Prediction", ru: "Прогнозирование оттока", uz: "Mijozlar ketishini bashorat qilish" },
        summary: { en: "Machine learning model to identify at-risk customers", ru: "Модель машинного обучения", uz: "Mashinali o'rganish modeli" },
        problem: { en: "High customer churn rate.", ru: "Высокий отток клиентов.", uz: "Mijozlar ketish darajasi yuqori." },
        approach: { en: "Trained a Random Forest model using Python.", ru: "Обучил модель Random Forest.", uz: "Python yordamida Random Forest modeli o'rgatildi." },
        results: { en: "Reduced churn by 15%.", ru: "Снижение оттока на 15%.", uz: "Ketish 15% ga kamaydi." },
        tools: ["Python", "Pandas", "Scikit-Learn"],
        domain: "Finance",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 1,
        published: true
      }
    ];

    projects.forEach(p => {
      const ref = doc(collection(db, 'projects'));
      batch.set(ref, {
        ...p,
        gallery: [],
        githubUrl: "https://github.com",
        liveUrl: "",
        iframeUrl: "",
        metrics: []
      });
    });

    // Experience
    const expRef = doc(collection(db, 'experience'));
    batch.set(expRef, {
      company: "Tech Retail Co",
      role: { en: "Junior Data Analyst", ru: "Младший аналитик", uz: "Kichik tahlilchi" },
      startDate: "2021-06",
      endDate: "present",
      description: {
        en: "- Created 10+ Power BI dashboards\n- Automated SQL queries\n- Collaborated with marketing team",
        ru: "- Создал 10+ дашбордов\n- Автоматизировал SQL запросы",
        uz: "- 10+ Power BI panellari yaratildi\n- SQL so'rovlari avtomatlashtirildi"
      },
      order: 0,
      published: true
    });

    // Education
    const eduRef = doc(collection(db, 'education'));
    batch.set(eduRef, {
      institution: { en: "Tech University", ru: "Технический Университет", uz: "Texnika Universiteti" },
      degree: { en: "BSc Computer Science", ru: "Бакалавр информатики", uz: "Kompyuter fanlari bakalavri" },
      field: { en: "Data Science", ru: "Data Science", uz: "Data Science" },
      startDate: "2017",
      endDate: "2021",
      order: 0,
      published: true
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}
