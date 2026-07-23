import { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";

const API = "http://localhost:3000";

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/news`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // Newest first. Every document here was written by an Admin through the
        // Admin Dashboard's News tab (POST /news, PUT /news/:id) — this page never
        // writes to the collection, it only reads what the Admin has published.
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load news:", err);
        setError("Couldn't load news right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const tags = useMemo(() => {
    const unique = new Set(posts.map((p) => p.tag).filter(Boolean));
    return ["All", ...unique];
  }, [posts]);

  const visiblePosts = useMemo(
    () => (activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag)),
    [posts, activeTag]
  );

  return (
    <main className="bg-(--color-pitch) min-h-screen">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <header className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-(--color-gold)">
            Club Updates
          </span>
          <h1 className="mt-1 font-(family-name:--font-display) text-3xl sm:text-4xl text-(--color-line)">
            Titans News
          </h1>
          <p className="mt-2 text-sm text-(--color-line)/60 max-w-xl">
            Match reports, transfers, and announcements straight from the club.
          </p>
        </header>

        {tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  activeTag === tag
                    ? "bg-(--color-kit) text-(--color-line)"
                    : "border border-(--color-gold)/25 text-(--color-line)/70 hover:border-(--color-gold)/60"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-sm text-(--color-line)/60">Loading news...</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && visiblePosts.length === 0 && (
          <p className="text-sm text-(--color-line)/60">
            No news posts yet. Check back soon.
          </p>
        )}

        {!loading && !error && visiblePosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visiblePosts.map((post) => (
              <NewsCard key={post._id} post={post} onOpen={setOpenPost} />
            ))}
          </div>
        )}
      </div>

      {openPost && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenPost(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm border border-(--color-gold)/25 bg-(--color-pitch) p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-(--color-gold)">
                {openPost.tag || "Club News"}
              </span>
              <button
                onClick={() => setOpenPost(null)}
                aria-label="Close"
                className="text-(--color-line)/60 hover:text-(--color-line) cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <h2 className="mt-2 font-(family-name:--font-display) text-2xl text-(--color-line)">
              {openPost.title}
            </h2>
            {openPost.date && (
              <p className="mt-1 text-xs uppercase tracking-wide text-(--color-line)/50">
                {openPost.date}
              </p>
            )}

            <p className="mt-4 text-sm leading-relaxed text-(--color-line)/85 whitespace-pre-line">
              {openPost.body || openPost.excerpt}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}