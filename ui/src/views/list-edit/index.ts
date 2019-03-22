import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { List, ListService } from '../../services/lists';

@Component({
    selector: 'list-edit',
    templateUrl: './index.html'
})
export class ListEditComponent implements OnInit {
    constructor(
        private listService: ListService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    list: List;
    loading: boolean = true;

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            if (params.id) {
                this.listService.getById(params.id).then(
                    (list) => {
                        this.loading = false;
                        this.list = list
                    },
                    (err) => console.log(err)
                );
            } else {
                this.list = new List({name: '', description: ''});
                this.loading = false;
            }
        });
    }

    save() {
        let promise;
        if (this.list.id) {
            promise = this.listService.update(this.list);
        } else {
            promise = this.listService.create(this.list);
        }

        promise.then((saved) => {
            this.router.navigateByUrl(`/lists/${saved.id}`);
        });
    }
}
