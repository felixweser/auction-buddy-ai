import React from 'react';
import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export const PriceFilter = ({ value, onChange }: PriceFilterProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Preisbereich</h3>
      <div className="pt-4">
        <Slider
          defaultValue={value}
          value={value}
          onValueChange={onChange}
          min={0}
          max={1000}
          step={10}
          minStepsBetweenThumbs={1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{value[0]}€</span>
          <span>{value[1]}€</span>
        </div>
      </div>
    </div>
  );
};