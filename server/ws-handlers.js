import constants from './constants.js';
import { getRandom } from './helpers.js';

const allPlayerNumbers = [1, 2, 3, 4];
const initialBallPosition = { left: 240, top: 200, direction: 'top' };

export const getMappedSockets = (io) => {
    const socketIDs = Array.from(io.sockets.adapter.rooms).map((room) => room[0]);
    return socketIDs.map((socketId) => io.sockets.sockets.get(socketId));
};

export const getPlayers = (io) => {
    const mappedSockets = getMappedSockets(io);
    if (!mappedSockets[0].ballPosition) {
        mappedSockets[0].ballPosition = { ...initialBallPosition };
    }
    return mappedSockets.map((data) => data.player);
};

export const handleWSConnect = (io, socket, usedPlayerNumbers) => {
    const { name, leftValue, platformWidth } = socket.handshake.query;
    socket.player = {
        name,
        leftValue: +leftValue,
        platformWidth: +platformWidth,
        loses: 0,
    };
    socket.player.playerNumber = allPlayerNumbers.filter((num) => !usedPlayerNumbers.includes(num))[0];
    usedPlayerNumbers.push(socket.player.playerNumber);
    const players = getPlayers(io);
    socket.emit('connected', { player: socket.player, players, ballPosition: players[0].ballPosition });
    socket.broadcast.emit('playerConnected', { player: socket.player });
};

export const handleBallMove = (io, sockets, socket, playerNumber) => {
    const player = sockets.find((socket) => socket.player.playerNumber === playerNumber)?.player;
    let isBallOutsideThePlatform;

    if (player) {
        const { leftValue, platformWidth } = player;
        switch (playerNumber) {
            case 1:
            case 2:
                isBallOutsideThePlatform = leftValue > socket.ballPosition.left || leftValue + platformWidth < socket.ballPosition.left;
                break;
            case 3:
            case 4:
                isBallOutsideThePlatform = leftValue > socket.ballPosition.top || leftValue + platformWidth < socket.ballPosition.top;
                break;
            default:
                return;
        }

        /* check if ball is outside the platform or not */
        if (isBallOutsideThePlatform) {
            player.loses += 1;
            io.sockets.emit('countLose', { playerNumber, loses: player.loses });
        }
    }

    /* if PLAYER doesn't exist or it's platformDirection is null, save the angle of ball direction */
    if (!player || !player.platformDirection || isBallOutsideThePlatform) {
        if (playerNumber === 1) {
            switch (socket.ballPosition.direction) {
                case constants.TOP: {
                    socket.ballPosition.direction = constants.BOTTOM;
                    break;
                }
                case constants.TOP_LEFT: {
                    socket.ballPosition.direction = constants.BOTTOM_LEFT;
                    break;
                }
                case constants.TOP_RIGHT: {
                    socket.ballPosition.direction = constants.BOTTOM_RIGHT;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 2) {
            switch (socket.ballPosition.direction) {
                case constants.BOTTOM: {
                    socket.ballPosition.direction = constants.TOP;
                    break;
                }
                case constants.BOTTOM_LEFT: {
                    socket.ballPosition.direction = constants.TOP_LEFT;
                    break;
                }
                case constants.BOTTOM_RIGHT: {
                    socket.ballPosition.direction = constants.TOP_RIGHT;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 3) {
            switch (socket.ballPosition.direction) {
                case constants.LEFT: {
                    socket.ballPosition.direction = constants.RIGHT;
                    break;
                }
                case constants.BOTTOM_LEFT: {
                    socket.ballPosition.direction = constants.BOTTOM_RIGHT;
                    break;
                }
                case constants.TOP_LEFT: {
                    socket.ballPosition.direction = constants.TOP_RIGHT;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 4) {
            switch (socket.ballPosition.direction) {
                case constants.RIGHT: {
                    socket.ballPosition.direction = constants.LEFT;
                    break;
                }
                case constants.TOP_RIGHT: {
                    socket.ballPosition.direction = constants.TOP_LEFT;
                    break;
                }
                case constants.BOTTOM_RIGHT: {
                    socket.ballPosition.direction = constants.BOTTOM_LEFT;
                    break;
                }
                default:
                    break;
            }
        }
    }

    /* if PLAYER exists and its platformDirection is NOT null, implement the angle of ball direction according to platformDirection */
    if (player?.platformDirection != null && !isBallOutsideThePlatform) {
        if (playerNumber === 1) {
            switch (socket.ballPosition.direction) {
                case constants.TOP: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.BOTTOM_LEFT
                        : constants.BOTTOM_RIGHT;
                    break;
                }
                case constants.TOP_LEFT: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.BOTTOM
                        : constants.BOTTOM_RIGHT;
                    break;
                }
                case constants.TOP_RIGHT: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.BOTTOM_LEFT
                        : constants.BOTTOM;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 2) {
            switch (socket.ballPosition.direction) {
                case constants.BOTTOM: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.TOP_LEFT
                        : constants.TOP_RIGHT;
                    break;
                }
                case constants.BOTTOM_LEFT: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.TOP
                        : constants.TOP_RIGHT;
                    break;
                }
                case constants.BOTTOM_RIGHT: {
                    socket.ballPosition.direction = player.platformDirection === constants.LEFT
                        ? constants.TOP_LEFT
                        : constants.TOP;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 3) {
            switch (socket.ballPosition.direction) {
                case constants.LEFT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.TOP_RIGHT
                        : constants.BOTTOM_RIGHT;
                    break;
                }
                case constants.BOTTOM_LEFT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.TOP_RIGHT
                        : constants.RIGHT;
                    break;
                }
                case constants.TOP_LEFT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.RIGHT
                        : constants.BOTTOM_RIGHT;
                    break;
                }
                default:
                    break;
            }
        }

        if (playerNumber === 4) {
            switch (socket.ballPosition.direction) {
                case constants.RIGHT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.TOP_LEFT
                        : constants.BOTTOM_LEFT;
                    break;
                }
                case constants.BOTTOM_RIGHT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.TOP_LEFT
                        : constants.LEFT;
                    break;
                }
                case constants.TOP_RIGHT: {
                    socket.ballPosition.direction = player.platformDirection === constants.TOP
                        ? constants.LEFT
                        : constants.BOTTOM_LEFT;
                    break;
                }
                default:
                    break;
            }
        }
    }
}

export const handleBallPositionDirection = (socket) => {
    switch (socket.ballPosition.direction) {
        case constants.TOP:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left,
                top: socket.ballPosition.top - getRandom(),
            };
            break;
        case constants.TOP_LEFT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left - getRandom(),
                top: socket.ballPosition.top - getRandom(),
            };
            break;
        case constants.TOP_RIGHT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left + getRandom(),
                top: socket.ballPosition.top - getRandom(),
            };
            break;
        case constants.BOTTOM:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left,
                top: socket.ballPosition.top + getRandom(),
            };
            break;
        case constants.BOTTOM_LEFT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left - getRandom(),
                top: socket.ballPosition.top + getRandom(),
            };
            break;
        case constants.BOTTOM_RIGHT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left + getRandom(),
                top: socket.ballPosition.top + getRandom(),
            };
            break;
        case constants.LEFT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left - getRandom(),
                top: socket.ballPosition.top,
            };
            break;
        case constants.RIGHT:
            socket.ballPosition = {
                ...socket.ballPosition,
                left: socket.ballPosition.left + getRandom(),
                top: socket.ballPosition.top,
            };
            break;
        default:
            break;
    }
}
