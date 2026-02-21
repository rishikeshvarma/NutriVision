
'use client';

import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame } from 'lucide-react';
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

export default function CaloriesCard() {
  const { todayLog } = useUserData();

  const consumed = todayLog?.meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.calories += item.calories;
    });
    return acc;
  }, { calories: 0 }) || { calories: 0 };

  const goal = todayLog?.calorieGoal || 0;
  
  const calorieData = [
    { name: 'consumed', value: consumed.calories, fill: 'hsl(var(--primary))' },
    { name: 'remaining', value: Math.max(0, goal - consumed.calories), fill: 'hsl(var(--muted))' }
  ];

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline">
          <Flame className="text-primary" />
          Calories
      </CardTitle>
      <CardDescription>
          {Math.max(0, Math.round(goal - consumed.calories))} kcal left
      </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2">
        <ChartContainer config={{}} className="w-24 h-24">
            <PieChart>
                <Pie data={calorieData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={42} startAngle={90} endAngle={450} strokeWidth={0}>
                {calorieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                    content={<CustomLabel icon={Flame} color={'hsl(var(--primary))'} size="md" />}
                    position="center"
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
        <div className="text-center">
            <span className="text-3xl font-bold text-primary">{Math.round(consumed.calories)}</span>
            <span className="text-sm text-muted-foreground">/ {goal} kcal</span>
        </div>
      </CardContent>
    </Card>
  );
}
