import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';
import { GameConstants } from '../../constants/game-constants';
import { PlayerInterface } from '../../interfaces/player.interface';

@Component({
    selector: 'app-player-platforms',
    templateUrl: './player-platforms.component.html',
    styleUrls: ['./player-platforms.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPlatformsComponent {
    @Input() playersNumbers: number[];
    @Input() currentPlayer: PlayerInterface;
    @Input() allPlayers: PlayerInterface[];
    GameConstants = GameConstants;

    getPlatformLeftPosition(playerNumber: number): number {
        const player = this.allPlayers.find((p) => p.playerNumber === playerNumber);
        if (!player) {
            return 0;
        }

        return player.leftValue;
    }

}
