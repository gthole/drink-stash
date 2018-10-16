import { Component, Input } from '@angular/core';
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
        private commentService: CommentService,
        private userService: UserService,
    ) {}

    @Input() recipe: Recipe;
    units = units;

    user: User;
    comments: Comment[];
    canComment: boolean = false;
    commentText: string = '';

    ngOnInit() {
        Promise.all([
            this.commentService.getFiltered({recipe: `${this.recipe.id}`}),
            this.userService.getSelf()
        ]).then(([comments, user]) => {
            this.user = user;
            this.canComment = !comments.filter((c) => c.user.id === user.id).length;
            this.comments = comments
        });
    }

    addComment(): void {
        const payload = new Comment({
            text: this.commentText,
            recipe: this.recipe.id
        });
        this.commentService.create(payload).then((res: Comment) => {
            this.comments.push(res);
            this.canComment = false;
        });
    }
}
