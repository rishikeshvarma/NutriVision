
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type CelebrationType = 'shower' | 'burst';

interface CelebrationContextType {
  isCelebrating: boolean;
  celebrationType: CelebrationType;
  triggerCelebration: (type?: CelebrationType) => void;
  stopCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const CelebrationProvider = ({ children }: { children: ReactNode }) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('shower');

  const triggerCelebration = useCallback((type: CelebrationType = 'shower') => {
    setCelebrationType(type);
    setIsCelebrating(true);
  }, []);

  const stopCelebration = useCallback(() => {
    setIsCelebrating(false);
  }, []);

  return (
    <CelebrationContext.Provider value={{ isCelebrating, celebrationType, triggerCelebration, stopCelebration }}>
      {children}
    </CelebrationContext.Provider>
  );
};

export const useCelebration = (): CelebrationContextType => {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    return {
      isCelebrating: false,
      celebrationType: 'shower',
      triggerCelebration: () => {},
      stopCelebration: () => {},
    };
  }
  return context;
};
