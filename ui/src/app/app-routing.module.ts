import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecipeEditComponent } from '../views/recipe-edit';
import { CommentEditComponent } from '../views/comment-edit';
import { RecipeDetailComponent } from '../views/recipe-detail';
import { RecipeListComponent } from '../views/recipes';
import { ListEditComponent } from '../views/list-edit';
import { ListDetailsComponent } from '../views/list-details';
import { ListViewComponent } from '../views/lists';
import { RandomRecipeComponent } from '../views/recipe-random';
import { HomeViewComponent } from '../views/home';
import { UserEditViewComponent } from '../views/user-edit';
import { UserCabinetComponent } from '../views/user-cabinet';
import { UserDetailsViewComponent } from '../views/user-details';
import { LoginViewComponent } from '../views/login';

const routes: Routes = [
    {path: '', component: HomeViewComponent},
    {path: 'recipes/:slug/edit', component: RecipeEditComponent},
    {path: 'recipes/:slug', component: RecipeDetailComponent},
    {path: 'recipes', component: RecipeListComponent},
    {path: 'comments/:id', component: CommentEditComponent},
    {path: 'random', component: RandomRecipeComponent},
    {path: 'new', component: RecipeEditComponent},
    {path: 'login', component: LoginViewComponent},
    {path: 'users/:username', component: UserDetailsViewComponent},
    {path: 'users/:username/edit', component: UserEditViewComponent},
    {path: 'users/:username/cabinet', component: UserCabinetComponent},
    {path: 'users/:username/lists', component: ListViewComponent},
    {path: 'users/:username/lists/new', component: ListEditComponent},
    {path: 'users/:username/lists/:id', component: ListDetailsComponent},
    {path: 'users/:username/lists/:id/edit', component: ListEditComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

