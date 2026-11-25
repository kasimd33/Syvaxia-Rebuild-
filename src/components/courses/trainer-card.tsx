import { BadgeCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Trainer } from "@/data/courses";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">Your Trainer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold">{trainer.name}</p>
          <p className="text-sm text-muted-foreground">
            {trainer.role} · {trainer.yearsExperience} years
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{trainer.bio}</p>
        <ul className="space-y-1.5 border-t pt-3">
          {trainer.credentials.map((credential) => (
            <li key={credential} className="flex items-start gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              {credential}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
