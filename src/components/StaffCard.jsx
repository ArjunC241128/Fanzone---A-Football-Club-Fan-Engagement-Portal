function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function StaffCard({ name, role }) {
  return (
    <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-6 text-center hover:border-(--color-kit)/40 transition-colors">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-(--color-pitch) flex items-center justify-center">
        <span className="font-(family-name:--font-display) text-(--color-gold) text-lg">
          {initials(name)}
        </span>
      </div>
      <h3 className="font-semibold text-(--color-pitch)">{name}</h3>
      <p className="text-xs uppercase tracking-widest text-(--color-ink)/50 mt-1">{role}</p>
    </div>
  );
}
