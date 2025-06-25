import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '',
    component: MainLayoutComponent,
    children: [
      {path: '', component: HomeComponent},
      { path: 'about-us', component: AboutUsComponent },
      { path: 'accessibility', component: AccessibilityComponent },
      { path: 'home', component: HomeComponent },
      { path: 'how-to-play', component: HowToPlayComponent },
      { path: 'login', component: LoginComponent },
      { path: 'overview-critters', component: OverviewCrittersComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'support', component: SupportComponent },
      { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
      { path: 'updates', component: UpdatesComponent },
    ] },


  //wildcard route (page-not-found) for unknown paths
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule {}
