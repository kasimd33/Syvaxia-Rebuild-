import { CalendarDays, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CohortSchedule } from "@/data/courses";
import { deliveryModeLabels } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const statusBadge: Record<CohortSchedule["status"], { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-100 text-emerald-800" },
  filling: { label: "Filling fast", className: "bg-amber-100 text-amber-800" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

export function CohortScheduleCard({ cohorts }: { cohorts: CohortSchedule[] }) {
  if (cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Upcoming Cohorts</CardTitle>
          <CardDescription>
            New dates are being scheduled — join the waitlist via WhatsApp.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">Upcoming Cohorts</CardTitle>
        <CardDescription>Seats are confirmed on first-come, first-serve basis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cohorts.map((cohort) => {
          const badge = statusBadge[cohort.status];
          return (
            <div key={cohort.id} className="rounded-lg border bg-muted/30 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{formatDate(cohort.startDate)}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="size-3.5 text-brand-600" aria-hidden />
                  {cohort.timing}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-brand-600" aria-hidden />
                  {deliveryModeLabels[cohort.mode]}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-3.5 text-brand-600" aria-hidden />
                  {cohort.seatsLeft} of {cohort.seatsTotal} seats left
                </p>
              </div>
            </div>
          );
        })}
        <Badge variant="success" className="w-full justify-center py-1.5">
          Live system access included in every cohort
        </Badge>
      </CardContent>
    </Card>
  );
}
