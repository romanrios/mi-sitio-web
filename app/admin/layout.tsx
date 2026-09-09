import Container from "@/components/ui/Container";
import { auth, signIn } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await auth();

  if (!session?.user) {
    return (
      <Container className="justify-center">
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
      </Container>
    );
  }

  if (!isAdmin(session.user.email)) {
    return (
      <Container className="justify-center">
        <p className="text-gray-600">
          No tienes permisos para acceder a esta sección.
        </p>
      </Container>
    );
  }

  return <Container>{children}</Container>;
}
