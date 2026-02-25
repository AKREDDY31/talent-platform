import { Suspense } from "react";
import VerifyClient from "./verify-client";

export const dynamic = "force-dynamic";

export default function CertificateVerifyPage() {
  return (
    <Suspense fallback={<div className="card">Loading certificate verification...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
