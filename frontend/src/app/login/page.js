import { Suspense } from "react";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card">Loading login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
