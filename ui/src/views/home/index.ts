import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { ViewMetaService } from '../../services/view-meta';
import { Comment, CommentService } from '../../services/comments';
import { faGlassMartiniAlt, faWineBottle, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';

interface Activity {
    user_hash: string;
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
        private recipeService: RecipeService,
        private commentService: CommentService,
        private viewMetaService: ViewMetaService,
    ) {}

    activityFeed: Activity[];
    allActivities: Activity[];

    // Icons
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

        const commentParams = {
            per_page: 30,
            ordering: '-id'
        };
        Promise.all([
            this.recipeService.getPage({per_page: 30, ordering: '-created'}),
            this.commentService.getPage(commentParams)
        ]).then(([recipeResp, commentResp]) => {
            this.processActivities(recipeResp.results, commentResp.results)
        });
    }

    loadMore() {
        const len = this.activityFeed.length;
        const nextPage = this.allActivities.slice(len, len + 10);
        this.activityFeed = this.activityFeed.concat(nextPage);
    }

    setFeed() {
        this.activityFeed = this.allActivities.slice(0, 10);
    }

    processActivities(recipes: RecipeStub[], comments: Comment[]): void {
        const recipeActivities: Activity[] = recipes
            .map((r) => {
                return {
                    user_hash: r.added_by.user_hash,
                    name: `${r.added_by.first_name} ${r.added_by.last_name}`,
                    type: 'recipe',
                    when: r.created,
                    recipe: r
                };
            });

        const commentActivities: Activity[] = comments.map((c) => {
            return {
                user_hash: c.user.user_hash,
                name: `${c.user.first_name} ${c.user.last_name}`,
                type: 'comment',
                when: c.created,
                text: c.text,
                recipe: c.recipe
            };
        });

        this.allActivities = _.sortBy(recipeActivities.concat(commentActivities), 'when')
            .reverse();

        // Cache the activity feed for an hour
        this.viewMetaService.setMeta('home', {
            expire: Date.now() + (60 * 60 * 1000),
            activities: this.allActivities
        });
        this.setFeed();
    }
}
