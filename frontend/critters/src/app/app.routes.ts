import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { AccessibilityComponent} from './accessibility/accessibility.component';
import {HomeComponent} from './home/home.component';
import {HowToPlayComponent} from './how-to-play/how-to-play.component';
import {LoginComponent} from './login/login.component';
import {OverviewCrittersComponent} from './overview-critters/overview-critters.component';
import {PrivacyPolicyComponent} from './privacy-policy/privacy-policy.component';
import {RegisterComponent} from './register/register.component';
import {ProfileComponent} from './profile/profile.component';
import {SupportComponent} from './support/support.component';
import {TermsAndConditionsComponent} from './terms-and-conditions/terms-and-conditions.component';
import {UpdatesComponent} from './updates/updates.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'about-us', component: AboutUsComponent},
  {path: 'accessibility', component: AccessibilityComponent},
  {path: 'home', component: HomeComponent},
  {path: 'how-to-play', component: HowToPlayComponent},
  {path: 'login', component: LoginComponent},
  {path: 'overview-critters', component: OverviewCrittersComponent},
  {path: 'privacy-policy', component: PrivacyPolicyComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'support', component: SupportComponent},
  {path: 'terms-and-conditions', component: TermsAndConditionsComponent},
  {path: 'updates', component: UpdatesComponent}
];
