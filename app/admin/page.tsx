import AdminCardsApp from "@/app/admin/admin-cards-app";
import { auth, signIn } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4">
          Debes iniciar sesión para acceder al panel de administración.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Iniciar sesión con Google
          </button>
        </form>
      </main>
    );
  }

  if (!isAdmin(session.user.email)) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600">
          No tienes permisos para acceder a esta sección.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Panel de administración
        </h1>
      </div>
      <AdminCardsApp />
    </main>
  );
}