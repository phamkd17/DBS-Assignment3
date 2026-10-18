"use client";

import { Switch } from "./ui/Switch";
import { savePrefs, useRoutineData } from "@/lib/storage";

/** The saved Subtract switch for a logger. Lives in prefs, so it can sit anywhere (e.g. a heading row). */
export function SubtractSwitch({ pref }: { pref: "stretchSubtract" | "studySubtract" }) {
  const data = useRoutineData();
  return <Switch label="Subtract" labelFirst checked={data?.prefs[pref] ?? false} onChange={(on) => savePrefs({ [pref]: on })} />;
}
