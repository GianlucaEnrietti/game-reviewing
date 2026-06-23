export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-400 md:flex-row">
        <p>© {year}</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-100">
            X/Twitter
          </a>
          <a href="#" className="hover:text-slate-100">
            Instagram
          </a>
          <a href="#" className="hover:text-slate-100">
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
