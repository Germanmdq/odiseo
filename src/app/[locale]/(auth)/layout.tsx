import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación — Odiseo",
  description: "Iniciá sesión o creá tu cuenta en Odiseo",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
