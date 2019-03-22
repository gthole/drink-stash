import _ from 'lodash';
import { Component, OnInit, Input } from '@angular/core';
import { RecipeStub } from '../../services/recipes';
import { Comment } from '../../services/comments';
import { AuthService } from '../../services/auth';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface Activity {
    id: number;
    user_hash: string;
    user_id: number;
    name: string;
    type: string;
    when: Date;
    recipe: RecipeStub;
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
        this.user_id = authService.getUserData().user_id;
    }

    // Stuff to show
    @Input() comments: Comment[] = [];
    @Input() recipes: RecipeStub[] = [];

    // Display options
    @Input() recipeTitle: boolean = false;
    @Input() includeImage: boolean = true;
    @Input() title: string;

    user_id: number;
    faHeart = faHeart;

    activityFeed: Activity[];
    allActivities: Activity[];

    ngOnChanges() {
        const recipeActivities: Activity[] = this.recipes
            .map((r) => {
                return {
                    id: r.id,
                    user_hash: r.added_by.user_hash,
                    user_id: r.added_by.id,
                    name: `${r.added_by.first_name} ${r.added_by.last_name}`,
                    type: 'recipe',
                    when: r.created,
                    recipe: r
                };
            });

        const commentActivities: Activity[] = this.comments.map((c) => {
            return {
                id: c.id,
                user_hash: c.user.user_hash,
                user_id: c.user.id,
                name: `${c.user.first_name} ${c.user.last_name}`,
                type: 'comment',
                when: c.created,
                text: c.text,
                recipe: c.recipe
            };
        });

        this.allActivities = _.reverse(_.sortBy(
            recipeActivities
                .concat(commentActivities),
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
