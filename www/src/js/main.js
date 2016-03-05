import BattleshipGame from '../bower_components/battleships-module/src/battleship-game.js';
import Player from '../bower_components/battleships-module/src/player.js';
import ComputerPlayer from '../bower_components/battleships-module/src/computer-player.js';
import GridSelectionStrategy from '../bower_components/battleships-module/src/grid-selection-strategy.js';

import * as cellref from './cell-reference.js';

const stageElement = document.querySelector('.board .stage');
const logListElement = document.querySelector('.board .commands .log');
const commandInputElement = document.querySelector('.board .commands input');

const player = new Player();

function createGrid([columns, rows]) {

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

    return gridElement;

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

    const placementStrategy = GridSelectionStrategy.RANDOM;
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

    // place our ships random and render them

    const playerState = game.playerStates.get(player);

    // use automated random placement by default
    GridSelectionStrategy.RANDOM_PLACEMENT(playerState);

    for (let ship of playerState.grid.ships) {

        // todo: render ship matrices

        // const cell = playerGrid::getCellByCoordinate(ship.position);

        // const shipContainerElement = document.createElement('div');
        // shipContainerElement.ship = ship;
        // shipContainerElement.classList.add('ship-container');
        // shipContainerElement.dataset.width = ship.geometry.width;
        // shipContainerElement.dataset.height = ship.geometry.height;
        // shipContainerElement.dataset.rotation = ship.geometry.rotation;
        // shipContainerElement.style.transform = `rotate(${ship.geometry.rotation * 90}deg)`;

        // const shipElement = document.createElement('div');
        // shipElement.classList.add('ship');
        // shipElement.style.transform = `scale(${ship.geometry.width}, ${ship.geometry.height})`;

        // shipContainerElement.appendChild(shipElement);

        // cell.appendChild(shipContainerElement);

    }

    game.addEventListener('shot-fired', e => {

        // establish whose grid we're going to be updating, based on the attacking player
        const grid = e.attacker === player ? opponentGrid : playerGrid;

        // find the cell within the grid that matches the column and row
        const cell = grid::getCellByCoordinate(e.shot.position);

        cell.dataset.state = e.shot.hit ? 'hit' : 'miss';

        log(`Firing at ${cellref.stringify(e.shot.position)}`, 'response');

    });

}

function log(entry, type) {

    const commandRecordElement = document.createElement('li');
    commandRecordElement.dataset.type = type;
    commandRecordElement.textContent = entry;

    logListElement.appendChild(commandRecordElement);

}

function fireAt(coordinate, textCommand) {

    log(textCommand || `Fire at ${cellref.stringify(coordinate)}`, 'request');

    const game = currentGame;

    // find the first player that is not us
    const opponent = game.players.find(otherPlayer => otherPlayer !== player);

    const state = game.playerStates.get(player);

    state.fire(opponent, coordinate);

}

document.addEventListener('click', e => {

    const startButton = e.target.closest('.start-button');

    if (startButton == null) return;

    // todo: by options
    onStartGame([10, 10]);

});

//
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
