import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AlertService } from '../../services/alerts';
import { CacheService } from '../../services/cache';
import { Comment, CommentService } from '../../services/comments';
import { faHeart, faGlassMartiniAlt, faWineBottle, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
    styleUrls: ['./style.css'],
})
export class HomeViewComponent implements OnInit {
    constructor(
        private router: Router,
        private alertService: AlertService,
        private recipeService: RecipeService,
        private commentService: CommentService,
        private cacheService: CacheService,
    ) {}

    // Icons
    faGlassMartiniAlt = faGlassMartiniAlt;
    faWineBottle = faWineBottle;
    faPlus = faPlus;
    faRandom = faRandom;

    search: string = '';

    activities: {
        recipes: ServiceResponse<RecipeStub>,
        comments: ServiceResponse<Comment>
    };

    ngOnInit() {
        const cached = this.cacheService.get('home');
        this.fetchActivityFeed(cached);
    }

    routeToSearch() {
        this.router.navigate(['recipes'], {queryParams: {search: this.search}});
    }

    fetchActivityFeed(cached) {
        const params = {
            per_page: 30,
            ordering: '-created'
        };

        Promise.all([
            this.recipeService.getPage(params, _.get(cached, 'recipes')),
            this.commentService.getPage(params, _.get(cached, 'comments')),
        ]).then(
            ([recipeResp, commentResp]) => {
                this.activities = {
                    recipes: recipeResp,
                    comments: commentResp,
                };
                this.cacheService.set('home', this.activities);
            },
            (err) => {
                this.alertService.error(`Something went wrong, please reload
                                         or try again.`);
            }
        );
    }
}
