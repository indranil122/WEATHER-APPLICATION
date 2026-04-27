export function getMoonPhase(date: Date) {
  // Known new moon: Jan 6, 2000 at ~18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000;
  
  const current = date.getTime();
  const elapsed = current - knownNewMoon;
  let phase = (elapsed % lunarCycle) / lunarCycle;
  if (phase < 0) {
    phase += 1;
  }
  
  // Phase represents 0.0 (New) -> 0.25 (First Quarter) -> 0.5 (Full) -> 0.75 (Last Quarter) -> 1.0 (New)
  return phase;
}

export function getMoonPhaseName(phase: number) {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

export function getNextMoonPhaseDate(currentDate: Date, targetPhase: number) {
  const lunarCycle = 29.53058867;
  const currentPhase = getMoonPhase(currentDate);
  
  let phaseDiff = targetPhase - currentPhase;
  if (phaseDiff < 0) {
    phaseDiff += 1;
  }
  
  const daysUntil = phaseDiff * lunarCycle;
  return new Date(currentDate.getTime() + daysUntil * 24 * 60 * 60 * 1000);
}
