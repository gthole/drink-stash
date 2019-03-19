import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, keyframes, animate, transition, style } from '@angular/animations';
import { RecipeStub } from '../../services/recipes';

const slideOutLeft = [
    style({transform: 'translate3d(0, 0, 0)', offset: 0}),
    style({transform: 'translate3d(-150%, 0, 0)', opacity: 0, offset: 1}),
]

const zoomOutRight = [
    style({
        transform: 'scale3d(.475, .475, .475) translate3d(-42px, 0, 0)',
        offset: .4
    }),
    style({
        transform: 'scale(.1) translate3d(2000px, 0, 0)',
        'transform-origin': 'right center',
        offset: 1
    }),
];

@Component({
    selector: 'recipe-card',
    animations: [
        trigger('cardAnimator', [
            transition('* => zoomOutRight', animate(600, keyframes(zoomOutRight))),
            transition('* => slideOutLeft', animate(300, keyframes(slideOutLeft))),
        ])
    ],
    templateUrl: './index.html'
})
export class RecipeCardComponent {
    @Input() recipe: RecipeStub;
    @Output() onClear: EventEmitter<boolean> = new EventEmitter<boolean>();

    animationState: string;
    save: boolean;

    startAnimation(state) {
        this.save = state === 'zoomOutRight';
        if (!this.animationState) {
          this.animationState = state;
        }
    }

    resetAnimationState(e) {
        if (this.animationState) this.onClear.emit(this.save);
    }
}
