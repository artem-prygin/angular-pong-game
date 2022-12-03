import { Pipe, PipeTransform } from '@angular/core';
import { PlayerInterface } from '../interfaces/player.interface';

@Pipe({
    name: 'getPlayerLoses',
})
export class GetLosesPipe implements PipeTransform {
    transform(players: PlayerInterface[], playerNum: number): string {
        const player = players?.find((p) => p.playerNumber === playerNum);

        if (!player) {
            return null;
        }

        return `(loses: ${player.loses})`;
    }
}
