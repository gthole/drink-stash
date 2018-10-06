import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecipeEditComponent } from '../views/edit';
import { RecipeDetailComponent } from '../views/detail';
import { RecipeListComponent } from '../views/recipes';
import { HomeViewComponent } from '../views/home';
import { UserCabinetComponent } from '../views/cabinet';
import { LoginViewComponent } from '../views/login';

const routes: Routes = [
    {path: '', component: HomeViewComponent},
    {path: 'recipes/:id/edit', component: RecipeEditComponent},
    {path: 'recipes/new', component: RecipeEditComponent},
    {path: 'recipes/:id', component: RecipeDetailComponent},
    {path: 'recipes', component: RecipeListComponent},
    {path: 'cabinet', component: UserCabinetComponent},
    {path: 'login', component: LoginViewComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

