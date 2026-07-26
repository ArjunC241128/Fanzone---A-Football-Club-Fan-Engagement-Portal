import StatBlock from "../components/StatBlock";
import StaffCard from "../components/StaffCard";

const history = [
  { year: "1998", text: "Founded by a group of dockyard workers in Agrabad as Chattogram Port Titans." },
  { year: "2004", text: "Promoted to the top flight for the first time; club shortens name to Chattogram Titans FC." },
  { year: "2011", text: "First league title, secured on the final matchday against Dhaka Mariners." },
  { year: "2018", text: "Titans Arena opens, replacing the club's original 4,000-seat ground." },
  { year: "2023", text: "Youth academy graduate Farhan Islam named league Player of the Season." },
  { year: "2026", text: "Launch of FanZone — the club's digital home for supporters." },
];

const staff = [
  { name: "Abdul Kader Molla", role: "Head Coach" },
  { name: "Nasrin Sultana", role: "Assistant Coach" },
  { name: "Imtiaz Rahman", role: "Club Chairman" },
  { name: "Shirin Akhter", role: "General Manager" },
  { name: "Mahfuz Anam", role: "Goalkeeping Coach" },
  { name: "Ruma Chakma", role: "Head of Fan Engagement" },
];

export default function About() {
  return (
    <div>
      {/* Header band */}
      <section className="bg-(--color-pitch) py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-gold)">
            Since 1998
          </span>
          <h1 className="font-(family-name:--font-display) text-(--color-line) text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 leading-tight">
            THE CLUB BEHIND
            <br />
            THE BADGE
          </h1>
          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-(--color-line)/70 leading-relaxed">
            Chattogram Titans FC has represented the port city on the pitch for over
            two decades — built by its supporters and carried forward by every fan
            who fills Titans Arena on matchday.
          </p>
        </div>
      </section>

      {/* Achievements — scoreboard stat blocks */}
      <section className="bg-(--color-pitch-light)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8">
            <StatBlock value="03" label="League titles" />
            <StatBlock value="02" label="Cup wins" />
            <StatBlock value="28" label="Years running" />
            <StatBlock value="41K" label="FanZone members" />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 text-center">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
          Our mission
        </span>
        <p className="font-(family-name:--font-display) text-xl sm:text-2xl md:text-3xl lg:text-4xl text-(--color-pitch) mt-4 leading-snug">
          To give Chattogram a club worth roaring for — on the pitch, in the
          academy, and in every corner of the community.
        </p>
      </section>

      {/* History timeline — numbered because order carries real information */}
      <section className="bg-(--color-concrete)">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <h2 className="font-(family-name:--font-display) text-xl sm:text-2xl md:text-3xl text-(--color-pitch) mb-8 sm:mb-10">
            Club history
          </h2>
          <ol className="relative border-l border-(--color-pitch)/20 pl-6 sm:pl-8 space-y-8 sm:space-y-10">
            {history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[calc(1.5rem+1px)] sm:-left-[calc(2rem+1px)] top-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-(--color-pitch) scoreboard-digits text-[9px] sm:text-[10px] text-(--color-gold)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="scoreboard-digits text-(--color-kit) font-semibold">{h.year}</span>
                <p className="mt-1 text-sm sm:text-base text-(--color-ink)/80 leading-relaxed">{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Management & coaching staff */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="font-(family-name:--font-display) text-xl sm:text-2xl md:text-3xl text-(--color-pitch) mb-8 sm:mb-10">
          Management &amp; coaching staff
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {staff.map((s, i) => (
            <StaffCard key={i} {...s} />
          ))}
        </div>
      </section>
    </div>
  );
}