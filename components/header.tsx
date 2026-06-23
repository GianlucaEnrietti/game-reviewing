import Image from "next/image";
import Link from "next/link";
import { createClient } from "../utils/supabase/server";
import HeaderNavLinks from "./header-nav-links";
import HeaderUserMenu from "./header-user-menu";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center px-4">
        <div className="flex flex-1 items-center">
          <Link href="/" className="shrink-0">
            <Image
              src="/userIcon.jpg"
              alt="Josticks"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <HeaderNavLinks />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {user && <HeaderUserMenu email={user.email} />}
        </div>
      </nav>
    </header>
  );
}
