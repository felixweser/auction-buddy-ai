import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  return (
    <Carousel className="w-full h-full">
      <CarouselContent>
        {images.map((img, index) => (
          <CarouselItem key={index} className="h-[70vh]">
            <div className="relative w-full h-full">
              <img
                src={img}
                alt={`${title} - Bild ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Carousel>
  );
}