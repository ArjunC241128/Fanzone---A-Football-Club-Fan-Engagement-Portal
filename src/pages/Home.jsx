import Scoreboard from "../components/Scoreboard";
import FixtureCard from "../components/FixtureCard";
import NewsCard from "../components/NewsCard";
import PollWidget from "../components/PollWidget";

const fixtures = [
  { date: "12", month: "Jul", opponent: "Sylhet Rangers", competition: "BPL", home: true },
  { date: "19", month: "Jul", opponent: "Khulna Warriors", competition: "BPL", home: false },
  { date: "26", month: "Jul", opponent: "Rajshahi United", competition: "Federation Cup", home: true },
  { date: "02", month: "Aug", opponent: "Dhaka Mariners", competition: "BPL", home: false },
  { date: "09", month: "Aug", opponent: "Barisal Kings", competition: "BPL", home: true },
];

const news = [
  {
    tag: "Match report",
    date: "28 Jun 2026",
    title: "Titans edge Sylhet Rangers 2–1 at home",
    excerpt: "A late Farhan Islam strike sealed three points in front of a sold-out Titans Arena.",
  },
  {
    tag: "Transfer",
    date: "24 Jun 2026",
    title: "Club signs midfielder Karim Ahmed on a three-year deal",
    excerpt: "The 24-year-old joins from Dhaka Mariners ahead of the new BPL season.",
  },
  {
    tag: "Club news",
    date: "20 Jun 2026",
    title: "Titans Arena South Stand redevelopment begins next month",
    excerpt: "The upgrade will add 1,800 seats and a new fan zone concourse for matchdays.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-(--color-pitch)">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-line) 0, var(--color-line) 1px, transparent 1px, transparent 64px)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-(--color-gold) mb-4">
              Bangladesh Premier League · Est. 1998
            </span>
            <h1 className="font-(family-name:--font-display) text-(--color-line) text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-wide">
              ONE CITY.
              <br />
              ONE ROAR.
              <br />
              <span className="text-(--color-gold)">CHATTOGRAM TITANS.</span>
            </h1>
            <p className="mt-6 text-(--color-line)/70 max-w-md leading-relaxed">
              Follow every fixture, back the badge, and be part of the matchday from
              anywhere — live updates, ticket booking, and the loudest fan community
              on the coast.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/register"
                className="rounded-sm bg-(--color-kit) hover:bg-(--color-kit-dark) px-6 py-3 text-sm font-semibold uppercase tracking-wide text-(--color-line) transition-colors"
              >
                Join FanZone
              </a>
              <a
                href="/fixtures"
                className="rounded-sm border border-(--color-line)/30 hover:border-(--color-gold) px-6 py-3 text-sm font-semibold uppercase tracking-wide text-(--color-line) transition-colors"
              >
                See fixtures
              </a>
            </div>
          </div>

          <Scoreboard
            home="Titans"
            away="Sylhet Rangers"
            competition="BPL · Matchday 14"
            venue="Titans Arena, Chattogram"
            kickoff={new Date(Date.now() + 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 60 * 3)}
          />
        </div>
      </section>

      {/* Upcoming fixtures strip */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-(family-name:--font-display) text-2xl sm:text-3xl text-(--color-pitch)">
            Upcoming fixtures
          </h2>
          <a href="/fixtures" className="text-sm font-semibold text-(--color-kit) hover:text-(--color-kit-dark) transition-colors">
            Full schedule →
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x pb-2 -mx-1 px-1">
          {fixtures.map((f, i) => (
            <FixtureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* Latest news */}
      <section className="bg-(--color-concrete)">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-(family-name:--font-display) text-2xl sm:text-3xl text-(--color-pitch)">
              Latest news
            </h2>
            <a href="/news" className="text-sm font-semibold text-(--color-kit) hover:text-(--color-kit-dark) transition-colors">
              All news →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n, i) => (
              <NewsCard key={i} {...n} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured fan poll */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
              Have your say
            </span>
            <h2 className="font-(family-name:--font-display) text-2xl sm:text-3xl text-(--color-pitch) mt-2 mb-4">
              Fan polls, every matchday
            </h2>
            <p className="text-(--color-ink)/70 leading-relaxed max-w-md">
              From Player of the Month to matchday predictions, FanZone members shape
              the conversation around the club. Sign up to vote, comment, and track
              your fan stats.
            </p>
          </div>
          <PollWidget />
        </div>
      </section>
    </div>
  );
}
