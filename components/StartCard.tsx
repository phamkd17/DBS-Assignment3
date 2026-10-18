"use client";

import { Card } from "./ui/Card";
import { Chip } from "./ui/Chip";
import { useToast } from "./ui/Toast";
import { today } from "@/lib/dates";
import { topicName } from "@/lib/fe-topics";
import { logStretch, logStudy } from "@/lib/log-actions";
import { useRoutineData } from "@/lib/storage";

/** First visit only (nothing saved yet): three one-tap wins. Disappears after the first log. */
export function StartCard() {
  const data = useRoutineData();
  const toast = useToast();
  if (!data) return null;
  if (data.stretches.length + data.study.length + data.calories.length > 0) return null;

  const topic = data.prefs.studyTopic ?? "statics";
  const show = ({ message, undo }: { message: string; undo: () => void }) => toast(message, undo);

  return (
    <Card aria-labelledby="start-title" className="flex flex-col gap-4 border border-ct-accent/60">
      <div className="flex flex-col gap-1">
        <h2 id="start-title" className="font-ct-serif text-2xl italic text-ct-text">
          Start here
        </h2>
        <p className="font-ct-sans text-[15px] text-ct-linen">Three small wins to begin. One tap each starts a streak.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip onClick={() => show(logStretch("shoulder", 30, today()))}>+30 s Shoulder</Chip>
        <Chip onClick={() => show(logStretch("lower", 60, today()))}>+60 s Lower body</Chip>
        <Chip onClick={() => show(logStudy(topic, 15, today()))}>+15 min {topicName(topic)}</Chip>
      </div>
      <p className="font-ct-sans text-sm text-ct-muted">You can change the topic in FE study below.</p>
    </Card>
  );
}
