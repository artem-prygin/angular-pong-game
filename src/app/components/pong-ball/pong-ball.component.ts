import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BallPositionInterface } from '../../interfaces/ball-position.interface';

@Component({
    selector: 'app-pong-ball',
    templateUrl: './pong-ball.component.html',
    styleUrls: ['./pong-ball.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PongBallComponent {
    @Input() ballPosition: BallPositionInterface;
}
