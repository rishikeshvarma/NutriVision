
'use client';

import CaloriesCard from "./cards/CaloriesCard";
import MacrosCard from "./cards/MacrosCard";
import StreakCard from "./cards/StreakCard";
import WaterTracker from "./WaterTracker";

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <CaloriesCard />
        <MacrosCard />
        <WaterTracker />
        <StreakCard />
    </div>
  );
}
