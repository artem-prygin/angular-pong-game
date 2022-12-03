import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GetNamePipe } from './pipes/get-name.pipe';
import { GetLosesPipe } from './pipes/get-loses.pipe';
import { GameComponent } from './components/game/game.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { TypeNameComponent } from './components/type-name/type-name.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PongBallComponent } from './components/pong-ball/pong-ball.component';
import { LoseImageComponent } from './components/lose-image/lose-image.component';
import { PlayerPlatformsComponent } from './components/player-platforms/player-platforms.component';

@NgModule({
    declarations: [
        AppComponent,
        GetNamePipe,
        GetLosesPipe,
        GameComponent,
        TypeNameComponent,
        PongBallComponent,
        LoseImageComponent,
        PlayerPlatformsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}
