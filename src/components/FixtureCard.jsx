export default function FixtureCard({ date, month, opponent, competition, home }) {
  return (
    <div className="flex-none w-56 snap-start rounded-md bg-(--color-line) border border-(--color-ink)/10 p-5 hover:border-(--color-kit)/50 hover:-translate-y-0.5 transition-all">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="scoreboard-digits text-2xl font-semibold text-(--color-ink)">{date}</span>
        <span className="text-xs uppercase tracking-widest text-(--color-ink)/50">{month}</span>
      </div>
      <p className="text-xs uppercase tracking-widest text-(--color-kit) font-semibold mb-1">
        {home ? "Home" : "Away"} · {competition}
      </p>
      <p className="font-(family-name:--font-display) text-lg text-(--color-pitch) leading-snug">
        vs {opponent}
      </p>
    </div>
  );
}
