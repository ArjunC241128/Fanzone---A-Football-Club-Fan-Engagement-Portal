import { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";

const API = "http://localhost:3000";

const SORT_OPTIONS = [
  { key: "recent", label: "Most Recent" },
  { key: "popular", label: "Most Popular" }
];

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/news`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // Every document here was written by an Admin through the Admin Dashboard's
        // News tab (POST /news, PUT /news/:id) — this page never writes to the
        // collection except to bump a post's view count when a fan reads it in full.
        setPosts(data);
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

  const visiblePosts = useMemo(() => {
    const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);
    const sorted = [...filtered];
    if (sortBy === "popular") {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
  }, [posts, activeTag, sortBy]);

  
  const handleOpen = (post) => {
    setOpenPost(post);
    setPosts((list) => list.map((p) => (p._id === post._id ? { ...p, views: (p.views || 0) + 1 } : p)));
    fetch(`${API}/news/${post._id}/view`, { method: "PATCH" }).catch((err) => {
      console.error("Failed to record view:", err);
    });
  };

  return (
    <main className="bg-(--color-pitch) min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <header className="mb-6 sm:mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-(--color-gold)">
            Club Updates
          </span>
          <h1 className="mt-1 font-(family-name:--font-display) text-2xl sm:text-3xl md:text-4xl text-(--color-line)">
            Titans News
          </h1>
          <p className="mt-2 text-sm text-(--color-line)/60 max-w-xl">
            Match reports, transfers, and announcements straight from the club.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          {tags.length > 1 ? (
            <div className="flex flex-wrap gap-2">
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
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="uppercase tracking-wide text-(--color-line)/50 font-semibold mr-1">
              Sort by
            </span>
            <div className="flex gap-1 rounded-full border border-(--color-gold)/25 p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-3 py-1 rounded-full font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                    sortBy === opt.key
                      ? "bg-(--color-kit) text-(--color-line)"
                      : "text-(--color-line)/60 hover:text-(--color-line)"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {visiblePosts.map((post) => (
              <NewsCard key={post._id} post={post} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>

      {openPost && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setOpenPost(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm border border-(--color-gold)/25 bg-(--color-pitch) p-5 sm:p-6 md:p-8"
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

            <h2 className="mt-2 font-(family-name:--font-display) text-xl sm:text-2xl text-(--color-line)">
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