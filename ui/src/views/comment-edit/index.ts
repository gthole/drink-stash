import _ from 'lodash';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Comment, CommentService } from '../../services/comments';
import { Router } from '@angular/router';

@Component({
    selector: 'comment-edit',
    templateUrl: './index.html'
})
export class CommentEditComponent {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commentService: CommentService,
    ) {}

    comment: Comment;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {id}) => {
            this.fetchId(params.id);
        });
    }

    fetchId(id: number) {
        this.commentService.getById(id).then((comment) => {
            this.comment = comment;
            this.loading = false;
        });
    }

    delete(): void {
        this.loading = true;
        this.commentService.remove(this.comment).then(
            () => this.router.navigateByUrl(`/recipes/${this.comment.recipe}`),
            (err) => {
                this.loading = false;
                this.error = 'Whoops - something went wrong';
                console.log(err);
            }
        );
    }

    save(): void {
        this.commentService.update(this.comment).then((saved) => {
            this.router.navigateByUrl(`/recipes/${this.comment.recipe}`);
        }, (err) => {
            this.loading = false;
            this.error = 'Whoops - something went wrong';
            console.log(err);
        });
    }
}
