import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ensureCard } from "@/lib/card";
import { normalizeVisibility } from "@/lib/fields";
import { fmtDateTime } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import VisibilityForm from "./VisibilityForm";
import PinForm from "./PinForm";
import ConfirmButton from "@/components/ConfirmButton";
import { toggleCardAction, rotateTokenAction, removePinAction } from "@/app/actions/dashboard";
import { IconRefresh, IconEye } from "@/components/Icons";

export const metadata = { title: "Нууцлал ба PIN" };

export default async function PrivacyPage() {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  const vis = normalizeVisibility(card.visibility);
  return (
    <>
      <PageHeader title="Нууцлал ба PIN" desc="QR уншуулсан хүн юу харахыг та өөрөө шийднэ.">
        <Link href={`/e/${card.token}`} target="_blank" className="btn-secondary"><IconEye className="h-4 w-4" /> Нийтийн харагдацыг шалгах</Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisibilityForm initial={vis} expiresAt={card.expiresAt ? card.expiresAt.toISOString().slice(0, 10) : ""} hasPin={!!card.pinHash} />
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="h-section">Картын төлөв</h2>
            <p className="mt-1 text-sm text-slate-500">Идэвхгүй үед QR уншуулахад ямар ч мэдээлэл харагдахгүй.</p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${card.active ? "bg-emerald-500" : "bg-amber-500"}`} />
                {card.active ? "Идэвхтэй" : "Идэвхгүй"}
              </span>
              <form action={toggleCardAction}>
                <button className={card.active ? "btn-secondary text-xs" : "btn-primary text-xs"}>{card.active ? "Түр зогсоох" : "Идэвхжүүлэх"}</button>
              </form>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="h-section">PIN код</h2>
            <p className="mt-1 text-sm text-slate-500">“PIN-ээр” гэж тохируулсан мэдээллийг нээх 4–6 оронтой код. Ар гэрийнхэн, эмчдээ хэлж болно.</p>
            <div className="mt-4">
              {card.pinHash && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  ✓ PIN тохируулсан
                  <form action={removePinAction}><button className="text-xs font-semibold text-red-600 hover:underline">Устгах</button></form>
                </div>
              )}
              <PinForm hasPin={!!card.pinHash} />
            </div>
          </div>

          <div className="card border-red-200 p-6 dark:border-red-900/60">
            <h2 className="h-section">QR кодыг шинэчлэх</h2>
            <p className="mt-1 text-sm text-slate-500">Карт, утсаа алдсан эсвэл QR-ийг хүсээгүй хүнтэй хуваалцсан бол шинэчилнэ үү. <b>Хуучин QR шууд хүчингүй болно.</b></p>
            <p className="mt-2 text-xs text-slate-500">Сүүлд шинэчилсэн: {fmtDateTime(card.rotatedAt)}</p>
            <form action={rotateTokenAction} className="mt-4">
              <ConfirmButton message="Хуучин QR код хүчингүй болж, хэвлэсэн картаа дахин хэвлэх шаардлагатай. Үргэлжлүүлэх үү?" className="btn-danger w-full">
                <IconRefresh className="h-4 w-4" /> Шинэ QR үүсгэх
              </ConfirmButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
