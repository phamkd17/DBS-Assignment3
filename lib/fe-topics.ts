// The 14 knowledge areas of the NCEES FE Mechanical CBT exam (specs effective July 2020),
// with the number of exam questions each area is worth.

export const FE_TOPICS = [
  { id: "math", name: "Mathematics", questions: "6–9" },
  { id: "prob-stats", name: "Probability and Statistics", questions: "4–6" },
  { id: "ethics", name: "Ethics and Professional Practice", questions: "4–6" },
  { id: "econ", name: "Engineering Economics", questions: "4–6" },
  { id: "em", name: "Electricity and Magnetism", questions: "5–8" },
  { id: "statics", name: "Statics", questions: "8–12" },
  { id: "dynamics", name: "Dynamics, Kinematics, and Vibrations", questions: "9–14" },
  { id: "mom", name: "Mechanics of Materials", questions: "8–12" },
  { id: "materials", name: "Material Properties and Processing", questions: "5–8" },
  { id: "fluids", name: "Fluid Mechanics", questions: "10–15" },
  { id: "thermo", name: "Thermodynamics", questions: "10–15" },
  { id: "heat", name: "Heat Transfer", questions: "7–11" },
  { id: "controls", name: "Measurements, Instrumentation, and Controls", questions: "5–8" },
  { id: "design", name: "Mechanical Design and Analysis", questions: "10–15" },
] as const;

export type TopicId = (typeof FE_TOPICS)[number]["id"];

export function topicName(id: TopicId): string {
  return FE_TOPICS.find((t) => t.id === id)?.name ?? id;
}

export function isTopicId(value: string): value is TopicId {
  return FE_TOPICS.some((t) => t.id === value);
}
