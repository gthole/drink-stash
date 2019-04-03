import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeStub, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alerts';
import { CacheService } from '../../services/cache';
import { Comment, CommentService } from '../../services/comments';
import { faGlassMartiniAlt, faPlus, faRandom } from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
    styleUrls: ['./style.css'],
})
export class HomeViewComponent implements OnInit {
    constructor(
        private router: Router,
        private authService: AuthService,
        private recipeService: RecipeService,
        private commentService: CommentService,
        private cacheService: CacheService,
    ) {}

    // Icons
    faGlassMartiniAlt = faGlassMartiniAlt;
    faPlus = faPlus;
    faBookmark = faBookmark;
    faRandom = faRandom;

    search: string = '';
    activeUser: {user_id: number, username: string};

    activities: {
        recipes: ServiceResponse<RecipeStub>,
        comments: ServiceResponse<Comment>
    };

    ngOnInit() {
        this.activeUser = this.authService.getUserData();
        this.fetchActivityFeed();
    }

    routeToSearch() {
        this.router.navigate(['recipes'], {queryParams: {search: this.search}});
    }

    fetchActivityFeed() {
        const params = {
            per_page: 30,
            ordering: '-created'
        };

        Promise.all([
            this.recipeService.getPage(params),
            this.commentService.getPage(params)
        ]).then(
            ([recipeResp, commentResp]) => {
                this.activities = {
                    recipes: recipeResp,
                    comments: commentResp,
                };
            }
        );
    }
}
