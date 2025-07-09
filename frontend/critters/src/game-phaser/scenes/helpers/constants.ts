export enum EvolutionStage {
  BABY = 'baby',
  FINAL = 'final'
}

type SpriteConfig = {
  idle: string;
  eat: string;
  sick: string;
};

type EvolutionSprites = {
  [key in EvolutionStage]: SpriteConfig;
};

export const EVOLUTION_SPRITES: EvolutionSprites = {
  [EvolutionStage.BABY]: {
    idle: 'baby_idle',
    eat: 'baby_eat',
    sick: 'baby_sick'
  },
  [EvolutionStage.FINAL]: {
    idle: 'final_idle',
    eat: 'final_eat',
    sick: 'final_sick'
  }
}

export type FinalEvolutionVariant =
  'chiikawa' | 'shisa' | 'hachiware' | 'momonga' | 'usagi';

export const EVOLUTION_VARIANTS: Record<number, FinalEvolutionVariant> = {
  2.1: 'hachiware',
  2.2: 'shisa',
  2.3: 'usagi',
  2.4: 'momonga',
  2.5: 'chiikawa'
};

export interface Critter {
  critterId: string;
  critterName: string;
  evolution: number;
  isHealthy: boolean;
  hunger: number;
  happiness: number;
  energy: number;
  evolutionStage?: EvolutionStage;
  // Add any other critter properties
}

export interface CritterUpdate {
  critterId: string;
  changes: Partial<Critter>;
}
