import Container from "@/components/ui/Container";
import { auth, signIn } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <Container className="justify-center">
        <p className="text-muted mb-4">
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
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover"
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
        <p className="text-muted">
          No tienes permisos para acceder a esta sección.
        </p>
      </Container>
    );
  }

  return <Container>{children}</Container>;
}
