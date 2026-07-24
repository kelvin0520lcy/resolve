import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <PageShell title={title}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            This section is scaffolded and ready for Phase {phase ?? "2+"}{" "}
            implementation. The navigation, layout, and data types are in place.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
