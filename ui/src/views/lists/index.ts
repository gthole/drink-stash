import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { List, ListService } from '../../services/lists';
import { User, UserService } from '../../services/users';

@Component({
    selector: 'lists',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class ListViewComponent implements OnInit {
    constructor(
        private router: Router,
        private authService: AuthService,
        private listService: ListService,
        private userService: UserService,
        private route: ActivatedRoute,
    ) {}

    user: User;
    activeUser: any;
    lists: List[] = [];
    list: List;
    loading: boolean = true;
    listLoading: boolean = false;
    side_display: boolean = window.innerWidth >= 1060;

    ngOnInit() {
        this.route.params.subscribe((params: {username: string}) => {
            this.activeUser = this.authService.getUserData();
            const uname = params.username || this.activeUser.username;

            this.userService.getById(uname).then((user) => {
                this.user = user;
                this.listService.getPage({user: user.id}).then((listResp) => {
                    this.lists = listResp.results;
                    this.loading = false;
                    if (this.side_display && this.route.snapshot.queryParams.show) {
                        const id = this.route.snapshot.queryParams.show;
                        this.listService.getById(id)
                            .then(list => this.routeList(null, list));
                    }
                });
            });
        });
    }

    routeList(ev: any, list: List) {
        if (ev) ev.preventDefault();
        if (this.side_display) {
            this.list = list;
            this.router.navigate(
                ['users', list.user.username, 'lists'],
                {replaceUrl: true, queryParams: {show: list.id}}
            );
        } else {
            this.router.navigateByUrl(`/users/${list.user.username}/lists/${list.id}`);
        }
    }
}
