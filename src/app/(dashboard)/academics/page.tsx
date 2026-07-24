"use client";

import { BookOpen, Clock3, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge, ProgressBar } from "@/components/ui/badge";
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

export default function AcademicsPage() {
  const { modules } = useResolve();
  const studyMinutes = modules.reduce(
    (sum, module) => sum + module.weeklyStudyMinutes,
    0,
  );
  const assessments = modules
    .flatMap((module) =>
      module.assessments.map((assessment) => ({
        ...assessment,
        moduleCode: module.code,
        moduleColor: module.color,
      })),
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const leastAttention = [...modules].sort(
    (a, b) => a.weeklyStudyMinutes - b.weeklyStudyMinutes,
  )[0];

  return (
    <PageShell title="Academics">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Classroom"
          title="Know where your attention is going"
          description="Module health combines assessment progress, the next deadline, and actual weekly study time."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Modules"
            value={modules.length}
            detail={`${modules.reduce((sum, item) => sum + item.credits, 0)} total credits`}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <MetricCard
            label="Study this week"
            value={`${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`}
            detail="across tracked modules"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Needs attention"
            value={leastAttention?.code ?? "No modules"}
            detail={
              leastAttention
                ? `${leastAttention.weeklyStudyMinutes} minutes this week`
                : "Add a module to begin tracking"
            }
            icon={<GraduationCap className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {modules.map((module) => {
            const nextAssessment = [...module.assessments].sort((a, b) =>
              a.deadline.localeCompare(b.deadline),
            )[0];
            return (
              <Card key={module.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: module.color }}
                />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.15em]"
                        style={{ color: module.color }}
                      >
                        {module.code}
                      </p>
                      <CardTitle className="mt-2 text-base">
                        {module.name}
                      </CardTitle>
                    </div>
                    <Badge>{module.credits} CU</Badge>
                  </div>
                  <CardDescription>{module.lecturer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-surface-muted p-3">
                      <p className="text-xs text-muted">Target</p>
                      <p className="mt-1 text-xl font-black">
                        {module.targetGrade}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <p className="text-xs text-muted">Estimated</p>
                      <p className="mt-1 text-xl font-black">
                        {module.estimatedGrade ?? "—"}
                      </p>
                    </div>
                  </div>
                  {nextAssessment && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-bold">{nextAssessment.title}</span>
                        <span className="shrink-0 text-muted">
                          {nextAssessment.weight}%
                        </span>
                      </div>
                      <ProgressBar
                        className="mt-3"
                        value={nextAssessment.progress}
                        color={module.color}
                      />
                      <p className="mt-2 text-xs text-muted">
                        {nextAssessment.progress}% prepared · due{" "}
                        {formatDate(`${nextAssessment.deadline}T12:00:00`)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment runway</CardTitle>
            <CardDescription>
              Preparation should rise before urgency does.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="grid items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[100px_1fr_160px_100px]"
              >
                <Badge
                  style={{
                    backgroundColor: `${assessment.moduleColor}18`,
                    color: assessment.moduleColor,
                  }}
                >
                  {assessment.moduleCode}
                </Badge>
                <div>
                  <p className="font-bold">{assessment.title}</p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    {assessment.type.replace("_", " ")} · {assessment.weight}%
                  </p>
                </div>
                <div>
                  <ProgressBar
                    value={assessment.progress}
                    color={assessment.moduleColor}
                  />
                  <p className="mt-1 text-xs text-muted">
                    {assessment.progress}% prepared
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatDate(`${assessment.deadline}T12:00:00`)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
