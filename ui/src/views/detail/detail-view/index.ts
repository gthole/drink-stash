import { Component, Input } from '@angular/core';
import { AlertService } from '../../../services/alerts';
import { Recipe } from '../../../services/recipes';
import { Comment, CommentService } from '../../../services/comments';
import { units } from '../../../constants';
import { User, UserService } from '../../../services/users';


@Component({
    selector: 'recipe-detail-view',
    templateUrl: './index.html'
})
export class RecipeDetailViewComponent {
    constructor(
        private alertService: AlertService,
        private commentService: CommentService,
        private userService: UserService,
    ) {}

    @Input() recipe: Recipe;

    showQuantities: any[] = [];
    units = units;

    user: User;
    comments: Comment[];
    canComment: boolean = false;
    commentText: string = '';

    ngOnChanges() {
        this.showQuantities = this.recipe.quantities.filter(q => !q.hidden);
        this.comments = null;
        this.canComment = false;
        this.commentText = '';
        Promise.all([
            this.commentService.getPage({recipe: `${this.recipe.id}`}),
            this.userService.getSelf()
        ]).then(([commentResp, user]) => {
            this.user = user;
            this.canComment = !commentResp.results.filter((c) => c.user.id === user.id).length;
            this.comments = commentResp.results;
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
                                        'Please try again later.')
            });
    }
}
