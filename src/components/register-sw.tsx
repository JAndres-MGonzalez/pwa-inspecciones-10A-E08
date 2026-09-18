/* src/components/register-sw.tsx */
"use client";

import { useEffect } from "react";
import registerServiceWorker from "@/lib/pwa/register-service-worker";

export function RegisterSw() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}

export default RegisterSw;