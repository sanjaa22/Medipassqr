import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import ResetForm from "./ResetForm";

export const metadata = { title: "Шинэ нууц үг", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(token) } }).catch(() => null);
  const valid = !!row && !row.usedAt && row.expiresAt > new Date();

  if (!valid) {
    return (
      <AuthShell title="Холбоос хүчингүй" subtitle="Энэ холбоос ашиглагдсан эсвэл хугацаа нь дууссан байна.">
        <Link href="/forgot" className="btn-primary w-full">Шинэ холбоос авах</Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Шинэ нууц үг тохируулах" subtitle="Шинэ нууц үгээ оруулна уу. Бусад бүх төхөөрөмж дээрх нэвтрэлт хаагдана.">
      <ResetForm token={token} />
    </AuthShell>
  );
}
