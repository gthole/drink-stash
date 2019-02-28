import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AlertService } from '../../services/alerts';
import { ViewMetaService } from '../../services/view-meta';
import { Comment, CommentService } from '../../services/comments';
import { Favorite, FavoriteService } from '../../services/favorites';
import { faHeart, faGlassMartiniAlt, faWineBottle, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';

interface Activity {
    user_hash: string;
    user_id: number;
    name: string;
    type: string;
    when: Date;
    recipe: RecipeStub;
    text?: string;
}

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

    activityFeed: Activity[];
    allActivities: Activity[];

    // Icons
    faHeart = faHeart;
    faGlassMartiniAlt = faGlassMartiniAlt;
    faWineBottle = faWineBottle;
    faPlus = faPlus;
    faRandom = faRandom;

    ngOnInit() {
        this.fetchActivityFeed();
    }

    fetchActivityFeed() {
        const meta = this.viewMetaService.getMeta('home');
        if (meta && meta.activities && Date.now() < meta.expire) {
            this.allActivities = meta.activities;
            this.setFeed();
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
                this.processActivities(
                    recipeResp.results,
                    commentResp.results,
                    favoriteResp.results
                )
            },
            (err) => {
                this.alertService.error('Something went wrong, please reload or try again.');
                this.activityFeed = [];
                this.allActivities = [];
            }
        );
    }

    loadMore() {
        const len = this.activityFeed.length;
        const nextPage = this.allActivities.slice(len, len + 10);
        this.activityFeed = this.activityFeed.concat(nextPage);
    }

    setFeed() {
        this.activityFeed = this.allActivities.slice(0, 10);
    }

    processActivities(recipes: RecipeStub[], comments: Comment[], favorites: Favorite[]): void {
        const recipeActivities: Activity[] = recipes
            .map((r) => {
                return {
                    user_hash: r.added_by.user_hash,
                    user_id: r.added_by.id,
                    name: `${r.added_by.first_name} ${r.added_by.last_name}`,
                    type: 'recipe',
                    when: r.created,
                    recipe: r
                };
            });

        const commentActivities: Activity[] = comments.map((c) => {
            return {
                user_hash: c.user.user_hash,
                user_id: c.user.id,
                name: `${c.user.first_name} ${c.user.last_name}`,
                type: 'comment',
                when: c.created,
                text: c.text,
                recipe: c.recipe
            };
        });

        const favoriteActivities: Activity[] = favorites.map((f) => {
            return {
                user_hash: f.user.user_hash,
                user_id: f.user.id,
                name: `${f.user.first_name} ${f.user.last_name}`,
                type: 'favorite',
                when: f.created,
                text: '',
                recipe: f.recipe
            };
        });

        this.allActivities = _.sortBy(recipeActivities.concat(commentActivities).concat(favoriteActivities), 'when')
            .reverse();

        // Cache the activity feed for an hour
        this.viewMetaService.setMeta('home', {
            expire: Date.now() + (60 * 60 * 1000),
            activities: this.allActivities
        });
        this.setFeed();
    }
}
