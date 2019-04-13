import _ from 'lodash';
import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth';
import { AlertService } from '../services/alerts';
import { CacheService } from '../services/cache';
import { RecipeService } from '../services/recipes';
import { IngredientService } from '../services/ingredients';
import { UomService } from '../services/uom';
import { TagService } from '../services/tags';
import { Router } from '@angular/router';
import { faLongArrowAltLeft, faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Drink Stash';
    loggedIn: boolean = false;
    username: string;
    alerts: Alert[] = [];
    showMenu: boolean = false;
    showNav: boolean = false;

    faLongArrowAltLeft = faLongArrowAltLeft;
    faBars = faBars;

    constructor(
        private authService: AuthService,
        private alertService: AlertService,
        private cacheService: CacheService,
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private uomService: UomService,
        private tagService: TagService,
        private location: Location,
        private router: Router,
    ) {
        this.setLoggedInState();
        this.alertService.alertTopic.subscribe(alrt => this.alerts.push(alrt));
        this.authService.authUpdates.subscribe(() => this.setLoggedInState());

        if (this.loggedIn) {
            // Pre-populate this data and let the cache help out
            this.recipeService.getPage({per_page: 100});
            this.ingredientService.getPage();
            this.uomService.getPage();
            this.tagService.getPage();
        }
        this.router.events.subscribe(() => this.handleScroll());
    }

    addAlert(alrt: {header: string, message: string}): void {
        // Prevent duplicate errors that already displayed
        if (this.alerts.filter((a) => a.header === alrt.header).length === 0) {
            this.alerts.push(alrt);
        }
    }

    setLoggedInState() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigateByUrl('/login');
        } else {
            const data = this.authService.getUserData();
            this.username = data.username;
            this.loggedIn = true;
        }
    }

    @HostListener('window:scroll', ['$event'])
    handleScroll(){
        this.showNav = !this.location.isCurrentPathEqualTo('/') ||
            (window.pageYOffset || document.documentElement.scrollTop) > 380;
    }

    hasHistory(): boolean {
        return !this.location.isCurrentPathEqualTo('/') &&
               !this.location.isCurrentPathEqualTo('/login');
    }

    dismiss(ev, i) {
        ev.preventDefault();
        this.alerts.splice(i, 1);
    }

    goBack() {
        this.location.back();
    }

    toggleMenu(ev) {
        ev.stopPropagation();
        this.showMenu = !this.showMenu;
    }

    closeMenu() {
        this.showMenu = false;
    }

    logout() {
        this.loggedIn = null;
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
