import Link from "next/link";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { ensureCard, cardUrl } from "@/lib/card";
import { getMedical } from "@/lib/profile";
import { normalizeVisibility } from "@/lib/fields";
import { publicSummary } from "@/lib/publicview";
import { LogoMark } from "@/components/Logo";
import PrintButton from "./PrintButton";

export const metadata = { title: "Карт хэвлэх" };

export default async function PrintPage() {
  const user = await requireUser();
  const [card, med] = await Promise.all([ensureCard(user.id), getMedical(user.id)]);
  const qr = await QRCode.toDataURL(cardUrl(card.token), { errorCorrectionLevel: "H", margin: 1, width: 600 });
  const s = publicSummary(med, normalizeVisibility(card.visibility));

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Түрийвчний карт хэвлэх</h1>
          <p className="text-sm text-slate-500">Стандарт хэмжээ 85.6 × 54 мм. Хэвлээд хайчилж, ламинатлахыг зөвлөж байна.</p>
        </div>
        <div className="flex gap-2"><Link href="/dashboard/qr" className="btn-secondary">Буцах</Link><PrintButton /></div>
      </div>

      <div className="flex flex-wrap gap-6 print:gap-4">
        {/* Нүүр тал */}
        <div className="relative flex overflow-hidden rounded-[3mm] border border-slate-300 bg-white text-slate-900" style={{ width: "85.6mm", height: "54mm" }}>
          <div className="flex w-[30mm] flex-col items-center justify-center bg-brand-600 p-[2mm] text-white">
            <span className="text-[2.4mm] font-black uppercase leading-tight tracking-wide text-center">Яаралтай<br />тусламж</span>
            <span className="mt-[1mm] text-[1.8mm] opacity-90">EMERGENCY</span>
            <span className="mt-[3mm] text-[6mm] font-black">103</span>
          </div>
          <div className="flex flex-1 flex-col justify-between p-[3mm]">
            <div className="flex items-center gap-[1.5mm]"><LogoMark className="h-[4mm] w-[4mm]" /><span className="text-[2.8mm] font-extrabold">MediPass</span></div>
            <div>
              <p className="text-[3.6mm] font-extrabold leading-tight">{s.name || "—"}</p>
              {s.age && <p className="text-[2.4mm] text-slate-600">{s.age}</p>}
              {s.bloodType && <p className="mt-[1mm] text-[3mm] font-black text-brand-600">Цус: {s.bloodType}</p>}
              {s.allergies && <p className="mt-[0.5mm] line-clamp-2 text-[2.2mm]"><b>Харшил:</b> {s.allergies}</p>}
            </div>
            {s.contact && <p className="text-[2.2mm] text-slate-700">☎ {s.contact}</p>}
          </div>
        </div>

        {/* Ар тал */}
        <div className="flex items-center gap-[3mm] overflow-hidden rounded-[3mm] border border-slate-300 bg-white p-[3mm] text-slate-900" style={{ width: "85.6mm", height: "54mm" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" style={{ width: "44mm", height: "44mm" }} />
          <div className="flex-1">
            <p className="text-[3mm] font-black uppercase leading-tight text-brand-600">QR уншуулж эмнэлгийн мэдээллийг харна уу</p>
            <p className="mt-[1.5mm] text-[2.1mm] leading-snug text-slate-600">Scan for medical information. Утасны камераар уншуулна.</p>
            <p className="mt-[2mm] text-[1.9mm] text-slate-500">Зарим мэдээлэл PIN-ээр хамгаалагдсан.</p>
          </div>
        </div>
      </div>
      <p className="no-print mt-6 text-sm text-slate-500">Картанд зөвхөн “Нээлттэй” гэж тохируулсан мэдээлэл хэвлэгдэнэ.</p>
    </div>
  );
}
