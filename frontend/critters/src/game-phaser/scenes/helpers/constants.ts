export enum EvolutionStage {
  BABY = 'baby',
  FINAL = 'final'
}

type SpriteConfig = {
  idle: string;
  eat: string;
};

type EvolutionSprites = {
  [key in EvolutionStage]: SpriteConfig;
};

export const EVOLUTION_SPRITES: EvolutionSprites = {
  [EvolutionStage.BABY]: {
    idle: 'baby_idle',
    eat: 'baby_eat'
  },
  [EvolutionStage.FINAL]: {
    idle: 'final_idle',
    eat: 'final_eat'
  }
}

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
