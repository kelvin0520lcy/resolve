"use client";

import { BrainCircuit, Briefcase, Clock3 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard, PageIntro } from "@/components/ui/resolve";
import { useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";

const stageVariant = {
  saved: "default",
  applied: "accent",
  assessment: "warning",
  interview: "success",
  offer: "success",
  closed: "danger",
} as const;

export default function CareerPage() {
  const { algorithmLogs, applications, goals } = useResolve();
  const careerGoal = goals.find((goal) => goal.category === "career");
  const algorithmMinutes = algorithmLogs.reduce(
    (sum, log) => sum + log.minutes,
    0,
  );
  const averageConfidence = Math.round(
    algorithmLogs.reduce((sum, log) => sum + log.confidence, 0) /
      Math.max(algorithmLogs.length, 1),
  );

  return (
    <PageShell title="Career">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Development room"
          title="Build proof, not just preparation"
          description="Track interview practice and applications together so career work becomes a steady weekly system."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Problems solved"
            value={careerGoal?.currentValue ?? algorithmLogs.length}
            detail={`of ${careerGoal?.targetValue ?? 60} this semester`}
            icon={<BrainCircuit className="h-5 w-5" />}
          />
          <MetricCard
            label="Practice time"
            value={`${algorithmMinutes} min`}
            detail={`average confidence ${averageConfidence}/5`}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Applications"
            value={applications.length}
            detail={`${applications.filter((item) => item.stage === "assessment" || item.stage === "interview").length} active next stages`}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm practice log</CardTitle>
              <CardDescription>
                The lesson is more reusable than the green checkmark.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {algorithmLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{log.problemName}</p>
                        <Badge
                          variant={
                            log.difficulty === "Hard"
                              ? "danger"
                              : log.difficulty === "Medium"
                                ? "warning"
                                : "success"
                          }
                        >
                          {log.difficulty}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {log.platform} · {log.topic} · {log.minutes} minutes
                      </p>
                    </div>
                    <Badge>{log.confidence}/5 confidence</Badge>
                  </div>
                  <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm leading-6">
                    <strong>Key lesson:</strong> {log.lesson}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application board</CardTitle>
              <CardDescription>
                Every active application has one visible next action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{application.company}</p>
                      <p className="mt-1 text-sm text-muted">
                        {application.role}
                      </p>
                    </div>
                    <Badge
                      variant={stageVariant[application.stage]}
                      className="capitalize"
                    >
                      {application.stage}
                    </Badge>
                  </div>
                  {application.nextAction && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-xs font-black uppercase tracking-wider text-muted">
                        Next action
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {application.nextAction}
                      </p>
                      {application.nextActionDate && (
                        <p className="mt-1 text-xs text-muted">
                          By{" "}
                          {formatDate(
                            `${application.nextActionDate}T12:00:00`,
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
