import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AlertService } from '../../services/alerts';
import { CacheService } from '../../services/cache';
import { Comment, CommentService } from '../../services/comments';
import { Favorite, FavoriteService } from '../../services/favorites';
import { faHeart, faGlassMartiniAlt, faWineBottle, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
})
export class HomeViewComponent implements OnInit {
    constructor(
        private alertService: AlertService,
        private recipeService: RecipeService,
        private commentService: CommentService,
        private favoriteService: FavoriteService,
        private cacheService: CacheService,
    ) {}

    // Icons
    faGlassMartiniAlt = faGlassMartiniAlt;
    faWineBottle = faWineBottle;
    faPlus = faPlus;
    faRandom = faRandom;

    activities: {
        recipes: ServiceResponse<RecipeStub>,
        favorites: ServiceResponse<Favorite>
        comments: ServiceResponse<Comment>
    };

    ngOnInit() {
        const cached = this.cacheService.get('home');
        this.fetchActivityFeed(cached);
    }

    fetchActivityFeed(cached) {
        const params = {
            per_page: 30,
            ordering: '-created'
        };

        Promise.all([
            this.recipeService.getPage(params, _.get(cached, 'recipes')),
            this.commentService.getPage(params, _.get(cached, 'comments')),
            this.favoriteService.getPage(params, _.get(cached, 'favorites'))
        ]).then(
            ([recipeResp, commentResp, favoriteResp]) => {
                this.activities = {
                    recipes: recipeResp,
                    comments: commentResp,
                    favorites: favoriteResp
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
