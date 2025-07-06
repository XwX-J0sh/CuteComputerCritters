import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import {PetMenu} from './scenes/PetMenu';
import {EventBusService} from '../app/services/event-bus.service';
import {CreateCritterForm} from './scenes/CreateCritterForm';

export default function StartGame(parentId: string, eventBus: EventBusService): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    render: {
      antialias: true,
      roundPixels: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    },
    width: 1124,
    height: 808,
    parent: parentId, // this should match your HTML div id
    backgroundColor: '#333399',
    scene: [Boot, Preloader, MainMenu, PetMenu, CreateCritterForm, Game, GameOver],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1124,
      height: 808,
    },
    //Dom container config
    dom: {
      createContainer: true
    }
  };

  const game = new Phaser.Game(config);

  // Store eventBus reference in game registry for scenes to access
  game.registry.set('eventBus', eventBus);

  return game;
}
