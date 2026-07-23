import Crest from "./Crest";

export default function Footer() {
  return (
    <footer className="bg-(--color-pitch) text-(--color-line) mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Crest size={38} />
              <span className="font-(family-name:--font-display) text-lg tracking-wide">
                TITANS
              </span>
            </div>
            <p className="text-sm text-(--color-line)/70 leading-relaxed max-w-xs">
              Titans Arena, Agrabad, Chattogram — home of Chattogram Titans FC since 1998.
            </p>
          </div>

          <div>
            <h3 className="font-(family-name:--font-display) text-sm tracking-widest text-(--color-gold) mb-4">
              CLUB
            </h3>
            <ul className="space-y-2 text-sm text-(--color-line)/70">
              <li><a href="/about" className="hover:text-(--color-line) transition-colors">About the club</a></li>
              <li><a href="/fixtures" className="hover:text-(--color-line) transition-colors">Fixtures &amp; results</a></li>
              <li><a href="/news" className="hover:text-(--color-line) transition-colors">News</a></li>
              <li><a href="/contact" className="hover:text-(--color-line) transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-(family-name:--font-display) text-sm tracking-widest text-(--color-gold) mb-4">
              FANZONE
            </h3>
            <ul className="space-y-2 text-sm text-(--color-line)/70">
              <li><a href="/register" className="hover:text-(--color-line) transition-colors">Create account</a></li>
              <li><a href="/fixtures" className="hover:text-(--color-line) transition-colors">Book a match</a></li>
              <li><a href="/login" className="hover:text-(--color-line) transition-colors">My bookings</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-(family-name:--font-display) text-sm tracking-widest text-(--color-gold) mb-4">
              FOLLOW
            </h3>
            <ul className="space-y-2 text-sm text-(--color-line)/70">
              <li><a href="#" className="hover:text-(--color-line) transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-(--color-line) transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-(--color-line) transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-(--color-line)/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-(--color-line)/50">
          <span>© {new Date().getFullYear()} Chattogram Titans FC. All rights reserved.</span>
        
        </div>
      </div>
    </footer>
  );
}
