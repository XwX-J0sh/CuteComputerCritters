import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { MainLayoutComponent} from './layout/main-layout/main-layout.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { AccessibilityComponent } from './pages/accessibility/accessibility.component';
import { HomeComponent } from './pages/home/home.component';
import { HowToPlayComponent } from './pages/how-to-play/how-to-play.component';
import { LoginComponent } from './pages/login/login.component';
import { OverviewCrittersComponent } from './pages/overview-critters/overview-critters.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SupportComponent } from './pages/support/support.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { UpdatesComponent } from './pages/updates/updates.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { GameLandingComponent} from './pages/game-landing/game-landing.component';
import { CritterStatsComponent} from './critter-stats/critter-stats.component';
import {GameComponent} from './game/game.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {AuthGuard} from './auth.guard';

export const routes: Routes = [
  { path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent},
      { path: 'about-us', component: AboutUsComponent },
      { path: 'accessibility', component: AccessibilityComponent },
      { path: 'game-landing', component: GameLandingComponent },
      { path: 'home', component: HomeComponent },
      { path: 'how-to-play', component: HowToPlayComponent },
      { path: 'login', component: LoginComponent },
      { path: 'overview-critters', component: OverviewCrittersComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'profile', component: ProfileComponent , canActivate: [AuthGuard] },
      { path: 'support', component: SupportComponent },
      { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
      { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
      { path: 'updates', component: UpdatesComponent },
      { path: 'critter-stats', component: CritterStatsComponent },
      { path: 'game', component: GameComponent}
    ] },


  //wildcard route (page-not-found) for unknown paths
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 48],
  })],
  exports: [RouterModule],
})

export class AppRoutingModule {}
