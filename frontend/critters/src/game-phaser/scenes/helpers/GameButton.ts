import Phaser from 'phaser';

export type ButtonConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  onClick: () => void;
  debugHitbox?: boolean;
};

export class GameButton extends Phaser.GameObjects.Container {
  private bgImage: Phaser.GameObjects.Image;
  private pressedImage: Phaser.GameObjects.Image;
  labelText?: Phaser.GameObjects.Text;
  private isPointerDown: boolean = false;
  private hitArea: Phaser.Geom.Rectangle;
  private onClickCallback: () => void; // Store the callback

  constructor(config: ButtonConfig) {
    super(config.scene, config.x, config.y);

    const { width = 199, height = 72 } = config;
    this.onClickCallback = config.onClick; // Store the callback

    // Create hit area first
    this.hitArea = new Phaser.Geom.Rectangle(-width/2, -height/2, width, height);

    // Background image (normal state)
    this.bgImage = this.scene.add.image(0, 0, 'buttonBg')
      .setDisplaySize(width, height)
      .setOrigin(1);

    // Pressed state image
    this.pressedImage = this.scene.add.image(0, 0, 'buttonPressedBg')
      .setDisplaySize(width, height)
      .setOrigin(1)
      .setVisible(false);

    // Label text if provided
    if (config.label) {
      this.labelText = this.scene.add.text(0, 0, config.label, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(1.4, 2);
    }

    this.setSize(width, height);
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      cursor: 'pointer'
    });

    // Add all elements to container
    this.add([this.bgImage, this.pressedImage]);
    if (this.labelText) this.add(this.labelText);

    // Optimized input handling
    this.setSize(width, height)
      .setInteractive(this.hitArea, Phaser.Geom.Rectangle.Contains)
      .setScrollFactor(0)
      .setDepth(1000);

    // Input events
    this.on('pointerdown', this.handlePointerDown, this)
      .on('pointerup', this.handlePointerUp, this)
      .on('pointerout', this.handlePointerOut, this);
  }

  private handlePointerDown() {
    this.isPointerDown = true;
    this.bgImage.setVisible(false);
    this.pressedImage.setVisible(true);
    this.setScale(0.98);
  }

  private handlePointerUp() {
    if (!this.isPointerDown) return;

    this.isPointerDown = false;
    this.pressedImage.setVisible(false);
    this.bgImage.setVisible(true);
    this.setScale(1);

    // Execute callback with debounce protection
    if (this.scene) {
      this.scene.time.delayedCall(50, () => {
        if (this.active) this.onClickCallback();
      });
    }
  }

  private handlePointerOut() {
    if (this.isPointerDown) {
      this.isPointerDown = false;
      this.pressedImage.setVisible(false);
      this.bgImage.setVisible(true);
      this.setScale(1);
    }
  }

  override destroy(fromScene?: boolean) {
    this.off('pointerdown');
    this.off('pointerup');
    this.off('pointerout');
    super.destroy(fromScene);
  }

  public override setActive(active: boolean): this {
    super.setActive(active);
    this.setInteractive(active);
    return this;
  }

  // Makes the button reusable
  public reset(x: number, y: number, label?: string, onClick?: () => void): void {
    this.setPosition(x, y);
    if (this.labelText && label) {
      this.labelText.setText(label);
    }
    if (onClick) {
      this.onClickCallback = onClick;
    }
  }
}
