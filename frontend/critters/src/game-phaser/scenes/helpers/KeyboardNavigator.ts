// KeyboardNavigator.ts
import { Scene } from 'phaser';

type NavigationOptions = {
    maxIndex: number;
    onSelect: (index: number) => void;
    onChange?: (index: number) => void;
    wrapAround?: boolean;
    initialIndex?: number;
};

export class KeyboardNavigator {
    private scene: Scene;
    public currentIndex: number;
    private maxIndex: number;
    private onSelect: (index: number) => void;
    private onChange?: (index: number) => void;
    private wrapAround: boolean;
    private keyListener?: Phaser.Events.EventEmitter;

    constructor(scene: Scene, options: NavigationOptions) {
        this.scene = scene;
        this.currentIndex = options.initialIndex || 0;
        this.maxIndex = options.maxIndex;
        this.onSelect = options.onSelect;
        this.onChange = options.onChange;
        this.wrapAround = options.wrapAround ?? true;
        this.setupKeyboardListeners();
    }

    private setupKeyboardListeners() {
        this.keyListener = this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.moveSelection(-1);
                    break;

                case 'ArrowDown':
                case 's':
                case 'S':
                    this.moveSelection(1);
                    break;

                case 'Enter':
                case ' ':
                    this.onSelect(this.currentIndex);
                    break;
            }
        });
    }

    private moveSelection(change: number) {
        let newIndex = this.currentIndex + change;

        if (this.wrapAround) {
            newIndex = Phaser.Math.Wrap(newIndex, 0, this.maxIndex);
        } else {
            newIndex = Phaser.Math.Clamp(newIndex, 0, this.maxIndex - 1);
        }

        this.currentIndex = newIndex;
        this.onChange?.(newIndex);
    }

    public setIndex(index: number) {
        this.currentIndex = Phaser.Math.Clamp(index, 0, this.maxIndex - 1);
    }

    public destroy() {
        this.keyListener?.removeAllListeners();
    }
}
