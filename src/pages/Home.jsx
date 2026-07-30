import { useEffect, useState } from "react";
import Scoreboard from "../components/Scoreboard";
import FixtureCard from "../components/FixtureCard";
import NewsCard from "../components/NewsCard";
import PollWidget from "../components/PollWidget";
import stadiumBg from "../assets/stadium-hero.webp";

const API = "http://localhost:3000";


function splitMatchDate(isoDate) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return { date: "--", month: "" };
  return {
    date: String(parsed.getDate()).padStart(2, "0"),
    month: parsed.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function formatNewsDate(isoDate) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", 
    { day: "2-digit", month: "short", year: "numeric" });
}

export default function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [fixturesError, setFixturesError] = useState("");

  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/matches?status=upcoming`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map((m) => ({
          ...splitMatchDate(m.date),
          opponent: m.opponent,
          competition: m.competition,
          home: !!m.home,
        }));
        setFixtures(mapped);
      })
      .catch((err) => {
        console.error("Failed to load fixtures:", err);
        if (!cancelled) setFixturesError("Couldn't load fixtures right now.");
      })
      .finally(() => {
        if (!cancelled) setFixturesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/news`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mapped = sorted.slice(0, 3).map((n) => ({
          tag: n.tag,
          date: formatNewsDate(n.date),
          title: n.title,
          excerpt: n.excerpt,
        }));
        setNews(mapped);
      })
      .catch((err) => {
        console.error("Failed to load news:", err);
        if (!cancelled) setNewsError("Couldn't load news right now.");
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-(--color-pitch)">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${stadiumBg})` }}
        />
        <div className="absolute inset-0 bg-(--color-pitch)/70" />
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
              anywhere. Live updates, ticket booking, and the loudest fan community
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

          <Scoreboard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-(family-name:--font-display) text-2xl sm:text-3xl text-(--color-pitch)">
            Upcoming fixtures
          </h2>
          <a href="/fixtures" className="text-sm font-semibold text-(--color-kit) hover:text-(--color-kit-dark) transition-colors">
            Full schedule →
          </a>
        </div>
        {fixturesLoading && (
          <p className="text-sm text-(--color-pitch)/60">Loading fixtures...</p>
        )}
        {!fixturesLoading && fixturesError && (
          <p className="text-sm text-red-500">{fixturesError}</p>
        )}
        {!fixturesLoading && !fixturesError && fixtures.length === 0 && (
          <p className="text-sm text-(--color-pitch)/60">No upcoming fixtures scheduled yet.</p>
        )}
        {!fixturesLoading && !fixturesError && fixtures.length > 0 && (
          <div className="flex gap-4 overflow-x-auto snap-x pb-2 -mx-1 px-1">
            {fixtures.map((f, i) => (
              <FixtureCard key={i} {...f} />
            ))}
          </div>
        )}
      </section>

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
          {newsLoading && (
            <p className="text-sm text-(--color-pitch)/60">Loading news...</p>
          )}
          {!newsLoading && newsError && (
            <p className="text-sm text-red-500">{newsError}</p>
          )}
          {!newsLoading && !newsError && news.length === 0 && (
            <p className="text-sm text-(--color-pitch)/60">No news posts yet.</p>
          )}
          {!newsLoading && !newsError && news.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((n, i) => (
                <NewsCard key={i} {...n} />
              ))}
            </div>
          )}
        </div>
      </section>

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
