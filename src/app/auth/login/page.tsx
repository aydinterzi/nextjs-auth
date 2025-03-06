"use client";

import { loginAction } from "@/lib/actions/authActions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      try {
        await loginAction(formData);
        router.push("/protected");
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        action={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl mb-4">Giriş Yap</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label className="block mb-2">
          E-posta
          <input
            name="email"
            type="email"
            className="w-full border p-2 rounded mt-1"
            required
          />
        </label>
        <label className="block mb-4">
          Şifre
          <input
            name="password"
            type="password"
            className="w-full border p-2 rounded mt-1"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {isPending ? "İşlem yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
