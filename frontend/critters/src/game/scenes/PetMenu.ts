import { Scene, GameObjects } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';
import {Subscription} from 'rxjs';

export class PetMenu extends Scene {
  logo!: GameObjects.Image;
  critters: any[] = [];
  eventBus!: EventBusService;
  critterSubscription!: Subscription;

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

    // Now you can safely use this.eventBus
    this.critterSubscription = this.eventBus.critters$.subscribe(critters => {
      this.critters = critters;
      console.log('Critters received:', critters);
      this.displayCritters();
    });

    this.logo = this.add.image(575, 130, 'logo')
    this.logo.setScale(1);
    this.add.text(250, 400, 'Choose CRITTER', {
      font: '30px Press Start 2 P',
      color: '#ffffff',
    }).setOrigin(0.5);


    //subscribe to the critters emitted by angular
    this.critterSubscription = this.eventBus.critters$.subscribe(critters => {
      this.critters = critters;
      console.log('Critters received:', critters);
      this.displayCritters();
    });

  }

  displayCritters() {
    // Clear previous critters
    this.children.removeAll();

    this.logo = this.add.image(575, 130, 'logo').setScale(1);
    this.add.text(250, 400, 'Choose CRITTER', {
      font: '30px Press Start 2 P',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Handle empty state
    if (this.critters.length === 0) {
      const noCrittersText = this.add.text(100, 450, 'No critters available', {
        font: '20px Arial',
        color: '#ff0000',
      });
      this.addCreateButton(500);
      return;
    }

    // Display each critter
    this.critters.forEach((critter, index) => {
      const critterText = this.add.text(100, 450 + index * 30, critter.critterName, {
        font: '20px Arial',
        color: '#00ff00',
      });
      critterText.setInteractive();
      critterText.on('pointerdown', () => {
        console.log('Selected critter:', critter.critterName);
        // You might want to store selected critter in registry
        this.game.registry.set('selectedCritter', critter);
        this.scene.start('Game', { selectedCritter: critter });
      });
    });

    this.addCreateButton(450 + this.critters.length * 30 + 50);
  }

  private addCreateButton(yPosition: number) {
    const createButton = this.add.text(100, yPosition, 'Create New Critter', {
      font: '20px Arial',
      color: '#ff0000',
      backgroundColor: '#ff9999',
      padding: { x: 20, y: 15 },
    });
    createButton.setInteractive();
    createButton.on('pointerdown', () => {
      this.showCreateCritterForm();
    });
  }

  showCreateCritterForm() {
    // Clear previous UI
    this.children.removeAll();

    // Add back button
    const backButton = this.add.text(50, 50, '← Back', {
      font: '20px Arial',
      color: '#ffffff'
    });
    backButton.setInteractive();
    backButton.on('pointerdown', () => this.displayCritters());

    // Add form title
    this.add.text(250, 150, 'Create New Critter', {
      font: '30px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Current input text
    let inputText = '';
    const maxLength = 12; // Maximum name length

    // Display current input
    const nameDisplay = this.add.text(250, 220, inputText.padEnd(maxLength, '_'), {
      font: '24px Arial',
      color: '#ffffff',
      letterSpacing: 5
    }).setOrigin(0.5);

    // Character selection grid
    const alphabet = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f'],
      ['G', 'H', 'I', 'J', 'K', 'L','g', 'h', 'i', 'j', 'k', 'l'],
      ['M', 'N', 'O', 'P', 'Q', 'R', 'm', 'n', 'o', 'p', 'q', 'r'],
      ['S', 'T', 'U', 'V', 'W', 'X', 's', 't', 'u', 'v', 'w', 'x'],
      ['Y', 'Z', '0', '1', '2', '3', 'y', 'z', '(', ')', '*', '&'],
      ['4', '5', '6', '7', '8', '9', '!', '?', '@', '$', '<', '>']
    ];

    // Selection cursor position
    let cursorX = 0;
    let cursorY = 0;

    // Grid configurations
    const gridStartX = 150;
    const gridStartY = 300;
    const cellSize = 40;
    const padding = 30;

    const charTexts: Phaser.GameObjects.Text[][] = [];


    alphabet.forEach((row, y) => {
      charTexts[y] = [];
      row.forEach((char, x) => {
        const xPos = gridStartX + (x * cellSize) + (x >= 6 ? padding : 0);
        charTexts[y][x] = this.add.text(
          gridStartX + x * cellSize,
          gridStartY + y * cellSize,
          char,
          {
            font: '20px Arial',
            color: '#aaaaaa',
            // Add visual separator for the padding area
            backgroundColor: x === 5 ? 'transparent' : undefined,
            padding: x === 5 ? { right: padding/2 } : undefined
          }
        );
      });
    });

    // Draw cursor
    const cursor = this.add.rectangle(
      gridStartX + cursorX * cellSize - 15,
      gridStartY + cursorY * cellSize - 10,
      30,
      30,
      0xffffff,
      0.3
    );

    // Instructions
    this.add.text(250, 550, 'Arrow Keys/WASD: Move cursor', {
      font: '16px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.add.text(250, 580, 'SPACE/ENTER: Select letter', {
      font: '16px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.add.text(250, 610, 'BACKSPACE: Delete last letter', {
      font: '16px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Submit button
    const submitButton = this.add.text(250, 650, 'CONFIRM NAME', {
      font: '20px Arial',
      color: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    submitButton.setInteractive();

    // Input handling
    const updateCursor = () => {
      cursor.x = gridStartX + cursorX * cellSize + 7;
      cursor.y = gridStartY + cursorY * cellSize + 10;

      // Highlight current character
      alphabet.forEach((row, y) => {
        row.forEach((char, x) => {
          charTexts[y][x].setColor(x === cursorX && y === cursorY ? '#ffffff' : '#aaaaaa');
        });
      });
    };

    const addCharacter = (char: string) => {
      if (inputText.length < maxLength) {
        inputText += char;
        nameDisplay.setText(inputText.padEnd(maxLength, '_'));
      }
    };

    const deleteCharacter = () => {
      if (inputText.length > 0) {
        inputText = inputText.slice(0, -1);
        nameDisplay.setText(inputText.padEnd(maxLength, '_'));
      }
    };

    // Keyboard controls
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      // Movement
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        cursorX = Phaser.Math.Wrap(cursorX - 1, 0, alphabet[0].length);
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        cursorX = Phaser.Math.Wrap(cursorX + 1, 0, alphabet[0].length);
      } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        cursorY = Phaser.Math.Wrap(cursorY - 1, 0, alphabet.length);
      } else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
        cursorY = Phaser.Math.Wrap(cursorY + 1, 0, alphabet.length);
      }
      // Selection
      else if (event.key === ' ' || event.key === 'Enter') {
        addCharacter(alphabet[cursorY][cursorX]);
      }
      // Deletion
      else if (event.key === 'Backspace') {
        deleteCharacter();
      }

      updateCursor();
    });

    // Submit handler
    submitButton.on('pointerdown', () => {
      if (inputText.trim()) {
        // Emit create event to Angular
        this.eventBus.createCritter.emit(inputText.trim());
        submitButton.setText('CREATING...');
      }
    });

    // Initialize cursor
    updateCursor();
  }

  shutdown() {
    this.critterSubscription.unsubscribe();
  }

}
