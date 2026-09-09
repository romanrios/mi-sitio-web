import { signIn, signOut } from "@/auth";
import { site } from "@/content/site";
import type { Session } from "next-auth";

export default function Header({ session }: { session: Session | null }) {
  return (
    <div className="w-full max-w-md flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-800">{site.name}</h1>

      {session?.user ? (
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <button
              type="submit"
              className="text-sm text-red-600 hover:underline"
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
            className="bg-white border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded-md hover:bg-gray-50"
          >
            Iniciar sesión con Google
          </button>
        </form>
      )}
    </div>
  );
}
