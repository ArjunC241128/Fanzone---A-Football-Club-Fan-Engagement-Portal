import { useEffect, useState } from "react";

function getTimeParts(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function Digit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="scoreboard-digits bg-(--color-ink) text-(--color-line) rounded-sm px-3 py-2 text-2xl sm:text-3xl font-semibold min-w-[3.25rem] text-center">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] tracking-widest uppercase text-(--color-line)/60">
        {label}
      </span>
    </div>
  );
}

export default function Scoreboard({ home, away, competition, venue, kickoff }) {
  const [time, setTime] = useState(() => getTimeParts(kickoff));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeParts(kickoff)), 1000);
    return () => clearInterval(id);
  }, [kickoff]);

  return (
    <div className="rounded-md bg-(--color-pitch) border border-(--color-gold)/30 p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-(--color-gold)">
          Next fixture
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-(--color-line)/60">
          <span className="h-2 w-2 rounded-full bg-(--color-kit) animate-pulse" />
          {competition}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 mb-8">
        <div className="text-center">
          <div className="font-(family-name:--font-display) text-(--color-line) text-lg sm:text-2xl leading-tight">
            {home}
          </div>
        </div>
        <div className="text-center font-(family-name:--font-display) text-(--color-gold) text-xl sm:text-2xl">
          VS
        </div>
        <div className="text-center">
          <div className="font-(family-name:--font-display) text-(--color-line) text-lg sm:text-2xl leading-tight">
            {away}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 mb-6">
        <Digit value={time.days} label="Days" />
        <Digit value={time.hours} label="Hrs" />
        <Digit value={time.minutes} label="Min" />
        <Digit value={time.seconds} label="Sec" />
      </div>

      <div className="flex items-center justify-between text-xs text-(--color-line)/60 border-t border-(--color-line)/10 pt-4">
        <span>{venue}</span>
        <a href="/fixtures" className="font-semibold text-(--color-gold) hover:text-(--color-line) transition-colors">
          Book your seat →
        </a>
      </div>
    </div>
  );
}
