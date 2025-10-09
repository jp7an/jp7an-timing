import { RaceModeCalculator } from './base';
import { NormalModeCalculator } from './normal';
import { BackyardModeCalculator } from './backyard';
import { VarvloppModeCalculator } from './varvlopp';
import { TidsloppModeCalculator } from './tidslopp';

export const getModeCalculator = (mode: string): RaceModeCalculator => {
  switch (mode.toUpperCase()) {
    case 'NORMAL':
      return new NormalModeCalculator();
    case 'BACKYARD':
      return new BackyardModeCalculator();
    case 'VARVLOPP':
      return new VarvloppModeCalculator();
    case 'TIDSLOPP':
      return new TidsloppModeCalculator();
    default:
      throw new Error(`Okänt tävlingsläge: ${mode}`);
  }
};
