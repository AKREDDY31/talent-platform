"use client";

import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: "120px 20px" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

