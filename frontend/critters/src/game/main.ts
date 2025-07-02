import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import {PetMenu} from './scenes/PetMenu';

export default function StartGame(parentId: string, scenes?: Phaser.Scene[]): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1124,
    height: 768,
    parent: parentId, // this should match your HTML div id
    backgroundColor: '#333399',
    scene: [Boot, Preloader, MainMenu, PetMenu, Game, GameOver],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1124,
      height: 768,
    },
  };

  return new Phaser.Game(config);
}
