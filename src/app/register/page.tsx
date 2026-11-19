import AuthShell from "@/components/AuthShell";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Бүртгүүлэх" };

export default function RegisterPage() {
  return (
    <AuthShell title="Бүртгэл үүсгэх" subtitle="2 минутад өөрийн яаралтай тусламжийн QR картыг бэлдээрэй.">
      <RegisterForm />
    </AuthShell>
  );
}
