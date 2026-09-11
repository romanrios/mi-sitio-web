import ThemeToggle from "@/components/theme/ThemeToggle";
import { signIn, signOut } from "@/auth";
import { site } from "@/content/site";
import type { Session } from "next-auth";

export default function Header({ session }: { session: Session | null }) {
  return (
    <div className="w-full max-w-md flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{session.user.name}</span>
              <button
                type="submit"
                className="text-sm text-error hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button
              type="submit"
              className="bg-surface border border-border-strong text-muted text-sm px-3 py-2 rounded-md hover:bg-surface-hover"
            >
              Iniciar sesión con Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
