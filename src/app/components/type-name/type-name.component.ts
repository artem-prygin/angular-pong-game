import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-type-name',
    templateUrl: './type-name.component.html',
    styleUrls: ['./type-name.component.scss'],
})
export class TypeNameComponent {
    username = '';

    constructor(public dialogRef: MatDialogRef<TypeNameComponent>) {
    }

    saveUsername(): void {
        if (!this.username) {
            return;
        }

        this.dialogRef.close({ username: this.username });
    }

}
