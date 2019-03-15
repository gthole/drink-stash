import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MomentModule } from 'angular2-moment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { httpInterceptorProviders } from '../http-interceptors/';
import { AuthService } from '../services/auth';
import { AlertService } from '../services/alerts';
import { CacheService } from '../services/cache';
import { CommentService } from '../services/comments';
import { FavoriteService } from '../services/favorites';
import { IngredientService } from '../services/ingredients';
import { RecipeService } from '../services/recipes';
import { TagService } from '../services/tags';
import { UserService } from '../services/users';

import { FractionPipe } from '../pipes/fractions';

import { AppComponent } from './app.component';
import { AutoCompleteComponent } from '../components/autocomplete';
import { TagEditComponent } from '../components/tag-edit';
import { ActivityFeedViewComponent } from '../components/activity-feed';
import { RecipeDetailViewComponent } from '../components/detail-view';
import { RecipeEditComponent } from '../views/edit';
import { CommentEditComponent } from '../views/comment-edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeListComponent } from '../views/recipes';
import { RandomRecipeComponent } from '../views/random';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { LoginViewComponent } from '../views/login';
import { UserDetailsViewComponent } from '../views/user-details';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        AutoCompleteComponent,
        ActivityFeedViewComponent,
        RandomRecipeComponent,
        TagEditComponent,
        CommentEditComponent,
        RecipeEditComponent,
        RecipeDetailComponent,
        RecipeDetailViewComponent,
        RecipeListComponent,
        HomeViewComponent,
        UserCabinetComponent,
        LoginViewComponent,
        UserDetailsViewComponent,
        FractionPipe,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
        FormsModule,
        MomentModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        httpInterceptorProviders,
        AuthService,
        AlertService,
        CacheService,
        CommentService,
        FavoriteService,
        IngredientService,
        RecipeService,
        TagService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
