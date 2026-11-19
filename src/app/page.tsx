import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  IconQr, IconShield, IconLock, IconPhone, IconList, IconPrinter, IconMap, IconRefresh, IconImage, IconEye, IconEyeOff, IconDrop,
} from "@/components/Icons";

const steps = [
  { n: "01", t: "Бүртгүүлэх", d: "Имэйл, нууц үгээр аюулгүй бүртгэл үүсгэнэ. Нууц үг bcrypt-ээр хэшлэгдэнэ." },
  { n: "02", t: "Мэдээллээ оруулах", d: "Цусны бүлэг, харшил, архаг өвчин, эм, яаралтай холбоо барих хүмүүсээ бөглөнө." },
  { n: "03", t: "Нууцлалаа тохируулах", d: "Талбар бүрийг “Нээлттэй”, “PIN-ээр” эсвэл “Нуусан” гэж өөрөө сонгоно." },
  { n: "04", t: "QR кодоо ашиглах", d: "Түрийвчний карт хэвлэх, утасны түгжээний дэлгэцэнд тавих эсвэл наалт болгоно." },
];

const features = [
  { i: IconQr, t: "Хувийн QR код", d: "128 битийн санамсаргүй токентой, таамаглах боломжгүй холбоос." },
  { i: IconShield, t: "AES-256 шифрлэлт", d: "Эрүүл мэндийн мэдээлэл өгөгдлийн санд шифрлэгдсэн хэлбэрээр хадгалагдана." },
  { i: IconLock, t: "PIN хамгаалалт", d: "Нарийн мэдээллийг зөвхөн PIN мэдэх эмч, ар гэрийнхэн харна." },
  { i: IconList, t: "Хандалтын түүх", d: "Таны QR-ийг хэзээ, ямар төхөөрөмжөөс уншуулсныг харна." },
  { i: IconRefresh, t: "QR шинэчлэх", d: "Карт алдсан бол нэг товчоор хуучин QR-ийг хүчингүй болгоно." },
  { i: IconPrinter, t: "Хэвлэх карт", d: "Түрийвчинд багтах (85.6×54 мм) картын загвар бэлэн." },
  { i: IconImage, t: "Түгжээний дэлгэцийн зураг", d: "Утас түгжээтэй байсан ч QR харагдах ханын зураг үүсгэнэ." },
  { i: IconMap, t: "Байршил илгээх", d: "Тусламж үзүүлэгч таны байршлыг ар гэрийнхэнд SMS-ээр илгээнэ." },
  { i: IconPhone, t: "Нэг товчоор залгах", d: "103 болон яаралтай холбоо барих хүмүүс рүү шууд залгана." },
];

const faqs = [
  { q: "QR кодыг хэн ч уншуулж болох уу?", a: "Тийм. Яаралтай үед ямар ч хүн (тусламж үзүүлэгч, эмч, иргэн) энгийн утасны камераар уншуулж болно. Гэхдээ тэд зөвхөн таны “Нээлттэй” гэж тохируулсан мэдээллийг л харна." },
  { q: "PIN код юунд хэрэгтэй вэ?", a: "Хэрэглэдэг эм, ЭМД-ын дугаар зэрэг илүү нарийн мэдээллийг “PIN-ээр” гэж тохируулбал зөвхөн PIN мэдэх хүн (ар гэрийнхэн, эмчлэгч эмч) харах боломжтой. Буруу PIN-ийг 15 минутад 5-аас олон удаа оруулахыг хориглоно." },
  { q: "Картаа алдвал яах вэ?", a: "Хяналтын самбарын “Нууцлал” хэсгээс “QR кодыг шинэчлэх” товчийг дарахад хуучин QR шууд хүчингүй болж, шинэ QR үүснэ. Мөн картаа түр идэвхгүй болгох боломжтой." },
  { q: "Миний мэдээлэл хаана хадгалагдах вэ?", a: "Таны эрүүл мэндийн мэдээлэл AES-256-GCM алгоритмаар шифрлэгдэж хадгалагдана. Нууц үг bcrypt хэшээр, IP хаяг хэш болон хэсэгчлэн нуусан хэлбэрээр бичигдэнэ." },
  { q: "Мэдээллээ устгаж болох уу?", a: "Болно. Тохиргоо хэсгээс бүх өгөгдлөө JSON файлаар татаж авах, мөн бүртгэлээ бүрмөсөн устгах боломжтой." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,.15),transparent_55%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" /> QR · Authentication · Privacy
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Яаралтай үед таны <span className="text-brand-600">амь насыг аврах</span> мэдээлэл — нэг QR кодонд
              </h1>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
                Цусны бүлэг, харшил, архаг өвчин, яаралтай холбоо барих хүн. Ухаан алдсан, ярих боломжгүй үед ч тусламж үзүүлэгч таны
                мэдээллийг секундын дотор харна. Харин <b>юуг, хэнд</b> харуулахыг та өөрөө шийднэ.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary px-6 py-3 text-base">Үнэгүй карт үүсгэх</Link>
                <a href="#how" className="btn-secondary px-6 py-3 text-base">Хэрхэн ажилладаг вэ?</a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[["< 5 сек", "Мэдээлэл харах"], ["3 түвшин", "Нууцлал"], ["AES-256", "Шифрлэлт"]].map(([a, b]) => (
                  <div key={b}><dt className="text-2xl font-extrabold">{a}</dt><dd className="text-sm text-slate-500">{b}</dd></div>
                ))}
              </dl>
            </div>
            <HeroCard />
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="Хэрхэн ажилладаг" title="4 алхамд бэлэн" />
            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="card p-6">
                  <span className="text-sm font-black text-brand-600">{s.n}</span>
                  <h3 className="mt-2 font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="Боломжууд" title="Яаралтай үед хэрэгтэй бүх зүйл" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ i: I, t, d }) => (
                <div key={t} className="card flex gap-4 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30"><I /></div>
                  <div><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section id="privacy" className="bg-slate-900 py-20 text-white dark:bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="Нууцлал" title="Мэдээлэл бүрт 3 түвшний хяналт" dark />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { i: IconEye, c: "bg-emerald-500", t: "Нээлттэй", d: "QR уншуулсан хэн бүхэн харна. Цусны бүлэг, харшил зэрэг амь насанд шууд нөлөөлөх мэдээлэлд тохиромжтой." },
                { i: IconLock, c: "bg-amber-500", t: "PIN-ээр", d: "4–6 оронтой PIN оруулсны дараа 10 минут харагдана. Эм, даатгалын дугаар зэрэгт тохиромжтой." },
                { i: IconEyeOff, c: "bg-slate-500", t: "Нуусан", d: "Хэзээ ч нийтийн хуудсанд харагдахгүй. Зөвхөн та өөрөө хяналтын самбараас харна." },
              ].map(({ i: I, c, t, d }) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c}`}><I /></div>
                  <h3 className="mt-4 text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-slate-300">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-4 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              {["Нууц үг bcrypt (cost 12)", "httpOnly + SameSite cookie", "Нэвтрэх оролдлогын хязгаар", "IP хаягийг хэшлэж хадгална"].map((x) => (
                <div key={x} className="flex items-center gap-2"><IconShield className="h-4 w-4 text-emerald-400" />{x}</div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle kicker="Түгээмэл асуулт" title="Танд асуулт байна уу?" />
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold">
                    {f.q}<span className="ml-4 text-brand-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-brand-600 to-rose-700 px-8 py-14 text-center text-white">
            <IconDrop className="mx-auto h-10 w-10" />
            <h2 className="mt-4 text-3xl font-extrabold">Өнөөдөр картаа бэлдээрэй</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">Хэзээ хэрэг болохыг хэн ч мэдэхгүй. Харин бэлэн байх нь таны гарт.</p>
            <Link href="/register" className="btn mt-8 bg-white px-8 py-3 text-base text-brand-700 hover:bg-brand-50">Үнэгүй эхлэх</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionTitle({ kicker, title, dark }: { kicker: string; title: string; dark?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-500">{kicker}</p>
      <h2 className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? "text-white" : ""}`}>{title}</h2>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-brand-600/20 blur-xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-brand-600 px-6 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Яаралтай мэдээлэл · Emergency</p>
          <p className="mt-1 text-xl font-extrabold">Бат-Эрдэнэ Ганболд</p>
          <p className="text-sm opacity-90">34 настай · Эрэгтэй</p>
        </div>
        <div className="space-y-3 p-6">
          <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4 dark:bg-brand-900/20">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Цусны бүлэг</span>
            <span className="text-2xl font-black text-brand-600">B(III) Rh+</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-bold text-amber-800 dark:text-amber-300">⚠ Харшил</p>
            <p className="text-amber-900 dark:text-amber-200">Пенициллин, самрын бүтээгдэхүүн</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
            <p className="font-bold">Архаг өвчин</p><p className="text-slate-600 dark:text-slate-400">Чихрийн шижин II хэв шинж</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
            <IconLock className="h-4 w-4" /> 3 мэдээлэл PIN-ээр хамгаалагдсан
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <span className="btn-primary text-xs">📞 103 залгах</span>
            <span className="btn-secondary text-xs">Ээж рүү залгах</span>
          </div>
        </div>
      </div>
    </div>
  );
}
