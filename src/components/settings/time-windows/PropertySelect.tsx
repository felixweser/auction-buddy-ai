import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property } from "@/types/property";

interface PropertySelectProps {
  properties?: Property[];
  selectedProperty: string | null;
  onPropertyChange: (value: string) => void;
}

export function PropertySelect({ properties, selectedProperty, onPropertyChange }: PropertySelectProps) {
  return (
    <Select
      value={selectedProperty || ""}
      onValueChange={onPropertyChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Immobilie auswählen" />
      </SelectTrigger>
      <SelectContent>
        {properties?.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}