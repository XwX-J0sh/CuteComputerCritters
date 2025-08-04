import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {AuthService} from '../../services/auth.service';
import {Observable, Subscription} from 'rxjs';
import {User} from '../../shared/model/user';
import {CritterGetResponse} from '../../shared/model/CritterGetResponse';
import {CritterService} from '../../services/critter.service';

@Component({
  selector: 'app-profile',
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    NgForOf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  deceasedCritters: { name: string; lifespan: number }[] = [];
  protected currentUser: Observable<User | null>;

  constructor(
    protected authService: AuthService, private critterService: CritterService
  ) {
    this.currentUser = authService.currentUser$;
  }

  ngOnInit(): void {
    this.critterService.getDeceasedCritters().subscribe(critters => {
      // Sort by lifespan descending and store
      this.deceasedCritters = critters.sort((a, b) => b.lifespan - a.lifespan);
    });
  }

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  }

}

