import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-lose-image',
    templateUrl: './lose-image.component.html',
    styleUrls: ['./lose-image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoseImageComponent implements OnInit {
    failImgNumber: number;

    constructor(private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.failImgNumber = Math.round(Math.random() * (3 - 1) + 1);
        this.cdr.markForCheck();
    }

}
