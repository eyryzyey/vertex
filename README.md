# 🎬 NOVA MEDIA - Premium Streaming Platform

منصة بث مباشر وتدفق وسائط احترافية بتصميم مظلم فاخر (**Dark Premium UI**)، تجمع بين تجربة مشاهدة سلسة ولوحة تحكم متطورة للملاست لإدارة المحتوى والمستخدمين.

---

## 🌟 المميزات الرئيسية (Key Features)

- **🎨 تصميم Dark Premium UI:** واجهة أنيقة باللون الأسود والبنفسجي النيون، متجاوبة بالكامل (Responsive) وتدعم اللغة العربية (RTL).
- **🔐 نظام الحسابات والصلاحيات:** التسجيل المغلق تلقائياً لضمان الخصوصية، مع إمكانية إدارة الحسابات حصرياً عبر **المالك (Owner)**.
- **📊 لوحة تحكم المالك (Owner Control Panel):** إدارة شاملة للمستخدمين، الأفلام، المسلسلات، الأنمي، القنوات المباشرة، وسيرفرات البث.
- **📺 مشغل فيديو داخلي احترافي (Integrated Player):** دعم تشغيل الفيديو المباشر داخل المنصة لروابط MP4 و HLS (M3U8).
- **⚡ أداء عالٍ ودائم:** معمارية قائمة على السحاب باستخدام **Next.js**، قاعدة بيانات **Neon (PostgreSQL)**، واستضافة **Vercel**.

---

## 🛠️ البنية التقنية (Tech Stack)

* **الواجهة الأمامية (Frontend):** Next.js, Tailwind CSS, Lucide Icons.
* **الخلفية (Backend):** Next.js Server Actions & API Routes.
* **قاعدة البيانات (Database):** PostgreSQL عبر Neon DB مع Prisma ORM.
* **النشر والاستضافة (Deployment):** GitHub & Vercel.

---

## 📂 هيكل المشروع (Project Structure)

```text
vertex/
├── app/                  # صفحات وتخطيط التطبيق (Next.js App Router)
│   ├── layout.tsx        # الهيكل العام والتنسيقات
│   ├── page.tsx          # الواجهة الرئيسية
│   └── login/            # صفحة تسجيل الدخول
├── lib/                  # إعدادات الاتصال بقاعدة البيانات (Prisma Client)
│   └── prisma.ts
├── public/               # الملفات والأصول الثابتة
│   └── index.html        # الواجهة المباشرة
├── schema.prisma         # مخطط قاعدة البيانات (Neon Database)
├── package.json          # الحزم والاعتمادات
└── README.md             # ملف التوثيق والشرح
