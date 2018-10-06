import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MomentModule } from 'angular2-moment';
import { Ng2CompleterModule } from "ng2-completer";

import { httpInterceptorProviders } from '../http-interceptors/';
import { AuthService } from '../services/auth';
import { IngredientService } from '../services/ingredients';
import { RecipeService } from '../services/recipes';
import { UserService } from '../services/users';

import { AppComponent } from './app.component';
import { RecipeEditComponent } from '../views/edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeListComponent } from '../views/recipes';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { LoginViewComponent } from '../views/login';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        RecipeEditComponent,
        RecipeDetailComponent,
        RecipeListComponent,
        HomeViewComponent,
        UserCabinetComponent,
        LoginViewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MomentModule,
        Ng2CompleterModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        httpInterceptorProviders,
        AuthService,
        IngredientService,
        RecipeService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
