import Card from "@/components/ui/Card";

const LEGEND_ITEMS = [
  { label: "Hard to read sentence", swatch: "bg-yellow-300" },
  { label: "Very hard to read sentence", swatch: "bg-red-300" },
  { label: "Adverb", swatch: "bg-purple-300" },
  { label: "Passive voice", swatch: "bg-blue-300" },
  { label: "Spam trigger word", swatch: "bg-rose-400" },
  { label: "ALL CAPS word", swatch: "bg-orange-300" },
  { label: "Excessive punctuation", swatch: "bg-fuchsia-300" },
];

export default function HighlightLegend() {
  return (
    <Card className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5">
      {LEGEND_ITEMS.map(({ label, swatch }) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
          <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
      ))}
    </Card>
  );
}
