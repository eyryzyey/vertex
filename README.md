# StreamVault (OneMovies tv) — Admin Dashboard

لوحة تحكم إدارية لمنصة بث (IPTV / أفلام / أنمي) مبنية بـ PHP خالص + MySQL، مع API JSON للتطبيق ومثبّت تلقائي من 4 خطوات.

## المتطلبات
- PHP >= 7.4 (الإضافات: pdo, pdo_mysql, mbstring, json)
- MySQL 5.7+ أو MariaDB 10.2+
- Apache مع mod_rewrite (للاستضافة التقليدية)

## التشغيل محلياً (XAMPP / أي استضافة PHP)
1. انسخ مجلد `streaming-dashboard/` إلى `htdocs/`
2. افتح `http://localhost/streaming-dashboard/public/`
3. سيتم تحويلك تلقائياً إلى المثبّت — أكمل الخطوات الأربع
4. سجّل الدخول بالبريد وكلمة المرور اللذين أنشأتهما

## الرفع على GitHub
```bash
git init
git add .
git commit -m "StreamVault dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/streaming-dashboard.git
git push -u origin main
```
ملاحظة: `.gitignore` يستثني ملف `.env` والملفات المرفوعة في `uploads/`.

## النشر على Vercel
1. أنشئ قاعدة بيانات MySQL خارجية (PlanetScale / Aiven / Railway / any MySQL host)
2. في Vercel: **Import Project** من مستودع GitHub
3. أضف متغيرات البيئة (Settings → Environment Variables):
   - `DB_HOST` — عنوان قاعدة البيانات
   - `DB_NAME` — اسم القاعدة
   - `DB_USER` — المستخدم
   - `DB_PASS` — كلمة المرور
   - `INSTALLED` = `true`
4. Deploy — ملف `vercel.json` مكوّن مسبقاً لتوجيه كل الطلبات عبر runtime PHP
5. لإنشاء حساب الأدمن شغّل `install.sql` في قاعدتك ثم أدخل يدوياً صفاً في `admins`، أو استخدم المثبّت (`/install`) وملف `.env` سيُتجاهل لكن الإعدادات ستُحفظ في الجلسة فقط — الأسهل تنفيذ SQL يدوياً.

### ⚠️ ملاحظات Vercel
- نظام الملفات في Vercel **للقراءة فقط** عدا `/tmp`، لذلك رفع الصور (الشعارات/البوسترات) لن يدوم بين الطلبات — استخدم روابط خارجية أو تخزيناً سحابياً (S3/Cloudinary) لاحقاً.
- يمكنك استخدام روابط مباشرة بدل الرفع: الحقول تقبل أي مسار/رابط.
- البيانات تُخزن كلها في MySQL الخارجية.

## بنية المشروع
```
config/database.php      اتصال PDO + قراءة .env ومتغيرات البيئة
app/Models/              Category, Channel, Movie, Anime, AdSetting, AppSetting
app/Controllers/         Auth, Dashboard, Category, Channel, Movie, Anime, Ad, Settings, Install
routes/                  web.php (لوحة), api.php (JSON), install.php (المثبّت)
views/                   التخطيطات + صفحات اللوحة + تسجيل الدخول + المثبّت
public/                  نقاط الدخول (index / api / install) + uploads/
```

## API
```
GET api.php?endpoint=categories
GET api.php?endpoint=channels
GET api.php?endpoint=movies
GET api.php?endpoint=anime          (مع الحلقات)
GET api.php?endpoint=ads            (الشبكات النشطة)
GET api.php?endpoint=settings
GET api.php?endpoint=check-update
```
الاستجابة: `{ "status": "success", "data": ... }`
