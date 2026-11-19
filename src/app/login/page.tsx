import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata = { title: "Нэвтрэх" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  return (
    <AuthShell title="Тавтай морил" subtitle="MediPass бүртгэлдээ нэвтэрч яаралтай картаа удирдаарай.">
      <LoginForm next={next} reset={reset === "1"} />
    </AuthShell>
  );
}
