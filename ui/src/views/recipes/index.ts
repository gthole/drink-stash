import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Recipe, RecipeStub, RecipeService } from '../../services/recipes';
import { AlertService } from '../../services/alerts';
import { User, UserService } from '../../services/users';

interface RecipeViewMeta {
    page: number;
    filters: string[];
    recipeSlug?: string;
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
        private userService: UserService,
        private route: ActivatedRoute,
    ) {}

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
        'source = classic',
        'list = favorites',
        'NOT juice',
        'lemon > 1/2 oz',
        'orgeat <= .25',
        'tags = served up',
        'cabinet = true',
    ];

    /*
     * We get state changes through the query parameters, which means users
     * can reload or come back to the same page again later.
     */
    ngOnInit() {
        this.route.queryParams.subscribe((qp) => {
            // If we've already loaded and the only difference is the recipe,
            // then don't load the recipe data
            if (this.meta && qp.show && this.meta.recipeSlug !== qp.show) {
                this.meta.recipeSlug = qp.show;
                return;
            }

            // Set the meta object so that the view can update
            let search;
            if (qp.search && Array.isArray(qp.search)) {
                search = qp.search;
            } else if (qp.search) {
                search = [qp.search];
            }
            this.meta = {
                page: parseInt(qp.page) || 1,
                filters: search || [],
                recipeSlug: qp.show || null
            };
            this.loadPage();
        });
    }

    loadPage() {
        this.loading = true;

        // Pull the query parameters to send to the API out of the meta object
        const query: {[k: string]: string | number | string[]} = {};
        if (this.meta.filters.length) query.search = this.meta.filters;
        if (this.meta.page !== 1) query.page = this.meta.page;
        query.per_page = this.per_page;

        this.recipeService.getPage(query).then(
            (resp: {count: number, results: RecipeStub[]}) => {
                this.count = resp.count;
                this.recipes = resp.results;
                this.example = this.exampleQueries[
                    Math.floor(Math.random() * this.exampleQueries.length)
                ];
                this.loading = false;
            },
            (err) => {
                this.alertService.error('Something went wrong, please reload or try again.');
                this.recipes = [];
                this.loading = false;
            }
        );

        if (this.side_display && !this.recipe && this.meta.recipeSlug) {
            this.routeRecipe(null, this.meta.recipeSlug);
        }
    }

    /*
     * Page resize event
     */

    onResize() {
        this.side_display = window.innerWidth >= 1060;
        this.per_page = window.innerWidth >= 1060 ? 200 : 100;
    }

    /*
     * User changes that go to the query parameters
     */

    updateRoute(overrides) {
        const qp = _.cloneDeep(this.route.snapshot.queryParams);
        Object.keys(overrides).forEach((k) => qp[k] = overrides[k]);
        if (qp.page == '1') Reflect.deleteProperty(qp, 'page');
        this.router.navigate(['recipes'], {replaceUrl: true, queryParams: qp});
    }

    paginate(inc: number) {
        // Scroll to the top of the recipe sidebar
        if (this.side_display) {
            const el = document.getElementById('recipe-sidebar');
            el.scrollTop = 0;
        } else {
            window.scrollTo(0, 0);
        }
        this.updateRoute({page: this.meta.page + inc});
    }

    addSearchFilter() {
        if (!this.filter) return;
        let term = this.filter.toLowerCase().trim();
        if (this.filter.slice(0, 4) === 'NOT ') {
            term = 'NOT ' + term.slice(4);
        }
        this.filter = '';

        const filters = this.meta.filters.concat([term]);
        this.updateRoute({page: 1, search: filters});
    }

    removeSearchFilter(f: string) {
        const filters = this.meta.filters.filter((g) => g != f);
        this.updateRoute({page: 1, search: filters});
    }

    // When changes are made in the detail view (comment, tags, etc.)
    // Receive the altered recipe here and update its attributes without
    // re-fetching the whole list from the API
    refresh(recipe: Recipe) {
        const stub = this.recipes.filter((r) => r.id === recipe.id)[0];
        if (!stub) return;
        stub.tags = recipe.tags;
        stub.comment_count = recipe.comment_count;
    }

    // Received on swipe left event
    clearRecipe(recipe_id: number, save: boolean) {
        this.recipes = this.recipes.filter((r) => r.id !== recipe_id);
    }

    // Either route to the recipe details view or display on the side
    routeRecipe(ev: any, slug: string) {
        if (ev) ev.preventDefault();
        if (this.side_display) {
            this.recipeLoading = true;
            this.recipeService.getById(slug).then((recipe) => {
                this.recipeLoading = false;
                this.recipe = recipe;
                if (ev) this.updateRoute({show: slug});
            });
        } else {
            this.router.navigateByUrl(`/recipes/${slug}`);
        }
    }
}
