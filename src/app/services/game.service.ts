import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameDataInterface } from '../interfaces/game-data.interface';
import { PlayerInterface } from '../interfaces/player.interface';
import { BallPositionInterface } from '../interfaces/ball-position.interface';
import { environment } from '../../environments/environment';
import { DirectionsEnum } from '../enum/directions.enum';
import { GameConstants } from '../constants/game-constants';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    socketIsConnected: boolean;
    private socket: Socket;
    private currentPlayer$ = new BehaviorSubject<PlayerInterface>(null);
    private allPlayers$ = new BehaviorSubject<PlayerInterface[]>(null);
    private playersNumbers$ = new BehaviorSubject<number[]>(null);
    private loserPlayerNumber$ = new BehaviorSubject<number>(null);
    private ballPosition$ = new BehaviorSubject<BallPositionInterface>(null);
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
        this.socket = io(environment.websocketServer, {
            query: {
                name: localStorage.getItem('username'),
                leftValue: GameConstants.InitPlatformLeftPosition,
                platformWidth: GameConstants.PlatformWidth,
            },
        });

        this.socket.on('connected', (data: GameDataInterface) => {
            this.handleSocketOnConnected(data);
        });

        this.socket.on('playerConnected', (data: { player: PlayerInterface }) => {
            this.handleSocketOnPlayerConnected(data);
        });

        this.socket.on('playerHasLeft', (data: { playerNumber: number }) => {
            this.handleSocketOnPlayerHasLeft(data);
        });

        this.socket.on('ballPosition', (data: { ballPosition: BallPositionInterface }) => {
            this.handleSocketOnBallPositionChanged(data);
        });

        this.socket.on('countLose', (data: { playerNumber: number, loses: number }) => {
            this.handleSocketOnCountLose(data);
        });

        this.socket.on('platformMoved', (data: { player: PlayerInterface }) => {
            this.handleSocketOnPlatformMoved(data);
        });

        this.socket.on('disconnect', () => {
            this.handleSocketOnDisconnected();
        });
    }

    handleSocketOnConnected(data: GameDataInterface): void {
        this.currentPlayer$.next(data.player);
        this.allPlayers$.next(data.players);
        this._allPlayers = data.players;
        this.playersNumbers$.next(data.players.map((p) => p.playerNumber));
        this.ballPosition$.next(data.ballPosition);
        this.currentPlayer$.next(data.player);
        this.socketIsConnected = true;
    }

    handleSocketOnPlayerConnected(data: { player: PlayerInterface }): void {
        this._allPlayers = [...this._allPlayers, data.player];
        this.allPlayers$.next(this._allPlayers);
        this.playersNumbers$.next(this._allPlayers.map((p) => p.playerNumber));
    }

    handleSocketOnPlayerHasLeft(data: { playerNumber: number }): void {
        this._allPlayers = this._allPlayers.filter((p) => p.playerNumber !== data.playerNumber);
        this.allPlayers$.next(this._allPlayers);
        this.playersNumbers$.next(this._allPlayers.map((p) => p.playerNumber));
    }

    handleSocketOnBallPositionChanged(data: { ballPosition: BallPositionInterface }): void {
        this.ballPosition$.next(data.ballPosition);
    }

    handleSocketOnCountLose(data: { playerNumber: number, loses: number }): void {
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
    }

    handleSocketOnPlatformMoved(data: { player: PlayerInterface }): void {
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
    }

    handleSocketOnDisconnected(): void {
        this.socketIsConnected = false;
        console.log('You was disconnected from server, loser');
    }

    movePlatform(currentPlayer: PlayerInterface, leftValue: number, platformDirection: DirectionsEnum): void {
        this.socket.emit('platformMoved', { player: { ...currentPlayer, leftValue, platformDirection } });
    }

    stopPlatform(): void {
        this.socket.emit('platformStopped');
    }
}
