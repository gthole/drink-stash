import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alerts';
import { ViewMetaService } from '../../services/view-meta';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { faHeart, faWineBottle, faComment } from '@fortawesome/free-solid-svg-icons';


interface RecipeViewMeta {
    page: number;
    filters: string[];
    filterByCabinet: boolean;
    filterByComments: boolean;
    filterByFavorites: boolean;
}

@Component({
    selector: 'recipe-list',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class RecipeListComponent implements OnInit {
    constructor(
        private alertService: AlertService,
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private userService: UserService,
        private viewMetaService: ViewMetaService,
    ) {}

    faHeart = faHeart;
    faWineBottle = faWineBottle;
    faComment = faComment;

    recipes: RecipeStub[];
    count: number;
    per_page: number = window.innerWidth > 500 ? 2000 : 100;
    loading: boolean = true;

    filter: string;
    meta: RecipeViewMeta;

    ngOnInit() {
        // Restore previous position and filters from meta service
        const meta = this.viewMetaService.getMeta('recipes');
        if (meta) {
            this.meta = meta;
        } else {
            this.meta = {
                page: 1,
                filters: [],
                filterByCabinet: false,
                filterByComments: false,
                filterByFavorites: false
            };
        }
        this.loadPage();
    }

    loadPage() {
        this.loading = true;
        const meta = this.viewMetaService.setMeta('recipes', this.meta);
        const query = {
            per_page: this.per_page,
            page: this.meta.page,
            search: this.meta.filters.join(','),
            cabinet: '' + this.meta.filterByCabinet,
            comments: '' + this.meta.filterByComments,
            favorites: '' + this.meta.filterByFavorites
        };

        this.recipeService.getPage(query).then(
            (resp: {count: number, results: RecipeStub[]}) => {
                this.count = resp.count;
                this.recipes = resp.results;
                this.loading = false;
            },
            (err) => {
                this.alertService.error('Something went wrong, please reload or try again.');
                this.recipes = [];
                this.loading = false;
            }
        );
    }

    paginate(inc: number) {
        window.scroll(0,0);
        this.meta.page += inc;
        this.loadPage();
    }

    toggleCabinet() {
        this.meta.page = 1;
        this.meta.filterByCabinet = !this.meta.filterByCabinet;
        this.loadPage();
    }

    toggleComments() {
        this.meta.page = 1;
        this.meta.filterByComments = !this.meta.filterByComments;
        this.loadPage();
    }

    toggleFavorites() {
        this.meta.page = 1;
        this.meta.filterByFavorites = !this.meta.filterByFavorites;
        this.loadPage();
    }

    addFilter() {
        if (!this.filter) return;
        this.meta.page = 1;
        this.meta.filters.push(this.filter.toLowerCase());
        this.filter = '';
        this.loadPage();
    }

    removeFilter(f: string) {
        this.meta.page = 1;
        this.meta.filters = this.meta.filters.filter((g) => g != f);
        this.loadPage();
    }
}
