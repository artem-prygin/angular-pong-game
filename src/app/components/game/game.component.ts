import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    Renderer2,
} from '@angular/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PlayerInterface } from '../../interfaces/player.interface';
import { BallPositionInterface } from '../../interfaces/ball-position.interface';
import { DirectionsEnum } from '../../enum/directions.enum';
import { GameService } from '../../services/game.service';
import { GameConstants } from '../../constants/game-constants';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit, OnDestroy {
    sub$ = new Subscription();
    currentPlayer: PlayerInterface;
    allPlayers: PlayerInterface[] = [];
    playersNumbers: number[];
    loserPlayerNumber: number;
    ballPosition: BallPositionInterface;
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
                if (!GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue >= GameConstants.MaximumPlatformLeftPosition) {
                    return;
                }
                this.currentPlayer = {
                    ...this.currentPlayer,
                    leftValue: this.currentPlayer.leftValue + 10,
                };
                if (this.dropDirectionTimeOut) {
                    clearTimeout(this.dropDirectionTimeOut);
                }
                this.gameService.movePlatform(this.currentPlayer, leftValue + 10, DirectionsEnum.RIGHT);
                break;
            case 'ArrowLeft':
                if (!GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue <= 0) {
                    return;
                }
                this.currentPlayer = {
                    ...this.currentPlayer,
                    leftValue: this.currentPlayer.leftValue - 10,
                };
                if (this.dropDirectionTimeOut) {
                    clearTimeout(this.dropDirectionTimeOut);
                }
                this.gameService.movePlatform(this.currentPlayer, leftValue - 10, DirectionsEnum.LEFT);
                break;

            /* up and down arrows work only for players #3 and #4 */
            case 'ArrowUp':
                if (GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue >= GameConstants.MaximumPlatformLeftPosition) {
                    return;
                }

                if (playerNumber === GameConstants.LeftSidePlayerNumber) {
                    this.currentPlayer = {
                        ...this.currentPlayer,
                        leftValue: this.currentPlayer.leftValue + 10,
                    };
                    this.gameService.movePlatform(this.currentPlayer, leftValue + 10, DirectionsEnum.TOP);
                }

                if (playerNumber === GameConstants.RightSidePlayerNumber) {
                    this.currentPlayer = {
                        ...this.currentPlayer,
                        leftValue: this.currentPlayer.leftValue - 10,
                    };
                    this.gameService.movePlatform(this.currentPlayer, leftValue - 10, DirectionsEnum.TOP);
                }

                if (this.dropDirectionTimeOut) {
                    clearTimeout(this.dropDirectionTimeOut);
                }
                break;
            case 'ArrowDown':
                if (GameConstants.HorizontalPlayerNumbers.includes(playerNumber) || leftValue <= 0) {
                    return;
                }

                if (playerNumber === GameConstants.LeftSidePlayerNumber) {
                    this.currentPlayer = {
                        ...this.currentPlayer,
                        leftValue: this.currentPlayer.leftValue - 10,
                    };
                    this.gameService.movePlatform(this.currentPlayer, leftValue - 10, DirectionsEnum.BOTTOM);
                }

                if (playerNumber === GameConstants.RightSidePlayerNumber) {
                    this.currentPlayer = {
                        ...this.currentPlayer,
                        leftValue: this.currentPlayer.leftValue + 10,
                    };
                    this.gameService.movePlatform(this.currentPlayer, leftValue + 10, DirectionsEnum.BOTTOM);
                }

                if (this.dropDirectionTimeOut) {
                    clearTimeout(this.dropDirectionTimeOut);
                }
                break;
            default:
                break;
        }

        this.dropDirectionTimeOut = setTimeout(() => {
            this.gameService.stopPlatform();
        }, 300);

        this.cdr.detectChanges();
    }

    constructor(
        public gameService: GameService,
        public dialog: MatDialog,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.gameService.handleSocketConnections();

        this.sub$.add(
            this.gameService.currentPlayer.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            ).subscribe((currentPlayer) => {
                this.currentPlayer = currentPlayer;
                this.cdr.detectChanges();
            }),
        );

        this.sub$.add(
            this.gameService.playersNumbers.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            ).subscribe((playersNumbers) => {
                this.playersNumbers = playersNumbers;
                this.cdr.detectChanges();
            }),
        );

        this.sub$.add(
            this.gameService.allPlayers.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            ).subscribe((allPlayers) => {
                this.allPlayers = allPlayers;
                this.cdr.detectChanges();
            }),
        );

        this.sub$.add(
            this.gameService.ballPosition.pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            ).subscribe((ballPosition) => {
                this.ballPosition = ballPosition;
                this.cdr.detectChanges();
            }),
        );

        this.sub$.add(
            this.gameService.loserPlayerNumber.pipe(
                distinctUntilChanged((a, b) => a === b),
            ).subscribe((loserPlayerNumber) => {
                this.loserPlayerNumber = loserPlayerNumber;
                this.cdr.detectChanges();
            }),
        );
    }

    ngOnDestroy(): void {
        this.sub$.unsubscribe();
    }
}
