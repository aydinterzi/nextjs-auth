// app/protected/page.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/actions/authActions";

export default async function ProtectedPage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Korunan Sayfa</h1>
      <p>Hoşgeldin, {user.email}!</p>
    </div>
  );
}
