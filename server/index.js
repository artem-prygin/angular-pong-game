import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import constants from './constants.js';
import { getMappedSockets, handleBallMove, handleBallPositionDirection, handleWSConnect } from './ws-handlers.js';

const app = express();
const server = http.createServer(app);
const ioServerOptions = process.env.NODE_ENV === 'production'
    ? {}
    : {
        cors: {
            origin: 'http://localhost:4200',
            methods: ['GET'],
        },
    };
const io = new Server(server, ioServerOptions);
const PORT = process.env.PORT || 9999;
let usedPlayerNumbers = [];
let ballMoveInterval;

if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const indexPath = path.join(__dirname, '../dist/angular-pong-game/index.html');

    app.use(express.static('dist/angular-pong-game'));

    app.get('/', (req, res) => {
        res.sendFile(indexPath);
    });
}

io.on('connection', async (socket) => {
    /* if server is full send serverIsFull socket */
    const allSockets = await io.allSockets();
    if (allSockets.size > 4) {
        socket.emit('serverIsFull');
        return;
    }

    /* on connection */
    handleWSConnect(io, socket, usedPlayerNumbers);

    /* move the ball */
    if (!ballMoveInterval) {
        ballMoveInterval = setInterval(() => {
            const sockets = getMappedSockets(io);

            /* options for PLAYER 1 */
            if (socket.ballPosition?.top - constants.BALL_STEP_PX <= 0) {
                handleBallMove(io, sockets, socket, 1);
            }

            /* options for PLAYER 2 */
            if (socket.ballPosition?.top + constants.BALL_STEP_PX >= constants.FIELD_HEIGHT) {
                handleBallMove(io, sockets, socket, 2);
            }

            /* options for PLAYER 3 */
            if (socket.ballPosition?.left - constants.BALL_STEP_PX <= 0) {
                handleBallMove(io, sockets, socket, 3);
            }

            /* options for PLAYER 4 */
            if (socket.ballPosition?.left + constants.BALL_STEP_PX >= constants.FIELD_HEIGHT) {
                handleBallMove(io, sockets, socket, 4);
            }

            /* correction of ball direction */
            handleBallPositionDirection(socket);

            io.sockets.emit('ballPosition', { ballPosition: socket.ballPosition });
        }, 50);
    }

    /* move the platform */
    socket.on('platformMoved', (data) => {
        socket.player.leftValue = data.player.leftValue;
        socket.player.platformDirection = data.player.platformDirection;
        socket.broadcast.emit('platformMoved', data);
    });

    /* stop the platform */
    socket.on('platformStopped', () => {
        socket.player.platformDirection = null;
    });

    /* on user disconnect */
    socket.on('disconnect', async () => {
        usedPlayerNumbers = usedPlayerNumbers.filter((num) => num !== socket.player.playerNumber);
        io.sockets.emit('playerHasLeft', { playerNumber: socket.player.playerNumber });
    });
});

server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
});
