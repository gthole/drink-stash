import { Component, Input } from '@angular/core';
import { Recipe } from '../../../services/recipes';
import { units } from '../../../constants';


@Component({
    selector: 'recipe-detail-view',
    templateUrl: './index.html'
})
export class RecipeDetailViewComponent {
    constructor() {}

    @Input() recipe: Recipe;
    units = units;
}
