import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  currentUser: any;

  constructor() { }

  ngOnInit(): void {
  }
}
