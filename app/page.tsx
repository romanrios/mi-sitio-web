import MensajesApp from "@/app/mensajes-app";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mi Sitio Web</h1>

        {session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {session.user.name}
              </span>
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

      <MensajesApp estaLogueado={!!session?.user} />
    </main>
  );
}