import { AppHeader } from "@/components/layout/app-header";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader title={title} />
      <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
    </>
  );
}
