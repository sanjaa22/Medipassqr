# MediPass — QR кодтой яаралтай тусламжийн карт

Хэрэглэгч өөрийн эрүүл мэндийн яаралтай мэдээллийг бүртгэж, QR код үүсгэнэ. QR уншуулсан хүн зөвхөн
хэрэглэгчийн **зөвшөөрсөн** мэдээллийг харна. Сэдэв: **QR + Authentication + Privacy**.

## Үндсэн боломжууд
| Хэсэг | Боломж |
|---|---|
| Authentication | Бүртгэл/нэвтрэлт, bcrypt (cost 12), JWT (HS256) httpOnly cookie, 5 буруу оролдлогод 15 мин түгжих, IP-ээр rate limit, нууц үг солиход бусад сешн хүчингүй, бүх төхөөрөмжөөс гарах |
| Privacy | Талбар бүр 3 түвшин (Нээлттэй / PIN / Нуусан), PIN хамгаалалт (10 мин түр нээлт), AES-256-GCM шифрлэлт, IP хэш + маск, карт түр зогсоох, хугацаа тогтоох, QR токен шинэчлэх, өгөгдөл JSON-оор татах, бүртгэл устгах |
| QR | 128 битийн таамаглах боломжгүй токен, PNG/SVG татах, түрийвчний карт хэвлэх (85.6×54мм), утасны түгжээний дэлгэцийн зураг үүсгэх |
| Яаралтай хуудас | Утсанд зориулсан, 103 руу нэг товчоор залгах, холбоо барих хүн рүү залгах, байршлыг SMS-ээр илгээх, MN/EN хэл |
| Бусад | Хандалтын түүх + 14 хоногийн график, аюулгүй байдлын үйл явдлын бүртгэл, dark mode, PWA manifest, security headers |

## Технологи
Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL · jose · bcryptjs · zod · qrcode

---

## 1. Локал дээр ажиллуулах (VS Code)

Шаардлага: **Node.js 20+** болон **PostgreSQL** (Docker эсвэл үнэгүй [Neon](https://neon.tech)).

```bash
npm install
docker compose up -d      # локал PostgreSQL (Neon ашиглах бол энэ алхмыг алгасаад .env-д холбоосоо тавина)
cp .env.example .env      # Windows: copy .env.example .env
npm run setup             # AUTH_SECRET, ENCRYPTION_KEY-г автоматаар үүсгэж, хүснэгтүүдийг үүсгэнэ
npm run dev
```
Хөтөч дээр http://localhost:3000/register нээж бүртгүүлнэ. Бүртгэл хадгалагдсаныг шалгах:
```bash
npm run db:studio         # User, Profile, Card хүснэгтүүдийг харна
```

### Бүртгэл ажиллахгүй бол
Одоо алдаа хуудас дээр шалтгаан нь шууд бичигдэнэ:
| Мессеж | Шийдэл |
|---|---|
| хүснэгтүүд үүсээгүй | `npm run setup` (эсвэл `npx prisma db push`) |
| өгөгдлийн сантай холбогдож чадсангүй | `.env`-д `DATABASE_URL` зөв эсэх, PostgreSQL ажиллаж байгаа эсэх |
| AUTH_SECRET / ENCRYPTION_KEY дутуу | `npm run setup` |

## 2. Vercel дээр байршуулах

1. Кодыг GitHub дээр шинэ repository болгон push хийнэ.
2. https://vercel.com → **Add New → Project** → repository-оо сонгоно.
3. Төсөл үүссэний дараа **Storage → Create Database → Neon (Postgres)** сонгож төсөлдөө холбоно.
   Энэ нь `DATABASE_URL` орчны хувьсагчийг автоматаар нэмнэ.
4. **Settings → Environment Variables** хэсэгт нэмнэ:
   - `AUTH_SECRET` — дээрх командаар үүсгэсэн утга
   - `ENCRYPTION_KEY` — 64 тэмдэгт hex
   - `NEXT_PUBLIC_APP_URL` — `https://таны-төсөл.vercel.app`
5. Хүснэгт үүсгэх: локал компьютер дээрээ `.env`-д Neon-ий холбоосыг тавиад `npm run setup` (эсвэл `npx prisma db push`) ажиллуулна.
6. **Deployments → Redeploy** дарна. Бэлэн!

> ⚠️ `ENCRYPTION_KEY`-г дараа нь солих юм бол хуучин шифрлэгдсэн мэдээлэл уншигдахгүй болно. Түлхүүрээ аюулгүй хадгална уу.

## Төслийн бүтэц
```
prisma/schema.prisma        Өгөгдлийн сангийн схем (User, Profile, Card, AccessLog, SecurityEvent, RateLimit)
src/middleware.ts           /dashboard хамгаалалт
src/lib/                    crypto (AES, токен), session (JWT), auth, ratelimit, profile, fields, card ...
src/app/page.tsx            Нүүр хуудас
src/app/login, register     Нэвтрэлт
src/app/dashboard/*         Хяналтын самбар, профайл, нууцлал, QR, түүх, тохиргоо
src/app/e/[token]           QR уншуулахад нээгдэх яаралтай хуудас
src/app/actions/*           Server Actions
src/app/api/export          Өгөгдөл татах API
```
