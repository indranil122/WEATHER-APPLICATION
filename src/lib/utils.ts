import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTemp(tempC: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? tempC : (tempC * 9/5) + 32;
}
