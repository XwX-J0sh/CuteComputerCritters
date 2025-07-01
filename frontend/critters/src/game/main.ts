import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';

export default function StartGame(parentId: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: parentId, // this should match your HTML div id
    backgroundColor: '#028af8',
    scene: [Boot, Preloader, MainMenu, Game, GameOver],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1024,
      height: 768
    },
  };

  return new Phaser.Game(config);
}
