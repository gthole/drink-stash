import _ from 'lodash';
import { Component, OnInit, Input } from '@angular/core';
import { RecipeStub } from '../../services/recipes';
import { Comment } from '../../services/comments';
import { ListRecipe } from '../../services/lists';
import { AuthService } from '../../services/auth';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface Activity {
    id: number;
    user_hash: string;
    username: string;
    name: string;
    type: string;
    when: Date;
    recipe: RecipeStub;
    slug?: string;
    text?: string;
}

@Component({
    selector: 'activity-feed',
    templateUrl: './index.html'
})
export class ActivityFeedViewComponent {
    constructor(
        authService: AuthService,
    ) {
        this.username = authService.getUserData().username;
    }

    // Stuff to show
    @Input() comments: Comment[] = [];
    @Input() listRecipes: ListRecipe[] = [];
    @Input() recipes: RecipeStub[] = [];

    // Display options
    @Input() recipeTitle: boolean = false;
    @Input() includeImage: boolean = true;
    @Input() title: string;

    username: string;
    faHeart = faHeart;

    activityFeed: Activity[];
    allActivities: Activity[];

    ngOnChanges() {
        const recipeActivities: Activity[] = this.recipes
            .map((r) => {
                return {
                    id: r.id,
                    slug: r.slug,
                    user_hash: r.added_by.user_hash,
                    username: r.added_by.username,
                    name: `${r.added_by.first_name} ${r.added_by.last_name}`,
                    type: 'recipe',
                    when: new Date(r.created),
                    recipe: r
                };
            });

        const commentActivities: Activity[] = this.comments.map((c) => {
            return {
                id: c.id,
                user_hash: c.user.user_hash,
                username: c.user.username,
                name: `${c.user.first_name} ${c.user.last_name}`,
                type: 'comment',
                when: new Date(c.created),
                text: c.text,
                recipe: c.recipe
            };
        });

        const lrActivities: Activity[] = this.listRecipes.map((lr) => {
            return {
                id: lr.id,
                user_hash: lr.user.user_hash,
                username: lr.user.username,
                name: `${lr.user.first_name} ${lr.user.last_name}`,
                type: 'listrecipe',
                when: new Date(lr.created),
                text: lr.list.name,
                recipe: lr.recipe
            };
        });

        this.allActivities = _.reverse(_.sortBy(
            recipeActivities
                .concat(commentActivities)
                .concat(lrActivities),
            'when'
        ));
        this.activityFeed = this.allActivities.slice(0, 10);
    }

    loadMore() {
        const len = this.activityFeed.length;
        const nextPage = this.allActivities.slice(len, len + 10);
        this.activityFeed = this.activityFeed.concat(nextPage);
    }
}
