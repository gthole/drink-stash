import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AlertService } from '../../services/alerts';
import { ViewMetaService } from '../../services/view-meta';
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
        private viewMetaService: ViewMetaService,
    ) {}

    // Icons
    faGlassMartiniAlt = faGlassMartiniAlt;
    faWineBottle = faWineBottle;
    faPlus = faPlus;
    faRandom = faRandom;

    activities: {recipes: RecipeStub[], favorites: Favorite[], comments: Comment[]};

    ngOnInit() {
        this.fetchActivityFeed();
    }

    fetchActivityFeed() {
        const meta = this.viewMetaService.getMeta('home');
        if (meta && meta.activities && Date.now() < meta.expire) {
            this.activities = meta.activities;
            return;
        }

        const params = {
            per_page: 30,
            ordering: '-created'
        };
        Promise.all([
            this.recipeService.getPage(params),
            this.commentService.getPage(params),
            this.favoriteService.getPage(params)
        ]).then(
            ([recipeResp, commentResp, favoriteResp]) => {
                this.activities = {
                    recipes: recipeResp.results,
                    comments: commentResp.results,
                    favorites: favoriteResp.results
                };
                // Cache the activity feed for an hour
                this.viewMetaService.setMeta('home', {
                    expire: Date.now() + (60 * 60 * 1000),
                    activities: this.activities
                });
            },
            (err) => {
                this.alertService.error('Something went wrong, please reload or try again.');
                this.activities = {
                    recipes: [],
                    favorites: [],
                    comments: []
                };
            }
        );
    }
}
