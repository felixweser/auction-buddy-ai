import { useState } from "react";
import { PropertyDetails } from "@/types/property";
import { PropertyStats } from "./PropertyStats";
import { BookingDialog } from "./BookingDialog";
import { ImageCarousel } from "./ImageCarousel";
import { PropertyActions } from "./PropertyActions";

interface PropertyHeroProps {
  imageUrl: string;
  title: string;
  price: number;
  details: PropertyDetails;
}

export const PropertyHero = ({ imageUrl, title, price, details }: PropertyHeroProps) => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const images = [imageUrl, imageUrl, imageUrl];

  return (
    <div className="relative h-[70vh] group">
      <PropertyActions onBookingClick={() => setShowBookingDialog(true)} />
      
      <ImageCarousel images={images} title={title} />

      <BookingDialog
        propertyId={details.property_id || ""}
        propertyTitle={title}
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
      />

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-3xl font-bold text-foreground">
              €{price.toLocaleString()}
            </p>
          </div>
          <PropertyStats price={price} details={details} />
        </div>
      </div>
    </div>
  );
};