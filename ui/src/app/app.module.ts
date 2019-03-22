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
import { ListService, ListRecipeService } from '../services/lists';
import { IngredientService } from '../services/ingredients';
import { RecipeService } from '../services/recipes';
import { TagService } from '../services/tags';
import { UserService } from '../services/users';

import { FractionPipe } from '../pipes/fractions';

import { AppComponent } from './app.component';
import { AutoCompleteComponent } from '../components/autocomplete';
import { TagEditComponent } from '../components/tag-edit';
import { ActivityFeedViewComponent } from '../components/activity-feed';
import { RecipeCardComponent } from '../components/recipe-card';
import { RecipeDetailViewComponent } from '../components/detail-view';
import { RecipeEditComponent } from '../views/edit';
import { ListDetailsComponent } from '../views/list-details';
import { ListEditComponent } from '../views/list-edit';
import { CommentEditComponent } from '../views/comment-edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeListComponent } from '../views/recipes';
import { RandomRecipeComponent } from '../views/random';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { LoginViewComponent } from '../views/login';
import { UserDetailsViewComponent } from '../views/user-details';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig  {
    buildHammer(element: HTMLElement) {
        return new Hammer(element, {touchAction: 'pan-y'});
    }
}

@NgModule({
    declarations: [
        AppComponent,
        AutoCompleteComponent,
        ActivityFeedViewComponent,
        RandomRecipeComponent,
        TagEditComponent,
        CommentEditComponent,
        ListDetailsComponent,
        ListEditComponent,
        RecipeEditComponent,
        RecipeDetailComponent,
        RecipeDetailViewComponent,
        RecipeCardComponent,
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
        ListService,
        ListRecipeService,
        IngredientService,
        RecipeService,
        TagService,
        UserService,
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: MyHammerConfig
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
