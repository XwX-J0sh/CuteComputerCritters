import { Scene, GameObjects } from 'phaser';

export class CritterStatsPanel {
    private scene: Scene;
    private panel: GameObjects.Graphics;
    private textElements: GameObjects.Text[];
    private critter: any;
    private health: string;

    constructor(scene: Scene, critter: any, x: number, y: number) {
        this.scene = scene;
        this.critter = critter;
        this.textElements = [];
        this.health = "healthy";

        // Create panel background
        this.panel = this.scene.add.graphics();
        this.drawPanel(x, y, 200, 300);

        // Add stats text
        this.createStatsText(x + 20, y + 20);
    }

    private drawPanel(x: number, y: number, width: number, height: number) {
        this.panel.fillStyle(0xfa72a8, 0.7);
        this.panel.fillRoundedRect(x, y, width, height, 10);
        this.panel.lineStyle(2, 0xffffff, 1);
        this.panel.strokeRoundedRect(x, y, width, height, 10);
    }

    private createStatsText(x: number, y: number) {

        // Title
        this.addText(x, y, `${this.critter.critterName}`, { fontSize: '24px', color: '#450ba2' });

        // Stats
        this.addText(x, y + 80, `Level: ${this.critter.evolution}`);
        if (!this.critter.isHealthy){
            this.health = 'sick';
        }
        this.addText(x, y + 120, `Health: ${this.health}`);
        this.addText(x, y + 140, `Hunger: ${this.critter.hunger}`);
        this.addText(x, y + 160, `Happiness: ${this.critter.happiness}`);
    }

    private addText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle = {}) {
        const defaultStyle = {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        };

        const textObj = this.scene.add.text(
            x,
            y,
            text,
            { ...defaultStyle, ...style }
        );

        this.textElements.push(textObj);
        return textObj;
    }

    update(critter: any) {
        this.critter = critter;
        // Update all text elements with new stats
        this.textElements.forEach(text => text.destroy());
        this.textElements = [];
        this.createStatsText(this.panel.x + 20, this.panel.y + 20);
    }

    destroy() {
        this.panel.destroy();
        this.textElements.forEach(text => text.destroy());
    }
}
