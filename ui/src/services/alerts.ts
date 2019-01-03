import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class AlertService {
    constructor(
    ) { }

    private alertSubject = new Subject<Alert>();
    alertTopic = this.alertSubject.asObservable();

    error(message: string): void {
        this.alertSubject.next({header: 'Error', message});
    }

    warning(message: string): void {
        this.alertSubject.next({header: 'Warning', message});
    }
}
