import { requireUser } from "@/lib/auth";
import { getMedical } from "@/lib/profile";
import PageHeader from "@/components/PageHeader";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Эрүүл мэндийн мэдээлэл" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const med = await getMedical(user.id);
  const { welcome } = await searchParams;
  return (
    <>
      <PageHeader title="Эрүүл мэндийн мэдээлэл" desc="Яаралтай үед тусламж үзүүлэгчид хэрэгтэй мэдээллээ үнэн зөв бөглөнө үү." />
      {welcome && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          🎉 <b>Бүртгэл амжилттай үүслээ!</b> Таны QR карт аль хэдийн бэлэн болсон. Одоо доорх мэдээллийг бөглөөд, “Нууцлал” хэсэгт аль мэдээллийг харуулахаа тохируулаарай.
        </div>
      )}
      <ProfileForm initial={med} />
    </>
  );
}
