import _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TagService } from '../../services/tags';


@Component({
    selector: 'tag-edit',
    template: `
        <div class="flex">
        <span *ngFor="let tag of tags" class="mr-2 rounded-full mr-2 py-1 px-2 text-white bg-purple-light text-sm">
            {{ tag }} <span (click)="removeTag(tag)">&times;</span>
        </span>
        <autocomplete
            *ngIf="sourceTags"
            [name]="'tag-add'"
            [inputClass]="'text-purple-dark text-sm border-b border-purple'"
            [(ngModel)]="newTag"
            [dataSource]="sourceTags"
            [clearOnSelect]="true"
            (selected)="addTag($event)"></autocomplete>
        </div>
    `,
    styles: [``]
})
export class TagEditComponent implements OnInit {
    constructor(
        private tagService: TagService,
    ) {}

    @Input() tags: string[];
    @Input() autoFocus: boolean = false;
    @Output() output = new EventEmitter<string[]>();

    sourceTags: string[];
    newTag: string = '';

    ngOnInit() {
        this.tagService.getPage().then((tagsResp) => {
            this.sourceTags = tagsResp.results;
            if (this.autoFocus) {
                setTimeout(() => document.getElementById('tag-add').focus(), 100);
            }
        });
    }

    addTag() {
        this.tags = _.sortBy(_.union(this.tags, [this.newTag]));
        this.output.emit(this.tags);
    }

    removeTag(t: string) {
        this.tags = this.tags.filter((s) => s != t);
        this.output.emit(this.tags);
    }
}
