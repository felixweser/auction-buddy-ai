import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";

interface AuctionCardProps {
  title: string;
  description: string;
  currentBid: number;
  imageUrl: string;
  timeLeft: string;
  onBid: () => void;
  onChat: () => void;
}

export const AuctionCard = ({
  title,
  description,
  currentBid,
  imageUrl,
  timeLeft,
  onBid,
  onChat,
}: AuctionCardProps) => {
  return (
    <Card className="auction-card overflow-hidden">
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
          <span className="font-bold">${currentBid}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{timeLeft}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={onBid} className="flex-1 bid-button">
          Place Bid
        </Button>
        <Button onClick={onChat} variant="outline" className="flex-1">
          Ask Question
        </Button>
      </CardFooter>
    </Card>
  );
};