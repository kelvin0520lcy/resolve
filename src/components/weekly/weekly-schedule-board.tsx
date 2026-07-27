import { CalendarRange, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { CategoryBadge } from "@/components/ui/resolve";
import type { EventOccurrence } from "@/features/workspace/lib/events";
import {
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
import type { Task } from "@/types";

function formatWeekday(date: string, length: "short" | "long" = "short") {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-SG", {
    weekday: length,
  });
}

export function WeeklyScheduleBoard({
  dates,
  tasksByDate,
  eventsByDate,
  today,
  onEditTask,
  onMoveTask,
  onRemoveTask,
}: {
  dates: string[];
  tasksByDate: Map<string, Task[]>;
  eventsByDate: Map<string, EventOccurrence[]>;
  today: string;
  onEditTask: (task: Task) => void;
  onMoveTask: (taskId: string, date: string) => void;
  onRemoveTask: (taskId: string) => void;
}) {
  const taskCount = dates.reduce(
    (total, date) => total + (tasksByDate.get(date)?.length ?? 0),
    0,
  );
  const eventCount = dates.reduce(
    (total, date) => total + (eventsByDate.get(date)?.length ?? 0),
    0,
  );

  return (
    <section aria-labelledby="weekly-schedule-title">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">
            Seven-day setlist
          </p>
          <h2
            id="weekly-schedule-title"
            className="font-display mt-1 text-2xl tracking-wide"
          >
            Week at a glance
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Days stay compact. Scroll inside a busy day; swipe the board to see
            later days.
          </p>
        </div>
        <p className="shrink-0 text-xs font-bold text-muted">
          {taskCount} {taskCount === 1 ? "task" : "tasks"} · {eventCount} fixed{" "}
          {eventCount === 1 ? "event" : "events"}
        </p>
      </div>

      <div
        data-testid="weekly-schedule-board"
        className="grid items-start gap-4 md:grid-cols-2 xl:grid-flow-col xl:auto-cols-[17rem] xl:grid-cols-none xl:overflow-x-auto xl:overscroll-x-contain xl:pb-4 xl:pr-1 xl:snap-x xl:snap-mandatory"
      >
        {dates.map((date) => {
          const dayTasks = tasksByDate.get(date) ?? [];
          const dayEvents = eventsByDate.get(date) ?? [];
          const dayMinutes = dayTasks.reduce(
            (sum, task) => sum + (getTaskEstimatedMinutes(task) ?? 0),
            0,
          );
          const dayEventMinutes = dayEvents.reduce(
            (sum, event) => sum + (event.durationMinutes ?? 0),
            0,
          );
          const isToday = date === today;
          const dayItemCount = dayTasks.length + dayEvents.length;
          const weekday = formatWeekday(date);

          return (
            <Card
              key={date}
              data-testid={`weekly-day-${date}`}
              className={`self-start overflow-hidden xl:w-[17rem] xl:snap-start ${
                isToday ? "border-accent shadow-md shadow-accent/10" : ""
              }`}
              aria-label={`${formatWeekday(date, "long")} ${new Date(
                `${date}T12:00:00`,
              ).getDate()} schedule, ${dayTasks.length} ${
                dayTasks.length === 1 ? "task" : "tasks"
              }`}
            >
              <CardHeader className="border-b border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-muted">
                      {weekday}
                    </p>
                    <CardTitle className="text-2xl">
                      {new Date(`${date}T12:00:00`).getDate()}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayItemCount > 0 && (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-black text-muted">
                        {dayItemCount}
                      </span>
                    )}
                    {isToday && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-accent"
                        aria-label="Today"
                      />
                    )}
                  </div>
                </div>
                <CardDescription className="text-xs leading-5">
                  {dayMinutes + dayEventMinutes
                    ? `${dayMinutes + dayEventMinutes} planned minutes`
                    : "Open day"}
                </CardDescription>
              </CardHeader>

              <CardContent
                data-testid={`weekly-day-scroll-${date}`}
                className="max-h-[34rem] space-y-2 overflow-y-auto overscroll-contain p-3 [scrollbar-gutter:stable]"
              >
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    data-workspace-event={event.eventId}
                    className="rounded-xl border border-warning/30 bg-warning/5 p-3"
                  >
                    <p className="text-[9px] font-black uppercase tracking-wider text-warning">
                      Fixed event
                    </p>
                    <p className="mt-1 break-words text-sm font-bold leading-5">
                      {event.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-muted">
                      {event.startTime ? `${event.startTime} · ` : ""}
                      {event.durationMinutes
                        ? `${event.durationMinutes} min`
                        : "Duration not set"}
                      {event.continuesFromPreviousDay
                        ? " · continued from previous day"
                        : event.continuesIntoNextDay
                          ? " · continues tomorrow"
                          : ""}
                    </p>
                  </div>
                ))}

                {dayTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-xl border border-border bg-surface p-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CategoryBadge category={task.category} />
                      </div>
                      <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit task ${task.title}`}
                          title="Edit task"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <ConfirmDeleteButton
                          itemLabel={`task ${task.title}`}
                          onConfirm={() => onRemoveTask(task.id)}
                          triggerClassName="h-8 w-8"
                        />
                      </div>
                    </div>

                    <p className="mt-2 break-words text-sm font-bold leading-5">
                      {task.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-muted">
                      {getTaskEstimatedMinutes(task) !== undefined
                        ? `${getTaskEstimatedMinutes(task)} min estimate`
                        : "No estimate · add one for capacity planning"}
                    </p>

                    <label className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted">
                      Move
                      <select
                        className="min-w-0 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-[11px] font-medium normal-case tracking-normal text-foreground outline-none"
                        value={getTaskScheduleDate(task)}
                        onChange={(event) =>
                          onMoveTask(task.id, event.target.value)
                        }
                        aria-label={`Move ${task.title} to another day`}
                      >
                        {dates.map((optionDate) => (
                          <option key={optionDate} value={optionDate}>
                            {formatWeekday(optionDate)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}

                {!dayTasks.length && !dayEvents.length && (
                  <div className="flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 px-3 py-5 text-center">
                    <CalendarRange
                      className="h-5 w-5 text-muted"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs font-bold text-muted">
                      Recovery space
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
