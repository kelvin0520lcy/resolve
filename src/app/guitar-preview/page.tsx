import { connection } from "next/server";
import { notFound } from "next/navigation";
import { GuitarStudioPreview } from "@/features/guitar-learning/components/guitar-studio-preview";

export default async function GuitarPreviewPage() {
  await connection();
  if (process.env.ENABLE_GUITAR_PREVIEW !== "true") {
    notFound();
  }

  return <GuitarStudioPreview />;
}
