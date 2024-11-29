import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';  
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { UploadComponent } from './upload/upload.component';
import { RegisterComponent } from './register/register.component';
import { FolderComponent } from './folder/folder.component';
import { DeleteComponent } from './delete/delete.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect to home page
  { path: 'home', component: HomeComponent }, // Home component for main page
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'folder', component: FolderComponent, canActivate: [AuthGuard] },
  { path: 'delete', component: DeleteComponent }, // Add this route
  // { path: '', redirectTo: '/login', pathMatch: 'full' },  // Redirect to login by default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
