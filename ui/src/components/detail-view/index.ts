import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertService } from '../../services/alerts';
import { Recipe, RecipeService } from '../../services/recipes';
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
        private recipeService: RecipeService,
        private commentService: CommentService,
        private favoriteService: FavoriteService,
        private userService: UserService,
    ) {}

    @Input() recipe: Recipe;
    @Output() output: EventEmitter<Recipe> = new EventEmitter<Recipe>();

    showQuantities: any[] = [];
    units = units;
    faHeart = faHeart;

    editingTags: boolean = false;
    updatedTags: string[];
    canEdit: boolean;
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
        this.editingTags = false;
        this.commentText = '';

        this.userService.getSelf().then((user) => {
            this.user = user;
            this.canEdit = user.is_staff || this.recipe.added_by.id === user.id;
            Promise.all([
                this.getComments(),
                this.getFavorites(),
            ]).then(([commentResp, favoriteResp]) => {
                this.canComment = !commentResp.results.filter((c) => {
                    return c.user.id === this.user.id
                }).length;
                this.comments = commentResp.results;

                this.userFavorite = favoriteResp.results.filter((f) => {
                    return f.user.id === this.user.id;
                })[0];
                this.favorites = favoriteResp.results;
            });
        });
    }

    /*
     * Lazy content loaders
     */

    getComments(): Promise<{results: Comment[]}> {
        if (this.recipe.comment_count === 0) return Promise.resolve({results: []});
        return this.commentService.getPage({recipe: `${this.recipe.id}`});
    }

    getFavorites(): Promise<{results: Favorite[]}> {
        if (this.recipe.favorite_count === 0) return Promise.resolve({results: []});
        return this.favoriteService.getPage({recipe: `${this.recipe.id}`});
    }

    /*
     * Open and close the tags editor
     */

    updateTags(tags: string[]) {
        this.updatedTags = tags;
    }

    cancelTags() {
        this.editingTags = false;
        this.updatedTags = null;
    }

    /*
     * Save data to the API and refresh the recipe in any outer view listeners
     */

    saveTags() {
        this.editingTags = false;
        this.recipe.tags = this.updatedTags;
        this.recipeService.update(this.recipe).then(() => {
            this.output.emit(this.recipe);
        });
    }

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
        promise
            .then(() => {
                this.recipe.favorite = Boolean(this.userFavorite);
                this.output.emit(this.recipe);
            })
            .catch(() => {
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
            .then((res: Comment) => {
                this.comments = this.comments.concat([res]);
                this.recipe.comment_count = this.comments.length;
                this.output.emit(this.recipe);
            })
            .catch(() => {
                this.alertService.error('There was an error posting your comment. ' +
                                        'Please try again later.');
            });
    }
}
