import _ from 'lodash';
import { Component, OnInit, Input } from '@angular/core';
import { RecipeStub } from '../../services/recipes';
import { Comment } from '../../services/comments';
import { User, UserService } from '../../services/users';
import { Favorite } from '../../services/favorites';
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
export class ActivityFeedViewComponent implements OnInit {
    constructor(
        private userService: UserService,
    ) {}

    // Stuff to show
    @Input() comments: Comment[] = [];
    @Input() favorites: Favorite[] = [];
    @Input() recipes: RecipeStub[] = [];

    // Display options
    @Input() recipeTitle: boolean = false;
    @Input() includeImage: boolean = true;
    @Input() title: string;

    user: User;
    faHeart = faHeart;

    activityFeed: Activity[];
    allActivities: Activity[];

    ngOnInit() {
        this.userService.getSelf().then((user) => {
            this.user = user;
            this.loadActivities();
        });
    }

    ngOnChanges() {
        if(this.user) this.loadActivities();
    }

    loadActivities() {
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

        const favoriteActivities: Activity[] = this.favorites.map((f) => {
            return {
                id: f.id,
                user_hash: f.user.user_hash,
                user_id: f.user.id,
                name: `${f.user.first_name} ${f.user.last_name}`,
                type: 'favorite',
                when: f.created,
                text: '',
                recipe: f.recipe
            };
        });

        this.allActivities = _.sortBy(
            recipeActivities
                .concat(commentActivities)
                .concat(favoriteActivities),
            'when'
        ).reverse();

        this.setFeed();
    }

    loadMore() {
        const len = this.activityFeed.length;
        const nextPage = this.allActivities.slice(len, len + 10);
        this.activityFeed = this.activityFeed.concat(nextPage);
    }

    setFeed() {
        this.activityFeed = this.allActivities.slice(0, 10);
    }
}
