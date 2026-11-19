import AuthShell from "@/components/AuthShell";
import ForgotForm from "./ForgotForm";

export const metadata = { title: "Нууц үг сэргээх" };

export default function ForgotPage() {
  return (
    <AuthShell title="Нууц үгээ мартсан уу?" subtitle="Бүртгэлтэй имэйлээ оруулбал нууц үг сэргээх холбоос илгээнэ. Таны эрүүл мэндийн мэдээлэл устахгүй.">
      <ForgotForm />
    </AuthShell>
  );
}
