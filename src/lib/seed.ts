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

    // Skills (14 skills in 4 categories)
    const skills = [
      { cat: 'bi', icon: '📊', name: {en: 'Power BI', ru: 'Power BI', uz: 'Power BI'}, prof: 90 },
      { cat: 'bi', icon: '📈', name: {en: 'Tableau', ru: 'Tableau', uz: 'Tableau'}, prof: 75 },
      { cat: 'bi', icon: '📉', name: {en: 'Looker Studio', ru: 'Looker Studio', uz: 'Looker Studio'}, prof: 80 },
      { cat: 'programming', icon: '🐍', name: {en: 'Python', ru: 'Python', uz: 'Python'}, prof: 85 },
      { cat: 'programming', icon: '🐼', name: {en: 'Pandas', ru: 'Pandas', uz: 'Pandas'}, prof: 80 },
      { cat: 'programming', icon: '💻', name: {en: 'R', ru: 'R', uz: 'R'}, prof: 60 },
      { cat: 'databases', icon: '💾', name: {en: 'SQL', ru: 'SQL', uz: 'SQL'}, prof: 95 },
      { cat: 'databases', icon: '🐘', name: {en: 'PostgreSQL', ru: 'PostgreSQL', uz: 'PostgreSQL'}, prof: 80 },
      { cat: 'databases', icon: '🐬', name: {en: 'MySQL', ru: 'MySQL', uz: 'MySQL'}, prof: 85 },
      { cat: 'databases', icon: '☁️', name: {en: 'BigQuery', ru: 'BigQuery', uz: 'BigQuery'}, prof: 70 },
      { cat: 'soft', icon: '🗣️', name: {en: 'Communication', ru: 'Коммуникация', uz: 'Muloqot'}, prof: 90 },
      { cat: 'soft', icon: '👥', name: {en: 'Teamwork', ru: 'Командная работа', uz: 'Jamoaviy ish'}, prof: 85 },
      { cat: 'soft', icon: '🧠', name: {en: 'Problem Solving', ru: 'Решение проблем', uz: 'Muammolarni yechish'}, prof: 95 },
      { cat: 'soft', icon: '⏱️', name: {en: 'Time Management', ru: 'Тайм-менеджмент', uz: 'Vaqtni boshqarish'}, prof: 80 }
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

    // Projects (8 projects)
    const projects = [
      {
        title: { en: "Retail Sales Dashboard", ru: "Дашборд розничных продаж", uz: "Chakana savdo boshqaruvi paneli" },
        summary: { en: "Automated daily sales reporting", ru: "Автоматизированная отчетность", uz: "Avtomatlashtirilgan savdo hisoboti" },
        problem: { en: "Manual Excel reports took 4 hours daily, causing delays in decision-making.", ru: "Ручные отчеты в Excel занимали 4 часа в день.", uz: "Qo'lda yozilgan Excel hisobotlari kuniga 4 soat vaqt olar edi." },
        approach: { en: "Built an automated Power BI dashboard connected to a SQL Server database for real-time tracking.", ru: "Создал автоматизированный дашборд Power BI, подключенный к SQL Server.", uz: "SQL Serverga ulangan avtomatlashtirilgan Power BI paneli yaratildi." },
        results: { en: "Saved 20 hours/week and increased sales visibility by 30%.", ru: "Сэкономлено 20 часов в неделю, видимость продаж выросла на 30%.", uz: "Haftasiga 20 soat tejaldi va savdo ko'rinishi 30% ga oshdi." },
        tools: ["Power BI", "SQL", "Excel"],
        domain: "Retail",
        coverImage: "",
        chartJson: '[{"name": "Q1", "value": 400}, {"name": "Q2", "value": 600}, {"name": "Q3", "value": 800}, {"name": "Q4", "value": 1100}]',
        featured: true,
        order: 0,
        published: true
      },
      {
        title: { en: "Customer Churn Prediction", ru: "Прогнозирование оттока клиентов", uz: "Mijozlar ketishini bashorat qilish" },
        summary: { en: "Machine learning model to identify at-risk customers", ru: "Модель машинного обучения для выявления клиентов в зоне риска", uz: "Xavf ostidagi mijozlarni aniqlash uchun mashinali o'rganish modeli" },
        problem: { en: "The bank was experiencing a high customer churn rate of 12% annually.", ru: "Банк столкнулся с высоким уровнем оттока клиентов - 12% в год.", uz: "Bank mijozlarining yillik ketish darajasi 12% gacha ko'tarildi." },
        approach: { en: "Trained a Random Forest model using Python and Pandas on 5 years of historical customer data.", ru: "Обучил модель Random Forest с использованием Python и Pandas на исторических данных за 5 лет.", uz: "5 yillik tarixiy ma'lumotlar asosida Python yordamida Random Forest modeli o'rgatildi." },
        results: { en: "Identified at-risk customers with 85% accuracy, reducing churn by 15%.", ru: "Выявил клиентов в зоне риска с точностью 85%, снизив отток на 15%.", uz: "Xavf ostidagi mijozlarni 85% aniqlik bilan topdi va ketishni 15% ga kamaytirdi." },
        tools: ["Python", "Pandas", "Scikit-Learn"],
        domain: "Banking",
        coverImage: "",
        chartJson: '[{"name": "Jan", "value": 12}, {"name": "Feb", "value": 11}, {"name": "Mar", "value": 10}, {"name": "Apr", "value": 8}, {"name": "May", "value": 7}]',
        featured: true,
        order: 1,
        published: true
      },
      {
        title: { en: "HR Employee Turnover Analysis", ru: "Анализ текучести кадров HR", uz: "HR xodimlar almashinuvi tahlili" },
        summary: { en: "Tableau dashboard for HR analytics", ru: "Дашборд Tableau для HR-аналитики", uz: "HR tahlili uchun Tableau paneli" },
        problem: { en: "HR lacked visibility into why employees were leaving the company.", ru: "HR не понимал, почему сотрудники покидают компанию.", uz: "HR xodimlarning nima uchun ishdan ketayotganini tushuna olmasdi." },
        approach: { en: "Created an interactive Tableau dashboard visualizing employee satisfaction, salary data, and tenure.", ru: "Создал интерактивный дашборд Tableau, визуализирующий удовлетворенность сотрудников.", uz: "Xodimlarning qoniqishi, maosh va ishlagan vaqtini ko'rsatuvchi Tableau paneli yaratildi." },
        results: { en: "Revealed that low salaries in the tech department caused 40% of turnover.", ru: "Выяснилось, что низкие зарплаты в техническом отделе стали причиной 40% увольнений.", uz: "Texnologiya bo'limidagi past maoshlar 40% ketishga sabab bo'lgani aniqlandi." },
        tools: ["Tableau", "Excel"],
        domain: "HR",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 2,
        published: true
      },
      {
        title: { en: "Student Performance Tracker", ru: "Трекер успеваемости студентов", uz: "Talabalar o'zlashtirishini kuzatish" },
        summary: { en: "Google Sheets automated tracking system", ru: "Автоматизированная система отслеживания в Google Sheets", uz: "Google Sheets orqali avtomatlashtirilgan kuzatuv tizimi" },
        problem: { en: "Teachers spent hours manually grading and tracking student progress.", ru: "Учителя тратили часы на ручную проверку и отслеживание прогресса.", uz: "O'qituvchilar talabalar natijalarini qo'lda kiritishga ko'p vaqt sarflar edi." },
        approach: { en: "Developed a Google Sheets system with App Script for automated grading and email reports.", ru: "Разработал систему в Google Sheets с использованием App Script.", uz: "Avtomatik baholash va elektron pochta orqali hisobot yuborish uchun App Script yordamida Google Sheets tizimi ishlab chiqildi." },
        results: { en: "Saved each teacher 5 hours per week.", ru: "Сэкономил каждому учителю 5 часов в неделю.", uz: "Har bir o'qituvchi haftasiga 5 soat vaqt tejadi." },
        tools: ["Google Sheets", "App Script"],
        domain: "Education",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 3,
        published: true
      },
      {
        title: { en: "Marketing Campaign ROI Calculator", ru: "Калькулятор ROI маркетинговых кампаний", uz: "Marketing ROI kalkulyatori" },
        summary: { en: "SQL based analysis of ad spend vs revenue", ru: "SQL-анализ расходов на рекламу и доходов", uz: "Reklama xarajatlari va daromadni SQL orqali tahlil qilish" },
        problem: { en: "Marketing couldn't easily determine which campaigns were profitable.", ru: "Маркетинг не мог легко определить, какие кампании были прибыльными.", uz: "Marketing jamoasi qaysi kampaniyalar foyda keltirayotganini aniqlay olmasdi." },
        approach: { en: "Wrote complex SQL queries to join ad spend data with CRM revenue data.", ru: "Написал сложные SQL-запросы для объединения данных о расходах на рекламу с доходами из CRM.", uz: "Reklama xarajatlarini CRM daromadlari bilan bog'lash uchun murakkab SQL so'rovlari yozildi." },
        results: { en: "Identified $50k in wasted ad spend and reallocated to high-performing channels.", ru: "Выявил 50 тыс. долларов впустую потраченных средств на рекламу.", uz: "$50k samarasiz reklama xarajatlari aniqlanib, foydali kanallarga yo'naltirildi." },
        tools: ["SQL", "PostgreSQL"],
        domain: "Marketing",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 4,
        published: true
      },
      {
        title: { en: "Supply Chain Optimization", ru: "Оптимизация цепочки поставок", uz: "Ta'minot zanjirini optimallashtirish" },
        summary: { en: "Python script to optimize inventory levels", ru: "Скрипт Python для оптимизации уровня запасов", uz: "Zaxira darajasini optimallashtirish uchun Python skripti" },
        problem: { en: "Overstocking led to high storage costs.", ru: "Затоваривание приводило к высоким затратам на хранение.", uz: "Haddan tashqari ko'p zaxira saqlash xarajatlarini oshirdi." },
        approach: { en: "Built a forecasting model in Python to predict inventory needs.", ru: "Создал модель прогнозирования на Python для предсказания потребностей в запасах.", uz: "Zaxira ehtiyojlarini bashorat qilish uchun Python da model yaratildi." },
        results: { en: "Reduced inventory costs by 20% while preventing stockouts.", ru: "Снизил затраты на запасы на 20%, предотвратив дефицит.", uz: "Zaxira xarajatlari 20% ga kamaydi." },
        tools: ["Python", "Excel"],
        domain: "Retail",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 5,
        published: true
      },
      {
        title: { en: "Financial Fraud Detection", ru: "Обнаружение финансового мошенничества", uz: "Moliyaviy firibgarlikni aniqlash" },
        summary: { en: "Anomaly detection in transaction logs", ru: "Обнаружение аномалий в журналах транзакций", uz: "Tranzaksiyalar jurnalida anomaliyalarni aniqlash" },
        problem: { en: "Increasing cases of undetected credit card fraud.", ru: "Учащение случаев необнаруженного мошенничества с кредитными картами.", uz: "Kredit kartalari firibgarligi holatlari oshib bordi." },
        approach: { en: "Implemented a machine learning anomaly detection algorithm.", ru: "Внедрил алгоритм машинного обучения для обнаружения аномалий.", uz: "Anomaliyalarni aniqlash uchun mashinali o'rganish algoritmi joriy etildi." },
        results: { en: "Detected 95% of fraudulent transactions in real-time.", ru: "Обнаружил 95% мошеннических транзакций в режиме реального времени.", uz: "Real vaqt rejimida firibgarlik tranzaksiyalarining 95% aniqlandi." },
        tools: ["Python", "SQL", "Scikit-Learn"],
        domain: "Banking",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 6,
        published: true
      },
      {
        title: { en: "Customer Sentiment Analysis", ru: "Анализ настроений клиентов", uz: "Mijozlar fikrini tahlil qilish" },
        summary: { en: "NLP analysis of product reviews", ru: "NLP-анализ отзывов о продуктах", uz: "Mahsulot sharhlarini NLP tahlili" },
        problem: { en: "Manual review of thousands of feedback forms was impossible.", ru: "Ручная проверка тысяч форм обратной связи была невозможна.", uz: "Minglab fikr-mulohazalarni qo'lda o'qib chiqish imkonsiz edi." },
        approach: { en: "Used Python NLTK to classify reviews as positive, neutral, or negative.", ru: "Использовал Python NLTK для классификации отзывов.", uz: "Sharhlarni ijobiy, neytral yoki salbiyga ajratish uchun Python NLTK ishlatildi." },
        results: { en: "Provided product team with actionable insights to improve UI.", ru: "Предоставил продуктовой команде ценные данные для улучшения UI.", uz: "Mahsulot jamoasiga UI ni yaxshilash uchun aniq ma'lumotlar taqdim etildi." },
        tools: ["Python", "NLTK", "Power BI"],
        domain: "Retail",
        coverImage: "",
        chartJson: '',
        featured: false,
        order: 7,
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

    // Experience (3 entries)
    const experiences = [
      {
        company: "Tech Retail Co",
        role: { en: "Data Analyst", ru: "Аналитик данных", uz: "Ma'lumotlar tahlilchisi" },
        startDate: "2021-06",
        endDate: "present",
        description: {
          en: "- Created 10+ Power BI dashboards for executive team\n- Automated SQL queries reducing data extraction time by 50%\n- Collaborated with marketing team to optimize campaign spending",
          ru: "- Создал 10+ дашбордов Power BI для руководства\n- Автоматизировал SQL-запросы, сократив время извлечения данных на 50%\n- Сотрудничал с маркетинговой командой",
          uz: "- Rahbariyat uchun 10+ Power BI panellari yaratildi\n- SQL so'rovlarini avtomatlashtirish orqali vaqt 50% ga tejaldi\n- Marketing jamoasi bilan hamkorlik qilindi"
        },
        order: 0,
        published: true
      },
      {
        company: "Global Finance Bank",
        role: { en: "Junior Data Analyst", ru: "Младший аналитик данных", uz: "Kichik ma'lumotlar tahlilchisi" },
        startDate: "2019-03",
        endDate: "2021-05",
        description: {
          en: "- Cleaned and prepared large datasets using Python Pandas\n- Assisted in building churn prediction models\n- Maintained daily Excel reports",
          ru: "- Очищал и подготавливал большие наборы данных с использованием Python Pandas\n- Помогал в создании моделей прогнозирования оттока\n- Вел ежедневные отчеты в Excel",
          uz: "- Python Pandas yordamida katta ma'lumotlarni tozalash\n- Mijozlar ketishini bashorat qilish modellarini yaratishda yordam\n- Kunlik Excel hisobotlarini yuritish"
        },
        order: 1,
        published: true
      },
      {
        company: "StartUp Edu",
        role: { en: "Data Intern", ru: "Стажер-аналитик", uz: "Amaliyotchi tahlilchi" },
        startDate: "2018-09",
        endDate: "2019-02",
        description: {
          en: "- Gathered user feedback data\n- Created basic visualization charts in Google Sheets\n- Presented weekly findings to the team",
          ru: "- Собирал данные отзывов пользователей\n- Создавал базовые графики в Google Sheets\n- Представлял еженедельные результаты команде",
          uz: "- Foydalanuvchilar fikrlarini yig'ish\n- Google Sheets da oddiy grafiklar yaratish\n- Haftalik natijalarni jamoaga taqdim etish"
        },
        order: 2,
        published: true
      }
    ];

    experiences.forEach(exp => {
      const ref = doc(collection(db, 'experience'));
      batch.set(ref, exp);
    });

    // Certificates (4 entries)
    const certificates = [
      {
        title: { en: "Google Data Analytics Professional Certificate", ru: "Профессиональный сертификат Google Data Analytics", uz: "Google Data Analytics professional sertifikati" },
        issuer: "Google / Coursera",
        date: "2021-12",
        credentialId: "GDA-123456",
        credentialUrl: "https://coursera.org",
        imageUrl: "",
        order: 0,
        published: true
      },
      {
        title: { en: "Microsoft Certified: Power BI Data Analyst Associate", ru: "Сертифицированный аналитик данных Power BI", uz: "Power BI Data Analyst Associate sertifikati" },
        issuer: "Microsoft",
        date: "2022-05",
        credentialId: "MS-PL300-789",
        credentialUrl: "https://microsoft.com",
        imageUrl: "",
        order: 1,
        published: true
      },
      {
        title: { en: "Applied Data Science with Python", ru: "Прикладная наука о данных с Python", uz: "Python bilan amaliy ma'lumotlar ilmi" },
        issuer: "University of Michigan",
        date: "2020-08",
        credentialId: "UM-DS-456",
        credentialUrl: "https://coursera.org",
        imageUrl: "",
        order: 2,
        published: true
      },
      {
        title: { en: "SQL for Data Science", ru: "SQL для Data Science", uz: "Data Science uchun SQL" },
        issuer: "UC Davis",
        date: "2019-11",
        credentialId: "UCD-SQL-112",
        credentialUrl: "https://coursera.org",
        imageUrl: "",
        order: 3,
        published: true
      }
    ];

    certificates.forEach(cert => {
      const ref = doc(collection(db, 'certificates'));
      batch.set(ref, cert);
    });

    // Education (2 entries)
    const educations = [
      {
        institution: { en: "Tech University", ru: "Технический Университет", uz: "Texnika Universiteti" },
        degree: { en: "MSc Data Science", ru: "Магистр Data Science", uz: "Data Science magistri" },
        field: { en: "Machine Learning & Analytics", ru: "Машинное обучение и аналитика", uz: "Mashinali o'rganish va tahlil" },
        startDate: "2021",
        endDate: "2023",
        order: 0,
        published: true
      },
      {
        institution: { en: "State College", ru: "Государственный Колледж", uz: "Davlat Kolleji" },
        degree: { en: "BSc Computer Science", ru: "Бакалавр информатики", uz: "Kompyuter fanlari bakalavri" },
        field: { en: "Software Engineering", ru: "Программная инженерия", uz: "Dasturiy ta'minot muhandisligi" },
        startDate: "2017",
        endDate: "2021",
        order: 1,
        published: true
      }
    ];

    educations.forEach(edu => {
      const ref = doc(collection(db, 'education'));
      batch.set(ref, edu);
    });

    // Testimonials (3 entries)
    const testimonials = [
      {
        name: "Sarah Jenkins",
        role: "VP of Marketing, Tech Retail Co",
        text: {
          en: "Alex completely transformed how we view our marketing spend. The SQL dashboards he built saved us thousands.",
          ru: "Алекс полностью изменил наш взгляд на маркетинговые расходы. Дашборды, которые он создал, сэкономили нам тысячи.",
          uz: "Alex bizning marketing xarajatlarimizni ko'rish uslubimizni butunlay o'zgartirdi. U yaratgan SQL panellari minglab pulimizni tejadi."
        },
        imageUrl: "",
        order: 0,
        published: true
      },
      {
        name: "David Chen",
        role: "Senior Data Scientist, Global Finance",
        text: {
          en: "A brilliant junior analyst with a strong grasp of Python. Always eager to learn and delivers clean code.",
          ru: "Блестящий младший аналитик с отличным знанием Python. Всегда готов учиться и пишет чистый код.",
          uz: "Python ni yaxshi biladigan ajoyib kichik tahlilchi. O'rganishga doim tayyor va toza kod yozadi."
        },
        imageUrl: "",
        order: 1,
        published: true
      },
      {
        name: "Emily Roberts",
        role: "Project Manager",
        text: {
          en: "Reliable, communicative, and detail-oriented. The Power BI reports were exactly what the stakeholders needed.",
          ru: "Надежный, коммуникабельный и внимательный к деталям. Отчеты Power BI были именно тем, что нужно.",
          uz: "Ishonchli, muloqotga kirishuvchan va detallarga e'tiborli. Power BI hisobotlari mijozlarga aynan kerakli narsa edi."
        },
        imageUrl: "",
        order: 2,
        published: true
      }
    ];

    testimonials.forEach(test => {
      const ref = doc(collection(db, 'testimonials'));
      batch.set(ref, test);
    });

    // Messages (5 entries)
    const messages = [
      { name: "John Doe", email: "john@example.com", message: "Hi Alex, we are looking for a data analyst for our team. Are you open to new opportunities?", date: new Date().toISOString(), read: false },
      { name: "Jane Smith", email: "jane@startup.io", message: "Loved your portfolio! Can we schedule a quick call?", date: new Date(Date.now() - 86400000).toISOString(), read: false },
      { name: "Recruiter Bob", email: "bob@recruiting.com", message: "I have a remote Power BI role that fits your profile.", date: new Date(Date.now() - 172800000).toISOString(), read: true },
      { name: "Alice", email: "alice@company.com", message: "Could you share the GitHub link for the churn prediction project?", date: new Date(Date.now() - 259200000).toISOString(), read: true },
      { name: "Mark", email: "mark@agency.net", message: "We need freelance help with Google Sheets App Script.", date: new Date(Date.now() - 345600000).toISOString(), read: true }
    ];

    messages.forEach(msg => {
      const ref = doc(collection(db, 'messages'));
      batch.set(ref, msg);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}
