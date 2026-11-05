export default function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const color =
    score >= 75 ? "bg-green-100 text-green-800" : score >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  const dims = size === "lg" ? "h-24 w-24 text-3xl" : "h-10 w-10 text-sm";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-bold ${color} ${dims}`}>
      {score}
    </div>
  );
}
