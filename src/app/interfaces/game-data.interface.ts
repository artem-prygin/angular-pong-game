import { PlayerInterface } from './player.interface';
import { BallPositionInterface } from './ball-position.interface';

export interface GameDataInterface {
    player: PlayerInterface;
    players: PlayerInterface[];
    ballPosition: BallPositionInterface;
}
