import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecipeEditComponent } from '../views/edit';
import { CommentEditComponent } from '../views/comment-edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeListComponent } from '../views/recipes';
import { RandomRecipeComponent } from '../views/random';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { UserDetailsViewComponent } from '../views/user-details';
import { LoginViewComponent } from '../views/login';

const routes: Routes = [
    {path: '', component: HomeViewComponent},
    {path: 'recipes/:id/edit', component: RecipeEditComponent},
    {path: 'recipes/:id', component: RecipeDetailComponent},
    {path: 'recipes', component: RecipeListComponent},
    {path: 'comments/:id', component: CommentEditComponent},
    {path: 'random', component: RandomRecipeComponent},
    {path: 'cabinet', component: UserCabinetComponent},
    {path: 'new', component: RecipeEditComponent},
    {path: 'users/:id', component: UserDetailsViewComponent},
    {path: 'login', component: LoginViewComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

