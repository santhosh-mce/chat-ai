import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="h-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b]">
      <AuthForm type="register" />
    </div>
  );
}
