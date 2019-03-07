import { Component, Input } from '@angular/core';
import { AlertService } from '../../services/alerts';
import { Recipe } from '../../services/recipes';
import { Comment, CommentService } from '../../services/comments';
import { Favorite, FavoriteService } from '../../services/favorites';
import { units } from '../../constants';
import { User, UserService } from '../../services/users';
import { faHeart } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'recipe-detail-view',
    templateUrl: './index.html'
})
export class RecipeDetailViewComponent {
    constructor(
        private alertService: AlertService,
        private commentService: CommentService,
        private favoriteService: FavoriteService,
        private userService: UserService,
    ) {}

    @Input() recipe: Recipe;

    showQuantities: any[] = [];
    units = units;
    faHeart = faHeart;

    user: User;
    comments: Comment[];
    favorites: Favorite[];
    userFavorite: Favorite;
    canComment: boolean = false;
    commentText: string = '';

    ngOnChanges() {
        this.showQuantities = this.recipe.quantities.filter(q => !q.hidden);
        this.comments = null;
        this.canComment = false;
        this.commentText = '';
        Promise.all([
            this.getComments(),
            this.getFavorites(),
            this.userService.getSelf()
        ]).then(([commentResp, favoriteResp, user]) => {
            this.user = user;
            this.canComment = !commentResp.results.filter((c) => c.user.id === user.id).length;
            this.comments = commentResp.results;

            this.userFavorite = favoriteResp.results.filter((f) => f.user.id === user.id)[0];
            this.favorites = favoriteResp.results;
        });
    }

    /*
     * Lazy content loaders
     */

    getComments(): Promise<Comment[]> {
        if (this.recipe.comment_count === 0) return Promise.resolve([]);
        return this.commentService.getPage({recipe: `${this.recipe.id}`}),
    }

    getFavorites(): Promise<Favorite[]> {
        if (this.recipe.favorite_count === 0) return Promise.resolve([]);
        return this.favoriteService.getPage({recipe: `${this.recipe.id}`}),
    }

    /*
     * User interactions
     */

    toggleFavorite(): void {
        let promise;
        if (this.userFavorite) {
            promise = this.favoriteService.remove(this.userFavorite)
                .then(() => this.userFavorite = null);
        } else {
            const payload = new Favorite({recipe: {id: this.recipe.id}});
            promise = this.favoriteService.create(payload)
                .then((favorite) => this.userFavorite = favorite);
        }
        promise.catch(() => {
            this.alertService.error('There was an error posting your favorite. ' +
                                    'Please try again later.');
        });
    }

    addComment(): void {
        this.canComment = false;
        const payload = new Comment({
            text: this.commentText,
            recipe: {id: this.recipe.id}
        });
        this.commentService.create(payload)
            .then((res: Comment) => this.comments.push(res))
            .catch(() => {
                this.alertService.error('There was an error posting your comment. ' +
                                        'Please try again later.');
            });
    }
}
