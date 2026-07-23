import { useState } from "react";

const initialOptions = [
  { id: "a", label: "Rahim Chowdhury", votes: 214 },
  { id: "b", label: "Karim Ahmed", votes: 178 },
  { id: "c", label: "Farhan Islam", votes: 96 },
];

export default function PollWidget() {
  const [options, setOptions] = useState(initialOptions);
  const [voted, setVoted] = useState(null);

  const total = options.reduce((sum, o) => sum + o.votes, 0);

  const castVote = (id) => {
    if (voted) return;
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)));
    setVoted(id);
  };

  return (
    <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-6 sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
        Fan poll
      </span>
      <h3 className="font-(family-name:--font-display) text-xl sm:text-2xl text-(--color-pitch) mt-2 mb-6">
        Who's your Player of the Month?
      </h3>

      <div className="space-y-4">
        {options.map((o) => {
          const pct = total ? Math.round((o.votes / total) * 100) : 0;
          return (
            <button
              key={o.id}
              onClick={() => castVote(o.id)}
              disabled={!!voted}
              className={`w-full text-left ${voted ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-(--color-ink)">{o.label}</span>
                {voted && (
                  <span className="scoreboard-digits text-(--color-ink)/60">{pct}%</span>
                )}
              </div>
              <div className="h-2.5 rounded-full bg-(--color-concrete) overflow-hidden">
                <div
                  className="h-full rounded-full bg-(--color-gold) transition-all duration-700 ease-out"
                  style={{ width: voted ? `${pct}%` : "0%" }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-(--color-ink)/50">
        {voted
          ? `Thanks for voting — ${total.toLocaleString()} fans have had their say.`
          : "Tap an option to cast your vote."}
      </p>
    </div>
  );
}
