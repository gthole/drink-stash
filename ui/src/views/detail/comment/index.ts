import { Component, Input } from '@angular/core';
import { Comment } from '../../../services/comments';
import { User } from '../../../services/users';


@Component({
    selector: 'comment',
    templateUrl: './index.html'
})
export class CommentComponent {
    constructor() {}

    @Input() comment: Comment;
    @Input() user: User;
}
