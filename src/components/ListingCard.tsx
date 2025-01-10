import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isNegotiable: boolean;
  sellerId: string;
  onChat: (params: {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div 
        className="cursor-pointer"
        onClick={() => navigate(`/property/${id}`)}
      >
        <div className="aspect-video relative overflow-hidden bg-accent">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
          <p className="text-xl font-bold text-[#D3E4FD] mb-2">
            €{price.toLocaleString()}
            {isNegotiable && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Negotiable)
              </span>
            )}
          </p>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="agora"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onChat({ listingId: id, sellerId, productTitle: title, price, isNegotiable });
          }}
        >
          <MessageCircle />
          <span>Contact Seller</span>
        </Button>
      </CardFooter>
    </Card>
  );
};