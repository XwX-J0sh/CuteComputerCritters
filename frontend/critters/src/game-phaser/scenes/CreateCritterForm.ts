import { Scene, GameObjects } from 'phaser';
import { EventBusService } from '../../app/services/event-bus.service';

export class CreateCritterForm extends Scene {
  private eventBus!: EventBusService;
  private inputText: string = '';
  private charTexts: GameObjects.Text[][] = [];
  private cursor!: GameObjects.Rectangle;
  private cursorX: number = 0;
  private cursorY: number = 0;
  private nameDisplay!: GameObjects.Text;
  private alphabet: string[][] = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f'],
    ['G', 'H', 'I', 'J', 'K', 'L', 'g', 'h', 'i', 'j', 'k', 'l'],
    ['M', 'N', 'O', 'P', 'Q', 'R', 'm', 'n', 'o', 'p', 'q', 'r'],
    ['S', 'T', 'U', 'V', 'W', 'X', 's', 't', 'u', 'v', 'w', 'DEL'],
    ['Y', 'Z', '0', '1', '2', '3', 'x', 'y', 'z', '(', ')', 'BACK'],
    ['4', '5', '6', '7', '8', '9', '!', '?', '@', '$', '&', 'SAVE']
  ];

  constructor() {
    super('CreateCritterForm');
  }

  create() {
    this.eventBus = this.game.registry.get('eventBus');

    // Title
    this.add.text(250, 150, 'Create New Critter', {
      font: '30px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Name display
    this.nameDisplay = this.add.text(250, 220, this.inputText.padEnd(12, '_'), {
      font: '24px Arial',
      color: '#ffffff',
      letterSpacing: 5
    }).setOrigin(0.5);

    // Grid setup
    const gridStartX = 150;
    const gridStartY = 300;
    const cellSize = 45;
    const padding = 40;

    // Create grid
    this.alphabet.forEach((row, y) => {
      this.charTexts[y] = [];
      row.forEach((char, x) => {
        const xPos = gridStartX + (x * cellSize) + (x >= 6 ? padding : 0) +
          (x >= 11 ? 5 : 0);
        const isCommand = ['BACK', 'SAVE', 'DEL'].includes(char);

        // Create text with centered origin
        const text = this.add.text(
          xPos + cellSize/2,  // Center position
          gridStartY + (y * cellSize) + cellSize/2,  // Center position
          char,
          {
            font: '20px Arial',
            color: '#aaaaaa',
            backgroundColor: isCommand ? '#333333' : undefined,
            padding: isCommand ? { x: 5, y: 5 } : { x: 5, y: 5 }
          }
        ).setOrigin(0.2);  // Center both text and background

        // Extra padding for command buttons
        if (isCommand) {
          text.setStyle({
            font: '18px Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 25, y: 12 }
          });
        }

        this.charTexts[y][x] = text;

        // Inside the grid creation loop, after creating each text object:
        text.setInteractive({ useHandCursor: true }); // Makes cursor change on hover

        // Add hover effects
        text.on('pointerover', () => {
          text.setColor('#ffffff');
          if (['BACK', 'SAVE', 'DEL'].includes(char)) {
            text.setBackgroundColor(char === 'BACK' ? '#ff0000' : '#00ff00');
          }
        });

        text.on('pointerout', () => {
          if (!(this.cursorX === x && this.cursorY === y)) {
            text.setColor('#aaaaaa');
            if (['BACK', 'SAVE', 'DEL'].includes(char)) {
              text.setBackgroundColor('#555555');
            }
          }
        });

        // Add click handler
        text.on('pointerdown', () => {
          this.handleCharacterSelection(char);
        });
      });
    });

    // Cursor
    this.cursor = this.add.rectangle(
      gridStartX + (this.cursorX * cellSize) + (this.cursorX >= 6 ? padding : 0) +
      (this.cursorX >= 11 ? 0 : 0) + cellSize/2,
      gridStartY + (this.cursorY * cellSize) + cellSize/2,
      cellSize - 10,
      cellSize - 10,
      0xffffff,
      0.3
    ).setOrigin(0.2);

    // Instructions
    this.add.text(950, 350, 'Move cursor with arrow keys/WASD\nSPACE/Select letter with ENTER\nDelete last letter with BACKSPACE or DEL\n You can also click with your mouse', {
      font: '16px Arial',
      color: '#aaaaaa',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Keyboard controls
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const prevX = this.cursorX;
      const prevY = this.cursorY;

      // Movement
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) {
        this.cursorX = Phaser.Math.Wrap(this.cursorX - 1, 0, this.alphabet[0].length);
      } else if (['ArrowRight', 'd', 'D'].includes(event.key)) {
        this.cursorX = Phaser.Math.Wrap(this.cursorX + 1, 0, this.alphabet[0].length);
      } else if (['ArrowUp', 'w', 'W'].includes(event.key)) {
        this.cursorY = Phaser.Math.Wrap(this.cursorY - 1, 0, this.alphabet.length);
      } else if (['ArrowDown', 's', 'S'].includes(event.key)) {
        this.cursorY = Phaser.Math.Wrap(this.cursorY + 1, 0, this.alphabet.length);
      }
      // Actions
      else if ([' ', 'Enter'].includes(event.key)) {
        const selected = this.alphabet[this.cursorY][this.cursorX];
        if (selected === 'BACK') {
          this.scene.start('PetMenu');
        } else if (selected === 'SAVE') {
          this.submit();
        } else if (selected === 'DEL') {
          this.deleteCharacter();
        } else {
          this.addCharacter(selected);
        }
      } else if (event.key === 'Backspace') {
        this.deleteCharacter();
      }

      // Only update if position changed
      if (prevX !== this.cursorX || prevY !== this.cursorY) {
        this.updateCursor();
        const currentChar = this.alphabet[this.cursorY][this.cursorX];
        this.cursor.setVisible(!['BACK', 'SAVE', 'DEL'].includes(currentChar));
      }
    });

    this.updateCursor();
  }

  private updateCursor() {
    const gridStartX = 150;
    const gridStartY = 300;
    const cellSize = 45;
    const padding = 40;

    this.cursor.x = gridStartX + (this.cursorX * cellSize) + (this.cursorX >= 6 ? padding : 0) +
      (this.cursorX >= 11 ? 5 : 0) + cellSize/2;
    this.cursor.y = gridStartY + (this.cursorY * cellSize) + cellSize/2;

    // Update highlights
    this.charTexts.forEach((row, y) => {
      row.forEach((text, x) => {
        text.setColor(x === this.cursorX && y === this.cursorY ? '#ffffff' : '#aaaaaa');
        // Highlight command buttons differently when selected
        if (x === this.cursorX && y === this.cursorY && ['BACK', 'DEL'].includes(this.alphabet[y][x])) {
          text.setBackgroundColor('red');
        }
        else if (x === this.cursorX && y === this.cursorY && ['SAVE'].includes(this.alphabet[y][x])) {
          text.setBackgroundColor('green');
        }
        else if (['BACK', 'SAVE', 'DEL'].includes(this.alphabet[y][x])) {
          text.setBackgroundColor('purple');
        }
      });
    });
  }

  private addCharacter(char: string) {
    if (this.inputText.length < 12 && !['BACK', 'SAVE', 'DEL'].includes(char)) {
      this.inputText += char;
      this.nameDisplay.setText(this.inputText.padEnd(12, '_'));
    }
  }

  private deleteCharacter() {
    if (this.inputText.length > 0) {
      this.inputText = this.inputText.slice(0, -1);
      this.nameDisplay.setText(this.inputText.padEnd(12, '_'));
    }
  }


  private async submit() {
    if (this.inputText.trim()) {
      try {
        const loadingText = this.add.text(250, 250, 'Creating...', {
          font: '20px Arial',
          color: '#ffffff'
        }).setOrigin(0.5);

        const success = await this.eventBus.createCritter(this.inputText.trim());
        loadingText.destroy();

        if (success) {
          // Proper cleanup before transition
          this.cleanupScene();
          this.scene.start('PetMenu');
        } else {
          this.showError('Failed to create critter');
        }
      } catch (error) {
        this.showError('Error creating critter');
      }
    }
  }

  private showError(message: string) {
    this.add.text(250, 250, message, {
      font: '20px Arial',
      color: '#ff0000'
    }).setOrigin(0.5);
  }

  private cleanupScene() {
    // Clear all interactive elements
    this.charTexts.forEach(row => row.forEach(text => {
      text.removeAllListeners();
      text.destroy();
    }));
    this.charTexts = [];

    // Clear other elements
    this.nameDisplay?.destroy();
    this.cursor?.destroy();
    this.input.keyboard?.removeAllListeners();
    this.inputText = '';
  }

    private handleCharacterSelection(char: string) {
    if (char === 'BACK') {
      this.scene.start('PetMenu');
    } else if (char === 'SAVE') {
      this.submit();
    } else if (char === 'DEL') {
      this.deleteCharacter();
    } else {
      this.addCharacter(char);
    }
  }

  shutdown() {
    this.input.keyboard?.removeAllListeners();
    this.inputText = '';
  }
}
