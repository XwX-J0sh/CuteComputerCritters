import { Component, OnInit } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-profile',
    imports: [
        AsyncPipe
    ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  currentUser: any;

  constructor(
    protected authService: AuthService,
  ) {
  }

  ngOnInit(): void {}
}
