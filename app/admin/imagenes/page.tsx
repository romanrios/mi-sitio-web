import AdminNav from "@/components/admin/AdminNav";
import AdminImagenesApp from "@/features/imagenes/AdminImagenesApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestor de Imágenes | Admin",
};

export default function AdminImagenesPage() {
  return (
    <>
      <AdminNav className="max-w-5xl" />
      <AdminImagenesApp />
    </>
  );
}
