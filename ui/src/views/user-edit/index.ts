import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CacheService } from '../../services/cache';
import { User, UserService } from '../../services/users';
import { HttpClient } from "@angular/common/http";


@Component({
    selector: 'user-edit',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class UserEditViewComponent implements OnInit {
    constructor(
        private http: HttpClient,
        private cache: CacheService,
        private authService: AuthService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    loading: boolean = true;
    selectedFile: File;
    imageSrc: any;

    ngOnInit() {
        this.route.params.subscribe((params: {username}) => {
            const activeUser = this.authService.getUserData();
            if (activeUser.username !== params.username) {
                this.router.navigateByUrl('/');
                return;
            }

            this.userService.getById(params.username).then((user) => {
                this.loading = false;
                this.user = user
            });
        });
    }

    async save() {
        this.loading = true;
        if (this.selectedFile) {
            const formData: FormData = new FormData();
            formData.append('image', this.selectedFile);
            await this.http.put(
                `/api/v1/users/${this.user.username}/profile_image/`,
                formData
            ).toPromise()
            // Clear the session cache so all the comments etc get the new image
            this.cache.clear();

        }
        this.userService.update(this.user).then(() => {
            this.router.navigateByUrl(`/users/${this.user.username}`);
        });
    }

    onFileChanged(event) {
        this.selectedFile = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrc = reader.result;
        reader.readAsDataURL(this.selectedFile);
    }
}
