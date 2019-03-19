import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Recipe, RecipeStub, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alerts';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { faHeart, faWineBottle, faComment } from '@fortawesome/free-solid-svg-icons';

interface RecipeViewMeta {
    page: number;
    filters: string[];
    tags: string[];
    filterByCabinet: boolean;
    filterByComments: boolean;
    filterByFavorites: boolean;
    recipeId?: number;
}

@Component({
    selector: 'recipe-list',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class RecipeListComponent implements OnInit {
    constructor(
        private router: Router,
        private alertService: AlertService,
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private userService: UserService,
        private route: ActivatedRoute,
    ) {}

    faHeart = faHeart;
    faWineBottle = faWineBottle;
    faComment = faComment;

    recipes: RecipeStub[];
    recipe: Recipe;
    count: number;
    side_display: boolean = window.innerWidth >= 1060;
    per_page: number = window.innerWidth >= 1060 ? 200 : 100;
    loading: boolean = true;
    recipeLoading: boolean = false;
    blockClick: boolean = false;

    filter: string;
    meta: RecipeViewMeta;

    example: string = '';
    exampleQueries: string[] = [
        'cynar',
        'description=tiki',
        'last word',
        'yellow chartreuse',
        'favorites >= 2',
        'comments = 0',
        'source = classic cocktail',
        'NOT juice',
        'lemon > 1/2 oz',
        'orgeat <= .25',
        'tags = sour, bitter',
    ];

    ngOnInit() {
        this.route.queryParams.subscribe((qp) => {
            this.meta = {
                page: parseInt(qp.page) || 1,
                filters: qp.search ? qp.search.split(',') : [],
                tags: qp.tags ? qp.tags.split(',') : [],
                filterByCabinet: qp.cabinet === 'true',
                filterByComments: qp.comments === 'true',
                filterByFavorites: qp.favorites === 'true',
                // recipeId: parseInt(qp.show) || null
            };
            this.loadPage();
        });
    }

    toQueryParams(): {[k: string]: string} {
        const query: {[k: string]: string} = {};
        if (this.meta.filters.length) query.search = this.meta.filters.join(',');
        if (this.meta.tags.length) query.tags = this.meta.tags.join(',');

        if (this.meta.page !== 1) query.page = '' + this.meta.page;
        if (this.meta.filterByComments) query.comments = 'true';
        if (this.meta.filterByFavorites) query.favorites = 'true';
        if (this.meta.filterByCabinet) query.cabinet = 'true';
        // if (this.meta.recipeId) query.show = '' + this.meta.recipeId;
        return query;
    }

    onResize() {
        this.side_display = window.innerWidth >= 1060;
        this.per_page = window.innerWidth >= 1060 ? 200 : 100;
    }

    loadPage() {
        this.example = this.exampleQueries[
            Math.floor(Math.random() * this.exampleQueries.length)
        ];

        this.loading = true;
        this.updateRoute();
        const query = this.toQueryParams();
        query.per_page = '' + this.per_page;

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

        if (this.side_display && !this.recipe && this.meta.recipeId) {
            this.routeRecipe(null, this.meta.recipeId);
        }
    }

    paginate(inc: number) {
        // Scroll to the top of the recipe sidebar
        const el = document.getElementById('recipe-sidebar');
        el.scrollTop = 0;
        this.meta.page += inc;
        this.updateRoute();
    }

    toggleCabinet() {
        this.meta.page = 1;
        this.meta.filterByCabinet = !this.meta.filterByCabinet;
        this.updateRoute();
    }

    toggleComments() {
        this.meta.page = 1;
        this.meta.filterByComments = !this.meta.filterByComments;
        this.updateRoute();
    }

    toggleFavorites() {
        this.meta.page = 1;
        this.meta.filterByFavorites = !this.meta.filterByFavorites;
        this.updateRoute();
    }

    updateRoute() {
        const query = this.toQueryParams();
        this.router.navigate(['recipes'], {replaceUrl: true, queryParams: query});
    }

    addSearchFilter() {
        if (!this.filter) return;
        this.meta.page = 1;
        let term = this.filter.toLowerCase().trim();
        if (term.match(/^tags? ?=/)) {
            let tags = term.split('=')[1].split(',');
            this.meta.tags = this.meta.tags.concat(tags.map((t) => t.trim()));
        } else {
            if (this.filter.slice(0, 4) === 'NOT ') {
                term = 'NOT ' + term.slice(4);
            }
            this.meta.filters.push(term);
        }
        this.filter = '';
        this.updateRoute();
    }

    removeSearchFilter(f: string) {
        this.meta.page = 1;
        this.meta.filters = this.meta.filters.filter((g) => g != f);
        this.updateRoute();
    }

    removeTagFilter(t: string) {
        this.meta.page = 1;
        this.meta.tags = this.meta.tags.filter((s) => s != t);
        this.updateRoute();
    }

    // When changes are made in the detail view (favorite, comment, tags, etc.)
    // Receive the altered recipe here and update its attributes without
    // re-fetching the whole list from the API
    refresh(recipe: Recipe) {
        const stub = this.recipes.filter((r) => r.id === recipe.id)[0];
        if (!stub) return;
        stub.favorite = recipe.favorite;
        stub.tags = recipe.tags;
        stub.comment_count = recipe.comment_count;
    }

    clearRecipe(recipe_id: number, save: boolean) {
        this.recipes = this.recipes.filter((r) => r.id !== recipe_id);
    }

    routeRecipe(ev: any, id: number) {
        if (ev) ev.preventDefault();
        if (this.side_display) {
            this.recipeLoading = true;
            this.recipeService.getById(id).then((recipe) => {
                this.recipeLoading = false;
                this.recipe = recipe;
                this.meta.recipeId = id;
                // this.updateRoute();
            });
        } else {
            this.router.navigateByUrl(`/recipes/${id}`);
        }
    }
}
