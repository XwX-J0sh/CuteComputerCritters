export enum EvolutionStage {
  BABY = 'baby',
  FINAL = 'final'
}

type SpriteConfig = {
  [key in AnimationType]: string;
};

type EvolutionSprites = {
  [key in EvolutionStage]: SpriteConfig;
};

export const EVOLUTION_SPRITES: EvolutionSprites = {
  [EvolutionStage.BABY]: {
    idle: 'baby_idle',
    eat: 'baby_eat',
    turn_sick: 'baby_turn_sick',
    sick_idle: 'baby_idle_sick'
  },
  [EvolutionStage.FINAL]: {
    idle: 'final_idle',
    eat: 'final_eat',
    turn_sick: 'final_turn_sick',
    sick_idle: 'final_sick_idle'
  }
}

export type AnimationType = 'idle' | 'eat' | 'turn_sick' | 'sick_idle';

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
  critterId: number;
  critterName: string;
  evolution: number;
  isHealthy: boolean;
  hunger: number;
  happiness: number;
  evolutionStage?: EvolutionStage;
  // Add any other critter properties
}

export interface CritterUpdate {
  critterId: string;
  changes: Partial<Critter>;
}

export const ANIMATION_FRAME_DATA: Record<
  FinalEvolutionVariant | 'baby',
  Record<AnimationType, { frames: number, frameRate: number }>
> = {
  baby: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 17, frameRate: 8 },
    turn_sick: { frames: 5, frameRate: 5 },
    sick_idle: { frames: 5, frameRate: 5 }
  },
  chiikawa: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 16, frameRate: 10 },
    turn_sick: { frames: 2, frameRate: 6 },
    sick_idle: { frames: 2, frameRate: 6 }
  },
  shisa: {
    idle: { frames: 3, frameRate: 4 },
    eat: { frames: 11, frameRate: 4 },
    turn_sick: { frames: 4, frameRate: 5 },
    sick_idle: { frames: 4, frameRate: 5 }
  },
  usagi: {
    idle: { frameRate: 2, frames: 1 },
    eat: { frameRate: 21, frames: 5 },
    turn_sick: { frameRate: 2, frames: 1 },
    sick_idle: { frameRate: 2, frames: 1 }
  },
  momonga: {
    idle: { frameRate: 2, frames: 1 },
    eat: { frameRate: 13, frames: 3 },
    turn_sick: { frameRate: 12, frames: 2 },
    sick_idle: { frameRate: 12, frames: 2 },
  },
  hachiware: {
    idle: { frameRate: 2, frames: 3 },
    eat: { frameRate: 17, frames: 1 },
    turn_sick: { frameRate: 12, frames: 2 },
    sick_idle: { frameRate: 12, frames: 2 }
  },

};
