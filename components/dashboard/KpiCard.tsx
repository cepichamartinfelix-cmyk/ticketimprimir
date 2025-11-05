
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
  return (
    <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
      <h3 className="text-sm font-medium text-theme-card-foreground/80">{title}</h3>
      <p className="text-3xl font-bold text-theme-primary mt-2">{value}</p>
    </div>
  );
};

export default KpiCard;
