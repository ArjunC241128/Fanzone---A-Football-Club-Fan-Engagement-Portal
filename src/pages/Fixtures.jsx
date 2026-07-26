import FixtureCard from "../components/FixtureCard";

export default function Fixtures() {
  const fixtures = [
    {
      date: "12",
      month: "AUG",
      opponent: "Abahani",
      competition: "Premier League",
      home: true,
    },
    {
      date: "18",
      month: "AUG",
      opponent: "Mohammedan",
      competition: "Federation Cup",
      home: false,
    },
    {
      date: "24",
      month: "AUG",
      opponent: "Bashundhara Kings",
      competition: "Premier League",
      home: true,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
        Upcoming Fixtures
      </h1>

      {/* Stacked, full-width cards on phones; horizontal scrolling strip from
          tablet width up, matching the fixture strip pattern used on the Home page. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:gap-5 md:gap-6 sm:overflow-x-auto sm:snap-x sm:pb-2 sm:-mx-1 sm:px-1">
        {fixtures.map((fixture, index) => (
          <div key={index} className="w-full sm:w-[260px] md:w-[280px] flex-shrink-0 snap-start">
            <FixtureCard {...fixture} />
          </div>
        ))}
      </div>
    </section>
  );
}