import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';

export default function MenuItemListItem({ item, onEdit, onDelete }) {
  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <img
          src={item.imagem_url || defaultImage}
          alt={item.nome}
          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
          onError={(e) => { e.target.src = defaultImage }}
        />
        <div className="flex-1">
          <h4 className="font-bold text-lg">{item.nome}</h4>
          <p className="text-sm text-gray-600 line-clamp-1">{item.descricao}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">€{item.preco.toFixed(2)}</Badge>
            <Badge variant="outline">{item.categoria}</Badge>
            <Badge variant={item.disponivel ? 'default' : 'destructive'} className={item.disponivel ? "bg-green-100 text-green-800" : ""}>
                {item.disponivel ? 'Disponível' : 'Indisponível'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}