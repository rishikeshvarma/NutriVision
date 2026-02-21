
'use client';

import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beef, Wheat, Droplets } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Label } from 'recharts';

function CustomLabel({ viewBox, icon: Icon, color, size = 'md' }: any) {
    const { cx, cy } = viewBox;
    const iconSize = size === 'lg' ? 32 : 24;
    const iconClass = size === 'lg' ? "h-8 w-8" : "h-5 w-5";
    const offset = iconSize / 2;

    return (
      <foreignObject x={cx - offset} y={cy - offset} width={iconSize} height={iconSize}>
          <Icon className={iconClass} style={{ color }} />
      </foreignObject>
    );
};

export default function MacrosCard() {
  const { todayLog } = useUserData();

  const consumed = todayLog?.meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.protein += item.protein;
      acc.carbs += item.carbohydrates;
      acc.fat += item.fat;
    });
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 }) || { protein: 0, carbs: 0, fat: 0 };

  const goals = {
    protein: todayLog?.proteinGoal || 0,
    carbs: todayLog?.carbGoal || 0,
    fat: todayLog?.fatGoal || 0,
  };
  
  const macros = [
    { name: 'Protein', value: consumed.protein, goal: goals.protein, color: 'hsl(var(--chart-1))', icon: Beef },
    { name: 'Carbs', value: consumed.carbs, goal: goals.carbs, color: 'hsl(var(--chart-2))', icon: Wheat },
    { name: 'Fat', value: consumed.fat, goal: goals.fat, color: 'hsl(var(--chart-3))', icon: Droplets },
  ];

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-base">
          Macronutrients
      </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-around items-center pt-6">
      {macros.map(macro => (
          <MacroProgress key={macro.name} {...macro} />
      ))}
      </CardContent>
    </Card>
  );
}

function MacroProgress({ icon: Icon, name, value, goal, color }: { icon: React.ElementType, name: string, value: number, goal: number, color: string }) {
    const data = [
      { name: 'consumed', value: value, fill: color },
      { name: 'remaining', value: Math.max(0, goal-value), fill: 'hsl(var(--muted))' }
    ];

    return (
        <div className="flex flex-col items-center gap-2">
            <ChartContainer config={{}} className="w-16 h-16">
              <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={18} outerRadius={24} startAngle={90} endAngle={450} strokeWidth={0}>
                      {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} /> )}
                      <Label content={<CustomLabel icon={Icon} color={color} />} position="center" />
                  </Pie>
              </PieChart>
            </ChartContainer>
            <div className="text-center">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{Math.round(value)} / {goal}g</p>
            </div>
        </div>
    )
}
