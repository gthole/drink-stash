import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Recipe, RecipeStub, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alerts';
// import { ViewMetaService } from '../../services/view-meta';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { faHeart, faWineBottle, faComment } from '@fortawesome/free-solid-svg-icons';


interface RecipeViewMeta {
    page: number;
    filters: string[];
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
    ];

    ngOnInit() {
        const qp = this.route.snapshot.queryParamMap;
        this.meta = {
            page: parseInt(qp.get('page')) || 1,
            filters: qp.get('search') ? qp.get('search').split(',') : [],
            filterByCabinet: qp.get('cabinet') === 'true',
            filterByComments: qp.get('comments') === 'true',
            filterByFavorites: qp.get('favorites') === 'true',
            recipeId: parseInt(qp.get('display')) || null
        };
        this.loadPage();
    }

    toQueryParams(): {[k: string]: string} {
        const query: {[k: string]: string} = {};
        if (this.meta.filters.length) query.search = this.meta.filters.join(',');
        if (this.meta.page !== 1) query.page = '' + this.meta.page;
        if (this.meta.filterByComments) query.comments = 'true';
        if (this.meta.filterByFavorites) query.favorites = 'true';
        if (this.meta.filterByCabinet) query.cabinet = 'true';
        if (this.meta.recipeId) query.display = '' + this.meta.recipeId;
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

    updateRoute() {
        const query = this.toQueryParams();
        this.router.navigate(['recipes'], {replaceUrl: true, queryParams: query});
    }

    addFilter() {
        if (!this.filter) return;
        this.meta.page = 1;
        let term = this.filter.toLowerCase();
        if (this.filter.slice(0, 4) === 'NOT ') {
            term = 'NOT ' + term.slice(4);
        }
        this.meta.filters.push(term);
        this.filter = '';
        this.loadPage();
    }

    removeFilter(f: string) {
        this.meta.page = 1;
        this.meta.filters = this.meta.filters.filter((g) => g != f);
        this.loadPage();
    }

    routeRecipe(ev: any, id: number) {
        if (ev) ev.preventDefault();
        if (this.side_display) {
            this.recipeLoading = true;
            this.recipeService.getById(id).then((recipe) => {
                this.recipeLoading = false;
                this.recipe = recipe;
                this.meta.recipeId = id;
                this.updateRoute();
                // this.viewMetaService.setMeta('recipes', this.meta);
                //
            });
        } else {
            this.router.navigateByUrl(`/recipes/${id}`);
        }
    }
}
