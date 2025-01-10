import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'This Property', value: 100 },
  { name: 'Neighborhood Avg', value: 85 },
  { name: 'City Avg', value: 70 },
];

export const KeyMetrics = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Key Metrics & Comparisons</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};