import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MomentModule } from 'angular2-moment';

import { httpInterceptorProviders } from '../http-interceptors/';
import { AuthService } from '../services/auth';
import { RecipeService } from '../services/recipes';
import { UserService } from '../services/users';

import { AppComponent } from './app.component';
import { RecipeEditComponent } from '../views/edit';
import { RecipeDetailComponent } from '../views/detail';
import { HomeViewComponent } from '../views/home';
import { LoginViewComponent } from '../views/login';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        RecipeEditComponent,
        RecipeDetailComponent,
        HomeViewComponent,
        LoginViewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MomentModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        httpInterceptorProviders,
        AuthService,
        RecipeService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
