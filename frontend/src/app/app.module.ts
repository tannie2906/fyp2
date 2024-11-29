import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'; // Make sure this is correct
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';  // Correct path
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload.component';
import { FolderComponent } from './folder/folder.component';
import { RouterModule } from '@angular/router';
import { FileListComponent } from './file-list/file-list.component';
import { FileService } from './services/file.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { DeleteComponent } from './delete/delete.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    SettingsComponent,
    RegisterComponent,
    HomeComponent,
    UploadComponent,
    FolderComponent,
    FileListComponent,
    DeleteComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,  // Ensure this is imported
    FormsModule,       // Import FormsModule for ngModel binding
    HttpClientModule,
  ],
  providers: [
    FileService,
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
