import Card from "@/components/ui/Card";

type CardItemProps = {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
};

export default function CardItem({
  titulo,
  descripcion,
  imagenUrl,
}: CardItemProps) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <img
        src={imagenUrl}
        alt={titulo}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground mb-1">{titulo}</h3>
        <p className="text-sm text-muted flex-1">{descripcion}</p>
      </div>
    </Card>
  );
}
