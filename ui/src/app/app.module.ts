import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MomentModule } from 'angular2-moment';
import { Ng2CompleterModule } from "ng2-completer";

import { httpInterceptorProviders } from '../http-interceptors/';
import { AuthService } from '../services/auth';
import { ViewMetaService } from '../services/view-meta';
import { CommentService } from '../services/comments';
import { IngredientService } from '../services/ingredients';
import { RecipeService } from '../services/recipes';
import { UserService } from '../services/users';

import { AppComponent } from './app.component';
import { RecipeEditComponent } from '../views/edit';
import { CommentEditComponent } from '../views/comment-edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeDetailViewComponent } from '../views/detail/detail-view';
import { RecipeListComponent } from '../views/recipes';
import { RandomRecipeComponent } from '../views/random';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { LoginViewComponent } from '../views/login';
import { SettingsViewComponent } from '../views/settings';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        RandomRecipeComponent,
        CommentEditComponent,
        RecipeEditComponent,
        RecipeDetailComponent,
        RecipeDetailViewComponent,
        RecipeListComponent,
        HomeViewComponent,
        UserCabinetComponent,
        LoginViewComponent,
        SettingsViewComponent
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
        ViewMetaService,
        CommentService,
        IngredientService,
        RecipeService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
