import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isNegotiable: boolean;
  sellerId: string;
  onChat: (props: { 
    listingId: string;
    sellerId: string;
    productTitle: string;
    price: number;
    isNegotiable: boolean;
  }) => void;
}

export const ListingCard = ({
  id,
  title,
  description,
  price,
  imageUrl,
  isNegotiable,
  sellerId,
  onChat,
}: ListingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden cursor-pointer"
      onClick={() => navigate(`/property/${id}`)}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </div>
      <CardHeader>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="w-4 h-4" />
          <span className="font-bold">${price}</span>
          {isNegotiable && (
            <span className="text-sm text-muted-foreground">(Negotiable)</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onChat({ 
              listingId: id, 
              sellerId, 
              productTitle: title,
              price,
              isNegotiable
            });
          }} 
          className="w-full"
          variant="outline"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isNegotiable ? "Negotiate Price" : "Contact Seller"}
        </Button>
      </CardFooter>
    </Card>
  );
};