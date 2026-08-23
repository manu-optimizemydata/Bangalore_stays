import type { PropertyType } from "@/generated/prisma/client";

export type MapSpot = {
  x: number;
  y: number;
  quip: string;
};

const CITY_SPOTS: Record<string, MapSpot> = {
  "Nandi Hills": { x: 32, y: 12, quip: "Wake up for the valley." },
  Whitefield: { x: 80, y: 30, quip: "Quiet lane. Real kitchen." },
  Bengaluru: { x: 50, y: 42, quip: "Coffee's on the verandah." },
  Indiranagar: { x: 50, y: 42, quip: "Coffee's on the verandah." },
  Sarjapur: { x: 78, y: 60, quip: "The pool is still warm." },
  Bannerghatta: { x: 52, y: 70, quip: "The lawn is bigger than it looks." },
  Jigani: { x: 52, y: 70, quip: "The lawn is bigger than it looks." },
  Ramanagara: { x: 16, y: 62, quip: "Farm eggs if you ask." },
  "Electronic City": { x: 70, y: 72, quip: "Easy ride back to town." },
  Yelahanka: { x: 42, y: 14, quip: "North of the city, still close." },
  Kanakapura: { x: 30, y: 78, quip: "Sky and silence." },
};

const FALLBACK_SPOTS: MapSpot[] = [
  { x: 22, y: 30, quip: "Come see the house." },
  { x: 62, y: 28, quip: "Come see the house." },
  { x: 38, y: 58, quip: "Come see the house." },
  { x: 68, y: 52, quip: "Come see the house." },
];

export function spotForProperty(city: string, index: number): MapSpot {
  return CITY_SPOTS[city] ?? FALLBACK_SPOTS[index % FALLBACK_SPOTS.length];
}

export function houseVariant(type: PropertyType) {
  if (type === "villa") return "villa";
  if (type === "farmstay") return "farm";
  if (type === "cottage") return "cottage";
  if (type === "apartment") return "flat";
  return "house";
}
