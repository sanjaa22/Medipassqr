import Link from "next/link";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { ensureCard, cardUrl } from "@/lib/card";
import { getMedical } from "@/lib/profile";
import { normalizeVisibility } from "@/lib/fields";
import { publicSummary } from "@/lib/publicview";
import PageHeader from "@/components/PageHeader";
import QrTools from "./QrTools";
import { IconPrinter } from "@/components/Icons";

export const metadata = { title: "QR код ба карт" };

export default async function QrPage() {
  const user = await requireUser();
  const [card, med] = await Promise.all([ensureCard(user.id), getMedical(user.id)]);
  const url = cardUrl(card.token);
  const opts = { errorCorrectionLevel: "H" as const, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } };
  const [png, svg] = await Promise.all([QRCode.toDataURL(url, { ...opts, width: 1024 }), QRCode.toString(url, { ...opts, type: "svg" })]);
  const summary = publicSummary(med, normalizeVisibility(card.visibility));

  return (
    <>
      <PageHeader title="QR код ба карт" desc="QR кодоо татаж авах, хэвлэх, утасныхаа түгжээний дэлгэцэнд тавих.">
        <Link href="/dashboard/qr/print" className="btn-primary"><IconPrinter className="h-4 w-4" /> Карт хэвлэх</Link>
      </PageHeader>
      <QrTools png={png} svg={svg} url={url} summary={summary} active={card.active} />
      <div className="card mt-6 p-6">
        <h2 className="h-section">QR кодоо хаана байршуулах вэ?</h2>
        <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["📱 Утасны түгжээний дэлгэц", "Ханын зураг болгож тавибал утас түгжээтэй үед ч уншуулах боломжтой."],
            ["💳 Түрийвч", "Иргэний үнэмлэхний хажууд хэвлэсэн картаа хийж явна."],
            ["🪖 Дуулга, цүнх", "Дугуй, мотоцикл унадаг, ууланд гардаг бол наалт болгож наана."],
            ["🚗 Машин", "Жолоочийн суудлын нарны хаалт дээр байршуулна."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"><p className="font-semibold text-slate-900 dark:text-white">{t}</p><p className="mt-1">{d}</p></div>
          ))}
        </div>
      </div>
    </>
  );
}
