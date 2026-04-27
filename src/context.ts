import { createContext, useContext } from 'react';

export type TemperatureUnit = 'C' | 'F';

export const UnitContext = createContext<{
  unit: TemperatureUnit;
  toggleUnit: () => void;
}>({
  unit: 'C',
  toggleUnit: () => {},
});

export const useUnit = () => useContext(UnitContext);
