import { Scene, GameObjects } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';
import {Subscription} from 'rxjs';
import {KeyboardNavigator} from './helpers/KeyboardNavigator';

export class PetMenu extends Scene {
  logo!: GameObjects.Image;
  critters: any[] = [];
  eventBus!: EventBusService;
  critterSubscription!: Subscription;
  private navigator?: KeyboardNavigator;
  private critterTexts: GameObjects.Text[] = [];
  private createButton?: GameObjects.Text;
  private titleText!: GameObjects.Text;
  private instructionsText!: GameObjects.Text;
  private noCrittersText?: GameObjects.Text;
  private aliveCritters: Array<{critter: any, originalIndex: number}> = [];


  constructor() {
    super('PetMenu');
  }

  create() {
    // Get eventBus from game registry
    this.eventBus = this.game.registry.get('eventBus');
    if (!this.eventBus) {
      console.error('EventBus not found in registry!');
      return;
    }

    this.logo = this.add.image(575, 130, 'logo').setScale(1);
    this.titleText = this.add.text(250, 300, 'Choose CRITTER', {
      font: '40px Press Start 2P',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.instructionsText = this.add.text(800, 400,
      'Move with W/S \n or up/down-arrow-keys \n Or Click using your Mouse',
      {
        font: '25px Press Start 2P',
        color: '#ffffff',
        lineSpacing: 10
      }).setOrigin(0.5);

    this.critterSubscription = this.eventBus.critters$.subscribe(critters => {
      this.critters = critters;
      console.log('Critters received:', critters);
      this.displayCritters();
    });

  }

  displayCritters() {
    // Only clear critter-specific objects
    this.critterTexts.forEach(text => text.destroy());
    this.critterTexts = [];
    this.noCrittersText?.destroy();
    this.createButton?.destroy();
    this.navigator?.destroy();

    this.aliveCritters = this.critters
      .map((critter, originalIndex) => ({ critter, originalIndex }))
      .filter(({ critter }) => !critter.isDead);

    if (this.aliveCritters.length === 0) {
      this.noCrittersText = this.add.text(100, 450, 'No critters available', {
        font: '20px Arial',
        color: '#ff0000',
      });
      this.addCreateButton(500);
      return;
    }

    const baseY = 350;
    const spacing = 30;

    this.aliveCritters.forEach(({ critter }, displayIndex) => {
      const critterText = this.add.text(120, baseY + displayIndex * spacing,
        `  ${critter.critterName}`,
        {
          font: '20px Arial',
          color: '#ef85e4',
          fixedWidth: 200,
          padding: { x: 10, y: 5 }
        }
      );

      critterText.setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.updateSelection(displayIndex))
        .on('pointerdown', () => this.selectCritter(displayIndex));

      this.critterTexts.push(critterText);
    });

    this.addCreateButton(baseY + this.aliveCritters.length * spacing + 50);
    this.setupNavigation();
    this.updateSelection(0);
  }

  private addCreateButton(yPosition: number) {
    this.createButton = this.add.text(120, yPosition, 'Create New Critter', {
      font: '20px Arial',
      color: '#ff0000',
      backgroundColor: '#ff9999',
      padding: { x: 20, y: 15 },
      fixedWidth: 200 // Match width with critter options
    });

    this.createButton.setInteractive({
      useHandCursor: true, // This enables the pointer cursor
      cursor: 'pointer'   // Alternative way to specify cursor
    });

    // Mouse hover states
    this.createButton.on('pointerover', () => {
      this.createButton!.setColor('#ffffff');
      this.createButton!.setBackgroundColor('#ff5555');
    });

    this.createButton.on('pointerout', () => {
      // Only revert if not selected by keyboard
      if (!this.navigator || this.navigator.currentIndex !== this.critters.length) {
        this.createButton!.setColor('#ff5555');
        this.createButton!.setBackgroundColor('#ffffff');
      }
    });

    this.createButton.on('pointerdown', () => {
      this.scene.start('CreateCritterForm');
    });
  }

  shutdown() {
    this.critterSubscription.unsubscribe();
    this.navigator?.destroy();
  }

  private setupNavigation() {
    this.navigator = new KeyboardNavigator(this, {
      maxIndex: this.aliveCritters.length +1, // +1 for create button
      onSelect: (index) => {
        if (index < this.aliveCritters.length) {
          this.selectCritter(index);
        } else {
          this.scene.start('CreateCritterForm');
        }
      },
      onChange: (index: number) => this.updateSelection(index)
    });
  }

  private updateSelection(index: number) {
    // Update critter texts
    this.critterTexts.forEach((text, i) => {
      const isSelected = i === index;
      const critterName = this.aliveCritters[i].critter.critterName;
      text.setColor(isSelected ? '#ffffff' : '#ef85e4');
      text.setText(isSelected ? `> ${critterName}` : `  ${critterName}`);
    });

    // Update create button appearance
    if (this.createButton) {
      const isCreateButtonSelected = index === this.aliveCritters.length;
      this.createButton.setColor(isCreateButtonSelected ? '#ffffff' : '#ff5555');
      this.createButton.setBackgroundColor(isCreateButtonSelected ? '#ff5555' : '#ff9999');
    }

    this.navigator?.setIndex(index);
  }

  private selectCritter(displayIndex: number) {
    const selectedCritter = this.aliveCritters[displayIndex].critter;
    this.game.registry.set('selectedCritter', selectedCritter);
    this.scene.start('Game', { selectedCritter });
  }
}
