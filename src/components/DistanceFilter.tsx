import React from 'react';
import { Slider } from "@/components/ui/slider";

interface DistanceFilterProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export const DistanceFilter = ({ value, onChange }: DistanceFilterProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Entfernungsbereich</h3>
      <div className="pt-4">
        <Slider
          defaultValue={value}
          value={value}
          onValueChange={onChange}
          min={0}
          max={50}
          step={1}
          minStepsBetweenThumbs={1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{value[0]} km</span>
          <span>{value[1]} km</span>
        </div>
      </div>
    </div>
  );
};