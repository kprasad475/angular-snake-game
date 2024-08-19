import { Component, ElementRef, HostListener, OnInit, ViewChild, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrl: './snake.component.css'
})
export class SnakeComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private readonly canvasSize = 400;
  private readonly blockSize = 20;
  private readonly initialSnake = [{ x: 200, y: 200 }];
  private snake: { x: number, y: number }[] = [];
  private food: { x: number, y: number } = this.randomFoodPosition();
  private direction = { x: 0, y: 0 }; // Start with no movement
  private pendingDirection = { x: 0, y: 0 }; // Store direction until game starts
  private gameInterval: any;
  public score = 0;
  public isSSR = false;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isSSR = !isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isSSR) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.resetGame();
    }
  }

  private resetGame() {
    this.snake = [...this.initialSnake];
    this.direction = { x: 0, y: 0 }; // Start with no movement
    this.pendingDirection = { x: this.blockSize, y: 0 }; // Default direction (right)
    this.food = this.randomFoodPosition();
    this.score = 0;

    clearInterval(this.gameInterval);

    // Run the game loop outside of Angular's zone
    this.ngZone.runOutsideAngular(() => {
      this.gameInterval = setInterval(() => {
        this.updateGame();
        this.drawGame();
      }, 200); // Control the speed by adjusting the interval
    });
  }

  private updateGame() {
    if (this.direction.x === 0 && this.direction.y === 0) {
      // No movement until user input
      return;
    }

    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

    if (this.checkCollision(head)) {
      this.resetGame();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.randomFoodPosition(); // Move food when the snake eats it
    } else {
      this.snake.pop(); // Keep the snake length the same unless it eats food
    }
  }

  private checkCollision(head: { x: number, y: number }): boolean {
    return (
      head.x < 0 || head.x >= this.canvasSize ||
      head.y < 0 || head.y >= this.canvasSize ||
      this.snake.some(segment => segment.x === head.x && segment.y === head.y)
    );
  }

  private randomFoodPosition(): { x: number, y: number } {
    const maxBlocks = this.canvasSize / this.blockSize;
    return {
      x: Math.floor(Math.random() * maxBlocks) * this.blockSize,
      y: Math.floor(Math.random() * maxBlocks) * this.blockSize,
    };
  }

  @HostListener('window:keydown', ['$event'])
  private handleKeydown(event: KeyboardEvent) {
    if (!this.isSSR) {
      switch (event.key) {
        case 'ArrowUp':
          if (this.direction.y === 0) this.pendingDirection = { x: 0, y: -this.blockSize };
          break;
        case 'ArrowDown':
          if (this.direction.y === 0) this.pendingDirection = { x: 0, y: this.blockSize };
          break;
        case 'ArrowLeft':
          if (this.direction.x === 0) this.pendingDirection = { x: -this.blockSize, y: 0 };
          break;
        case 'ArrowRight':
          if (this.direction.x === 0) this.pendingDirection = { x: this.blockSize, y: 0 };
          break;
      }

      // Update direction for next move
      this.direction = this.pendingDirection;
    }
  }

  private drawGame() {
    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    this.ctx.fillStyle = 'green';
    this.snake.forEach(segment => this.ctx.fillRect(segment.x, segment.y, this.blockSize, this.blockSize));
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.food.x, this.food.y, this.blockSize, this.blockSize);
  }
}
