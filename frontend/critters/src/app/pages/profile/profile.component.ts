import { Component, OnInit } from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {AuthService} from '../../services/auth.service';
import {Observable} from 'rxjs';
import {User} from '../../shared/model/user';

@Component({
  selector: 'app-profile',
  imports: [
    AsyncPipe,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  protected currentUser: Observable<User | null>;

  constructor(
    protected authService: AuthService,
  ) {
    this.currentUser = authService.currentUser$;
  }

  ngOnInit(): void {}
}
