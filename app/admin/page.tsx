import AdminCardsApp from "@/features/cards/AdminCardsApp";

export default function AdminPage() {
  return (
    <>
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Panel de administración
        </h1>
      </div>
      <AdminCardsApp />
    </>
  );
}
