"use client";

import { useEffect } from "react";
import { reportOperationalEvent } from "@/lib/monitoring/client-events";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    void reportOperationalEvent("client_runtime_error", {
      phase: "root_layout",
      errorName: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#100b14",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "520px", textAlign: "center" }}>
          <p style={{ color: "#ff4f9a", fontWeight: 800 }}>
            Resolve! lost the beat
          </p>
          <h1>Something unexpected interrupted the app.</h1>
          <p style={{ color: "#c7bdcb", lineHeight: 1.6 }}>
            Try loading it again. Your browser-stored workspace is not removed
            by this error.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "12px",
              border: "2px solid #fff",
              borderRadius: "12px",
              padding: "10px 18px",
              background: "#ff4f9a",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
