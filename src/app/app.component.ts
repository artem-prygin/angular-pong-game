import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TypeNameComponent } from './components/type-name/type-name.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    username: string;

    constructor(public dialog: MatDialog) {
        this.username = localStorage.getItem('username');

        if (!this.username) {
            const dialogRef = this.dialog.open(TypeNameComponent, {
                width: '300px',
                disableClose: true,
            });

            dialogRef.afterClosed().subscribe(({ username }) => {
                this.username = username;
                localStorage.setItem('username', username);
            });
        }
    }
}
