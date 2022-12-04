import {
    Component,
    HostListener,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PlayerInterface } from '../../interfaces/player.interface';
import { DirectionsEnum } from '../../enum/directions.enum';
import { GameService } from '../../services/game.service';
import { GameConstants } from '../../constants/game-constants';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
    sub$ = new Subscription();
    currentPlayer: PlayerInterface;
    dropDirectionTimeOut;
    GameConstants = GameConstants;

    @HostListener('window:keydown', ['$event'])
    onKeyup(e: KeyboardEvent): void {
        if (!this.currentPlayer) {
            return;
        }

        const { playerNumber, leftValue } = this.currentPlayer;
        switch (e.key) {
            /* right and left arrows work only for players #1 and #2 */
            case 'ArrowRight':
                this.handleArrowRightPress(playerNumber, leftValue);
                break;
            case 'ArrowLeft':
                this.handleArrowLeftPress(playerNumber, leftValue);
                break;

            /* up and down arrows work only for players #3 and #4 */
            case 'ArrowUp':
                this.handleArrowUpPress(playerNumber, leftValue);
                break;
            case 'ArrowDown':
                this.handleArrowDownPress(playerNumber, leftValue);
                break;
            default:
                break;
        }

        this.dropDirectionTimeOut = setTimeout(() => {
            this.gameService.stopPlatform();
        }, 300);
    }

    constructor(
        public gameService: GameService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.gameService.handleSocketConnections();

        this.sub$.add(
            this.gameService.currentPlayer.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            ).subscribe((currentPlayer) => {
                this.currentPlayer = currentPlayer;
            }),
        );
    }

    setCurrentPlayerLeftValue(leftValue, leftDiff: number, direction: DirectionsEnum): void {
        this.currentPlayer = {
            ...this.currentPlayer,
            leftValue: this.currentPlayer.leftValue + leftDiff,
        };

        this.gameService.movePlatform(this.currentPlayer, leftValue + leftDiff, direction);

        if (this.dropDirectionTimeOut) {
            clearTimeout(this.dropDirectionTimeOut);
        }
    }

    handleArrowRightPress(playerNumber, leftValue): void {
        if (!GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue >= GameConstants.MaximumPlatformLeftPosition) {
            return;
        }

        this.setCurrentPlayerLeftValue(leftValue, 10, DirectionsEnum.RIGHT);
    }

    handleArrowLeftPress(playerNumber, leftValue): void {
        if (!GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue <= 0) {
            return;
        }
        this.setCurrentPlayerLeftValue(leftValue, -10, DirectionsEnum.LEFT);
    }

    handleArrowUpPress(playerNumber, leftValue): void {
        if (GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue >= GameConstants.MaximumPlatformLeftPosition) {
            return;
        }

        switch (playerNumber) {
            case GameConstants.LeftSidePlayerNumber:
                this.setCurrentPlayerLeftValue(leftValue, 10, DirectionsEnum.TOP);
                break;
            case GameConstants.RightSidePlayerNumber:
                this.setCurrentPlayerLeftValue(leftValue, -10, DirectionsEnum.TOP);
                break;
            default:
                break;
        }
    }

    handleArrowDownPress(playerNumber, leftValue): void {
        if (GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue <= 0) {
            return;
        }

        switch (playerNumber) {
            case GameConstants.LeftSidePlayerNumber:
                this.setCurrentPlayerLeftValue(leftValue, -10, DirectionsEnum.BOTTOM);
                break;
            case GameConstants.RightSidePlayerNumber:
                this.setCurrentPlayerLeftValue(leftValue, 10, DirectionsEnum.BOTTOM);
                break;
            default:
                break;
        }
    }

    ngOnDestroy(): void {
        this.sub$.unsubscribe();
    }
}
