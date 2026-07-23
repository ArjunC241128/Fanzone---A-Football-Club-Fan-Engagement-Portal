export default function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="scoreboard-digits inline-block bg-(--color-ink) text-(--color-gold) rounded-sm px-4 py-3 text-3xl sm:text-4xl font-semibold min-w-[5rem]">
        {value}
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-(--color-line)/70">{label}</p>
    </div>
  );
}
