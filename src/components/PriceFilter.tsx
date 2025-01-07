import React from 'react';
import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export const PriceFilter = ({ value, onChange }: PriceFilterProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-white">Price Range</h3>
      <Slider
        value={value}
        onValueChange={onChange}
        max={1000}
        step={10}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-400">
        <span>${value[0]}</span>
        <span>${value[1]}</span>
      </div>
    </div>
  );
};