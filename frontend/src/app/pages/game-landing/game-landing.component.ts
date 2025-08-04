import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-game-landing',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './game-landing.component.html',
  styleUrl: './game-landing.component.scss',
})
export class GameLandingComponent {}
