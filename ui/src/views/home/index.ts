import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Recipe, RecipeService } from '../../services/recipes';
import { ViewMetaService } from '../../services/view-meta';
import { Comment, CommentService } from '../../services/comments';
import { faGlassMartiniAlt, faWineBottle, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';

interface Activity {
    user_hash: string;
    name: string;
    type: string;
    when: Date;
    recipe: Recipe;
}

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
})
export class HomeViewComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private recipeService: RecipeService,
        private commentService: CommentService,
        private viewMetaService: ViewMetaService,
    ) {}

    activityFeed: Activity[];

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
            this.activityFeed = meta.activities;
            return;
        }

        const auth = this.authService.getUserData();
        const commentParams = {
            'user!': auth.user_id,
            'ordering': '-id'
        };
        Promise.all([
            this.recipeService.getList(), // filter client-side
            this.commentService.getFiltered(commentParams)
        ]).then(([recipes, comments]) => {
            this.processActivities(auth, recipes, comments)
        });
    }

    processActivities(auth: any, recipes: Recipe[], comments: Comment[]): void {
        const recipeActivities: Activity[] = recipes
            .filter((r) => r.added_by.id !== auth.user_id)
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
                recipe: recipes.filter((r) => r.id === c.recipe)[0]
            };
        });

        this.activityFeed = _.sortBy(recipeActivities.concat(commentActivities), 'when')
            .reverse()
            .slice(0, 10);

        // Cache the activity feed for an hour
        this.viewMetaService.setMeta('home', {
            expire: Date.now() + (60 * 60 * 1000),
            activities: this.activityFeed
        });
    }
}
