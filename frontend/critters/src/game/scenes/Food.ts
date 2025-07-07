import { BaseGame } from './BaseGame';
import {Critter} from './helpers/constants';

interface FoodItem {
  name: string;
  spriteKey: string;
}

interface FoodPantryData {
  selectedCritter: Critter;
}

export class FoodPantry extends BaseGame {
  private foodItems: FoodItem[] = [];
  private selectedFoodIndex = 0;
  private foodContainers: Phaser.GameObjects.Container[] = [];
  private keyboardNav?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };
  private passedCritter?: Critter;

  constructor() {
    super({ key: 'FoodPantry' });
  }

  override init(data: FoodPantryData) {
    this.passedCritter = data.selectedCritter;
    console.log('Received critter:', this.passedCritter);
  }

  override preload() {
    this.load.spritesheet('Bread', '../assets/bread.PNG', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  override async create() {
    super.create();
    console.log('FoodPantry scene created');

    if (!this.passedCritter) {
      console.error('No critter passed to FoodPantry!');
      this.scene.start('Game'); // Fallback
      return;
    }

    // Initialize food items data
    this.foodItems = [
      { name: 'Cake', spriteKey: 'Cake' },
      { name: 'Bread', spriteKey: 'Bread' },
      { name: 'Candy', spriteKey: 'Candy' },
      { name: 'Salad', spriteKey: 'Salad' },
    ];

    this.createFoodSelectionUI();
    this.setupKeyboardNavigation();
    this.setupButtons();

    // Debug information
    console.log('Food containers created:', this.foodContainers.length);
    console.log('Selected critter:', this.selectedCritter);
  }

  private setupButtons() {
    if (!this.feedButton || !this.respondButton || !this.quitButton) {
      console.warn('Buttons not found!');
      return;
    }

    // Feed button
    this.feedButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.feedButton.setAlpha(0.8))
      .on('pointerout', () => this.feedButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Feed button pressed');
        this.handleFeed();
      });

    // Respond button
    this.respondButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.respondButton.setAlpha(0.8))
      .on('pointerout', () => this.respondButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Respond button pressed');
        this.handleRespond();
      });

    // Quit button
    this.quitButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.quitButton.setAlpha(0.8))
      .on('pointerout', () => this.quitButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Quit button pressed');
        this.handleQuit();
      });
  }

  private updateSelection() {
    this.foodContainers.forEach((container, index) => {
      this.highlightFood(container, index === this.selectedFoodIndex);
    });
  }

  private selectFood(food: FoodItem) {
    console.log(`Selected ${food.name} for critter`, this.passedCritter);
    try {
      this.eventBus.feedCritter(this.passedCritter!.critterId, food.name);
    } catch (error) {
      console.log('Failed to select food: ' ,error);
    }
    this.scene.start('Game', { selectedCritter: this.passedCritter });
  }

  protected handleQuit = async () => {
    this.scene.start('Game', { selectedCritter: this.passedCritter });
    return Promise.resolve();
  };

  protected handleRespond = async () => {
    try {
      this.eventBus.respondToCall(this.passedCritter!.critterId);
    }
    catch (error) {
      console.log('Failed to respond to call: ' ,error);
    }
    this.scene.start('Game', { selectedCritter: this.passedCritter });
    return Promise.resolve();
  };

  protected handleFeed = async () => {
    this.selectFood(this.foodItems[this.selectedFoodIndex]);
    return Promise.resolve();
  };

  override shutdown() {
    super.shutdown();
    if (this.keyboardNav) {
      Object.values(this.keyboardNav).forEach(key => key.removeAllListeners());
    }
  }

  private highlightFood(container: Phaser.GameObjects.Container, isSelected: boolean) {
    const [sprite, text] = container.list as [Phaser.GameObjects.Sprite, Phaser.GameObjects.Text];

    sprite.setTint(isSelected ? 0x44ff44 : 0xffffff);
    text.setStyle({
      color: isSelected ? '#ff9900' : '#ffffff',
      fontStyle: isSelected ? 'bold' : 'normal'
    });
  }

  private setupKeyboardNavigation() {
    if (!this.input?.keyboard) {
      console.warn('Keyboard input not available');
      return;
    }

    this.keyboardNav = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // Arrow key navigation
    this.keyboardNav.up.on('down', () => this.navigateFood(-1));
    this.keyboardNav.down.on('down', () => this.navigateFood(1));
    this.keyboardNav.left.on('down', () => this.navigateFood(-1));
    this.keyboardNav.right.on('down', () => this.navigateFood(1));

    // Selection
    this.keyboardNav.enter.on('down', () => this.handleFeed());
    this.keyboardNav.space.on('down', () => this.handleFeed());

    // WASD navigation
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', () => this.navigateFood(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', () => this.navigateFood(1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).on('down', () => this.navigateFood(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).on('down', () => this.navigateFood(1));

    // Escape for quit
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.handleQuit);
  }

  private navigateFood(direction: number) {
    if (this.foodItems.length === 0) return;

    this.selectedFoodIndex = Phaser.Math.Wrap(
      this.selectedFoodIndex + direction,
      0,
      this.foodItems.length
    );
    this.updateSelection();
    console.log(`Navigated to food index: ${this.selectedFoodIndex}`);
  }

  private createFoodSelectionUI() {
    const startX = this.cameras.main.width / 2 - 250;
    const startY = this.cameras.main.height / 2;
    const spacing = 180;

    this.foodItems.forEach((food, index) => {
      const container = this.add.container(0, 0);
      const xPos = startX + (index * spacing);

      // Food sprite
      const foodSprite = this.add.sprite(xPos, startY - 50, food.spriteKey)
        .setScale(1.5)
        .setInteractive({ useHandCursor: true });

      // Food label
      const foodLabel = this.add.text(xPos, startY + 50, food.name, {
        font: '24px Arial',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // Add to container (for grouping, but positioned absolutely)
      container.add([foodSprite, foodLabel]);
      container.setInteractive(
        new Phaser.Geom.Rectangle(
          xPos - foodSprite.width/2,
          startY - 50 - foodSprite.height/2,
          foodSprite.width,
          foodSprite.height + 70
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Mouse events
      container.on('pointerover', () => {
        this.selectedFoodIndex = index;
        this.updateSelection();
      });

      container.on('pointerdown', () => {
        this.selectFood(food);
      });

      this.foodContainers.push(container);

      // Initial highlight
      if (index === 0) {
        this.highlightFood(container, true);
      }
    });
  }

  protected override shouldCreateCritter(): boolean {
    return false;
  }
}
