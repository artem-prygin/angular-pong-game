import { Pipe, PipeTransform } from '@angular/core';
import { PlayerInterface } from '../interfaces/player.interface';

@Pipe({
    name: 'getPlayerName',
})
export class GetNamePipe implements PipeTransform {
    transform(players: PlayerInterface[], playerNum: number): string {
        const player = players?.find((p) => p.playerNumber === playerNum);

        if (!player) {
            return `Player ${playerNum}`;
        }

        return player.name;
    }
}
