import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { GameDataInterface } from '../interfaces/game-data.interface';
import { PlayerInterface } from '../interfaces/player.interface';
import { BallPositionInterface } from '../interfaces/ball-position.interface';
import { environment } from '../../environments/environment';
import { DirectionsEnum } from '../enum/directions.enum';
import { GameConstants } from '../constants/game-constants';

const WS_HOST = environment.production
    ? location.origin.replace(/^http/, 'ws')
    : 'ws://localhost:9999/';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    socket: Socket;
    socketIsConnected: boolean;
    private currentPlayer$ = new Subject<PlayerInterface>();
    private allPlayers$ = new Subject<PlayerInterface[]>();
    private playersNumbers$ = new Subject<number[]>();
    private loserPlayerNumber$ = new Subject<number>();
    private ballPosition$ = new Subject<BallPositionInterface>();
    private _allPlayers: PlayerInterface[];

    get currentPlayer(): Observable<PlayerInterface> {
        return this.currentPlayer$.asObservable();
    }

    get allPlayers(): Observable<PlayerInterface[]> {
        return this.allPlayers$.asObservable();
    }

    get playersNumbers(): Observable<number[]> {
        return this.playersNumbers$.asObservable();
    }

    get loserPlayerNumber(): Observable<number> {
        return this.loserPlayerNumber$.asObservable();
    }

    get ballPosition(): Observable<BallPositionInterface> {
        return this.ballPosition$.asObservable();
    }

    handleSocketConnections(): void {
        this.socket = io(WS_HOST, {
            query: {
                name: localStorage.getItem('username'),
                leftValue: GameConstants.InitPlatformLeftPosition,
                platformWidth: GameConstants.PlatformWidth,
            },
        });

        this.socket.on('connected', (data: GameDataInterface) => {
            this.currentPlayer$.next(data.player);
            this.allPlayers$.next(data.players);
            this._allPlayers = data.players;
            this.playersNumbers$.next(data.players.map((p) => p.playerNumber));
            this.ballPosition$.next(data.ballPosition);
            this.currentPlayer$.next(data.player);
            this.socketIsConnected = true;
        });

        this.socket.on('playerHasLeft', async (data: { playerNumber: number }) => {
            this._allPlayers = this._allPlayers.filter((p) => p.playerNumber !== data.playerNumber);
            this.allPlayers$.next(this._allPlayers);
            this.playersNumbers$.next(this._allPlayers.map((p) => p.playerNumber));
        });

        this.socket.on('playerConnected', async (data: { player: PlayerInterface }) => {
            this._allPlayers = [...this._allPlayers, data.player];
            this.allPlayers$.next(this._allPlayers);
            this.playersNumbers$.next(this._allPlayers.map((p) => p.playerNumber));
        });

        this.socket.on('ballPosition', (data: { ballPosition: BallPositionInterface }) => {
            this.ballPosition$.next(data.ballPosition);
        });

        this.socket.on('countLose', async (data: { playerNumber: number, loses: number }) => {
            this._allPlayers = this._allPlayers.map((player) => {
                this.loserPlayerNumber$.next(data.playerNumber);
                if (player.playerNumber === data.playerNumber) {
                    return {
                        ...player,
                        loses: data.loses,
                    };
                }

                return player;
            });
            this.allPlayers$.next(this._allPlayers);

            setTimeout(() => {
                this.loserPlayerNumber$.next(null);
            }, 1500);
        });

        this.socket.on('platformMoved', async (data: { player: PlayerInterface }) => {
            this._allPlayers = this._allPlayers.map((player) => {
                if (player.playerNumber === data.player.playerNumber) {
                    return {
                        ...player,
                        leftValue: data.player.leftValue,
                    };
                }

                return player;
            });

            this.allPlayers$.next(this._allPlayers);
        });

        this.socket.on('disconnect', () => {
            this.socketIsConnected = false;
            console.log('You was disconnected from server, loser');
        });
    }

    movePlatform(currentPlayer: PlayerInterface, leftValue: number, platformDirection: DirectionsEnum): void {
        this.socket.emit('platformMoved', { player: { ...currentPlayer, leftValue, platformDirection } });
    }

    stopPlatform(): void {
        this.socket.emit('platformStopped');
    }
}
