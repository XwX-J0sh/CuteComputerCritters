import { Scene, GameObjects } from 'phaser';

interface StatElement {
  text: GameObjects.Text;
  value: number | boolean;
  type: 'health' | 'hunger' | 'happiness' | 'evolution';
}

export class CritterStatsPanel {
  private scene: Scene;
  private panel: GameObjects.Graphics;
  private title: GameObjects.Text;
  private statElements: StatElement[];
  private critter: any;
  private x: number;
  private y: number;

  constructor(scene: Scene, critter: any, x: number, y: number) {
    this.scene = scene;
    this.critter = critter;
    this.x = x;
    this.y = y;
    this.statElements = [];

    // Create panel
    this.panel = this.scene.add.graphics();
    this.drawPanel();

    // Create title (only once)
    this.title = this.scene.add.text(
      this.x + 20,
      this.y + 20,
      critter.critterName,
      { fontSize: '24px', color: '#450ba2', fontFamily: 'Arial' }
    );

    // Create stat elements
    this.createStatElements();
  }

  private drawPanel() {
    this.panel.clear();
    this.panel.fillStyle(0xfa72a8, 0.7);
    this.panel.fillRoundedRect(this.x, this.y, 200, 300, 10);
    this.panel.lineStyle(2, 0xffffff, 1);
    this.panel.strokeRoundedRect(this.x, this.y, 200, 300, 10);
  }

  private createStatElements() {
    // Position offsets for each stat
    const offsets = {
      evolution: 60,
      health: 90,
      hunger: 120,
      happiness: 150,
      energy: 180
    };

    // Create each stat element
    this.statElements = [
      this.createStatElement('evolution', `Level: ${this.critter.evolution}`, offsets.evolution),
      this.createStatElement('health', `Health: ${this.critter.isHealthy ? 'Healthy' : 'Sick'}`, offsets.health, this.critter.isHealthy),
      this.createStatElement('hunger', `Hunger: ${Math.floor(this.critter.hunger)}`, offsets.hunger, this.critter.hunger),
      this.createStatElement('happiness', `Happiness: ${Math.floor(this.critter.happiness)}`, offsets.happiness, this.critter.happiness),
    ];
  }

  private createStatElement(type: StatElement['type'], text: string, yOffset: number, value?: any): StatElement {
    const color = this.getStatColor(value);
    const textObj = this.scene.add.text(
      this.x + 20,
      this.y + yOffset,
      text,
      { fontSize: '18px', color, fontFamily: 'Arial' }
    );

    return {
      text: textObj,
      value: value !== undefined ? value : this.critter[type],
      type
    };
  }

  private getStatColor(value: any): string {
    if (typeof value === 'boolean') return value ? '#00ff00' : '#ff0000';
    if (value > 70) return '#00ff00';
    if (value > 30) return '#ffff00';
    return '#ff0000';
  }

  public updateStats(critter: any) {
    this.critter = critter;

    // Only update changed stats
    this.statElements.forEach(element => {
      const currentValue = element.type === 'health'
        ? this.critter.isHealthy
        : this.critter[element.type];

      if (currentValue !== element.value) {
        element.value = currentValue;
        const displayValue = element.type === 'health'
          ? this.critter.isHealthy ? 'Healthy' : 'Sick'
          : Math.floor(currentValue);

        element.text.setText(`${this.getStatLabel(element.type)}: ${displayValue}`);
        element.text.setColor(this.getStatColor(currentValue));
      }
    });
  }

  private getStatLabel(type: string): string {
    return {
      evolution: 'Level',
      health: 'Health',
      hunger: 'Hunger',
      happiness: 'Happiness',
      energy: 'Energy'
    }[type] || '';
  }

  destroy() {
    this.panel.destroy();
    this.title.destroy();
    this.statElements.forEach(element => element.text.destroy());
  }
}
