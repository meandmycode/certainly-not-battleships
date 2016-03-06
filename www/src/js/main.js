import './platform.js';
import './lib/regenerator-runtime.js';
import './lib/fastclick.min.js';

import BattleshipGame from '../bower_components/battleships-module/src/battleship-game.js';
import Player from '../bower_components/battleships-module/src/player.js';
import ComputerPlayer from '../bower_components/battleships-module/src/computer-player.js';
import GridSelectionStrategy from '../bower_components/battleships-module/src/grid-selection-strategy.js';

import * as cellref from './cell-reference.js';

FastClick.attach(document.documentElement);

const stageElement = document.querySelector('.board .stage');
const logListElement = document.querySelector('.board .commands .log');
const commandInputElement = document.querySelector('.board .commands input');
const winningDialogElement = document.querySelector('.winning-dialog-host');
const losingDialogElement = document.querySelector('.game-over-dialog-host');

const player = new Player();

function createGrid([columns, rows]) {

    const gridItemElement = document.createElement('div');
    gridItemElement.classList.add('grid-item');

    const gridElement = document.createElement('div');
    gridElement.classList.add('grid');

    for (let row = -1; row < rows; row++) {

        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        if (row === -1) {
            rowElement.classList.add('header-row');
        }

        for (let column = -1; column < columns; column++) {

            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');

            if (row === -1 || column === -1) {
                cellElement.classList.add('header-cell');
            } else {
                cellElement.classList.add('interactive-cell');

                cellElement.dataset.column = column;
                cellElement.dataset.row = row;
            }

            rowElement.appendChild(cellElement);

        }

        gridElement.appendChild(rowElement);

    }

    gridItemElement.appendChild(gridElement);

    return gridItemElement;

}

let currentGame;

function getCellByCoordinate([column, row]) {

    const grid = this;

    return grid.querySelector(`.cell[data-column='${column}'][data-row='${row}']`);

}

/** When starting a new game */
function onStartGame(dimensions) {

    const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
        grid: dimensions
    });

    const placementStrategy = GridSelectionStrategy.RANDOM_PLACEMENT;
    const attackStrategy = GridSelectionStrategy.RANDOM;

    const computer = new ComputerPlayer({ placementStrategy, attackStrategy });
    const players = [player, computer];

    const game = currentGame = new BattleshipGame({ rules, players });

    // build the player grids

    const playerGrid = createGrid(game.rules.grid);
    playerGrid.classList.add('player-grid');

    const opponentGrid = createGrid(game.rules.grid);
    opponentGrid.classList.add('opponent-grid');

    stageElement.innerHTML = '';
    stageElement.appendChild(playerGrid);
    stageElement.appendChild(opponentGrid);

    // reset various stateful ui

    logListElement.innerHTML = '';
    commandInputElement.value = '';
    winningDialogElement.hidden = true;
    losingDialogElement.hidden = true;

    // place our ships random and render them

    const playerState = game.playerStates.get(player);

    // use automated random placement by default
    GridSelectionStrategy.RANDOM_PLACEMENT(playerState);

    playerState.ready = true;

    const playerCells = [...playerGrid.querySelectorAll('.cell[data-row][data-column]')];

    for (let cell of playerCells) {

        const row = parseInt(cell.dataset.row, 10);
        const column = parseInt(cell.dataset.column, 10);

        for (let ship of playerState.grid.ships) {

            const value = ship.computed.get(row, column);

            if (value === 1) {
                cell.classList.add('hittable');
            }
        }
    }

    game.addEventListener('player-turn', e => {
    });

    game.addEventListener('shot-fired', e => {

        // establish whose grid we're going to be updating, based on the attacking player
        const grid = e.attacker === player ? opponentGrid : playerGrid;

        // find the cell within the grid that matches the column and row
        const cell = grid::getCellByCoordinate(e.position);
        cell.classList.add('shot');

        if (e.ship) {
            cell.classList.add('hit');
        }

        if (e.attacker === player) {
            if (e.sank) {
                log(`Enemy ship was sank at ${cellref.stringify(e.position)}!`, 'response');
            } else if (e.ship) {
                log(`Enemy ship hit at ${cellref.stringify(e.position)}!`, 'response');
            } else {
                log(`We hit nothing at ${cellref.stringify(e.position)}`, 'response');
            }
        } else {
            if (e.sank) {
                log(`Our ship was sank at ${cellref.stringify(e.position)}!`, 'response', 'opponent');
            } else if (e.ship) {
                log(`Our ship was hit at ${cellref.stringify(e.position)}!`, 'response', 'opponent');
            } else {
                log(`Opponent hit nothing at ${cellref.stringify(e.position)}`, 'response', 'opponent');
            }

        }

    });

    game.addEventListener('player-defeated', e => {

        // give the player a delay before showing the finish dialog

        setTimeout(() => {

            if (e.attacker === player) {
                winningDialogElement.hidden = false;
            } else {
                losingDialogElement.hidden = false;
            }

        }, 1000);

    })

    game.start();

}

function log(entry, type, playerType = 'self') {

    const commandRecordElement = document.createElement('li');
    commandRecordElement.dataset.type = type;
    commandRecordElement.dataset.playerType = playerType;
    commandRecordElement.innerHTML = entry;

    logListElement.appendChild(commandRecordElement);

}

function fireAt(coordinate, textCommand) {

    const game = currentGame;
    const state = game.playerStates.get(player);

    const playerStates = [...game.playerStates.values()];

    // find the first player that is not us
    const opponentState = playerStates.find(otherPlayerState => otherPlayerState !== state);

    state.fire(opponentState, coordinate);

}

document.addEventListener('click', e => {

    const startButton = e.target.closest('.start-button');

    if (startButton == null) {
        return;
    }

    // todo: by options
    onStartGame([10, 10]);

});

document.addEventListener('click', e => {

    if (e.target.matches('.dialog-host') !== true) {
        return;
    }

    e.target.hidden = true;

});


document.addEventListener('click', e => {

    const cell = e.target.closest('.opponent-grid .cell:not(.header-cell):not([data-state])');

    if (cell == null) return;

    const column = parseInt(cell.dataset.column, 10);
    const row = parseInt(cell.dataset.row, 10);

    fireAt([column, row]);

});

function processCommand(command) {

    const possibleCellReference = cellref.find(command);

    if (possibleCellReference != null) {
        fireAt(possibleCellReference, command);
    }

}

//
document.addEventListener('submit', e => {

    const form = e.target.closest('.commands form');

    if (form == null) return;

    e.preventDefault();

    const input = form.querySelector('input');

    const command = input.value;

    input.value = '';

    processCommand(command);

});

// start a game with default rules
onStartGame([10, 10]);

// now we're happy we're handling interactivity, let's show the app ui
document.documentElement.hidden = false;
