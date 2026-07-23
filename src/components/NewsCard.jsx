export default function NewsCard({ post, onOpen }) {
  if (!post) return null;

  const { title, tag, date, excerpt } = post;

  return (
    <article className="flex flex-col rounded-sm border border-(--color-gold)/20 bg-(--color-pitch) hover:border-(--color-gold)/50 transition-colors">
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-(--color-gold)">
            {tag || "Club News"}
          </span>

          {date && (
            <span className="text-[11px] uppercase tracking-wide text-(--color-line)/50">
              {date}
            </span>
          )}
        </div>

        <h3 className="mt-2 font-(family-name:--font-display) text-lg leading-snug text-(--color-line)">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-(--color-line)/70 line-clamp-3">
            {excerpt}
          </p>
        )}
      </div>

      <div className="mt-4 px-5 pb-5">
        <button
          onClick={() => onOpen?.(post)}
          className="text-sm font-semibold uppercase tracking-wide text-(--color-gold) hover:text-(--color-line) transition-colors cursor-pointer"
        >
          Read more &rarr;
        </button>
      </div>
    </article>
  );
}