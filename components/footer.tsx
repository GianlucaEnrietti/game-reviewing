import { X_PROFILE_URL } from "../utils/site-metadata";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-400 md:flex-row">
        <p>Vicios y Noticias © {year}</p>

        {X_PROFILE_URL && (
          <a
            href={X_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguir en X"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        )}
      </div>
    </footer>
  );
}
