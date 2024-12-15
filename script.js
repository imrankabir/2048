let touchEndX = 0;
let touchEndY = 0;
let touchStartY = 0;
let touchStartX = 0;
const matrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

const scoreEle = document.querySelector('#score');
const container = document.querySelector('.grid-container');

const get = (k, d) => JSON.parse(localStorage.getItem(`game-2048-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`game-2048-${k}`, JSON.stringify(v));

const start = e => {
    const { scores } = get('scores', {scores: []});
    if (scores.length > 0) {
        document.querySelector('#top-scores').innerHTML = '';
        for (const score of scores) {
            const li = document.createElement('li');
            li.textContent = score.toLocaleString();
            document.querySelector('#top-scores').appendChild(li);
        }
    }
    const { score } = get('score', {score: 0});
    scoreEle.textContent = score;
    if (score == 0) {
        const grid = Array(4).fill().map(() => Array(4).fill(0));
        set('grid', {grid});
    } else {
        const { grid } = get('grid', {grid: matrix});    
        set('grid', {grid});
    }
    random();
    random();
    update();
};

const random = e => {
    let tiles = [];
    let { grid } = get('grid', {grid: matrix});
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) tiles.push([r, c]);
        }
    }
    if (tiles.length > 0) {
        const [row, col] = tiles[Math.floor(Math.random() * tiles.length)];
        grid[row][col] = Math.random() > 0.1 ? 2 : 4;
    }
    set('grid', {grid});
};

const update = e => {
    const { grid } = get('grid', {grid: matrix});
    container.innerHTML = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (grid[r][c] !== 0) {
                tile.textContent = grid[r][c];
                tile.setAttribute('data-value', grid[r][c]);
            }
            container.appendChild(tile);
        }
    }
};

const slide = row => {
    let newRow = row.filter(val => val);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            let { score } = get('score', {score: 0});
            score += newRow[i];
            set('score', {score});
            newRow[i + 1] = 0;
        }
    }
    newRow = newRow.filter(val => val);
    while (newRow.length < 4) newRow.push(0);
    return newRow;
};

const left = e => {
    let { grid } = get('grid', {grid: matrix});
    for (let r = 0; r < 4; r++) grid[r] = slide(grid[r]);
    set('grid', {grid});
};

const right = e => {
    let { grid } = get('grid', {grid: matrix});
    for (let r = 0; r < 4; r++) grid[r] = slide(grid[r].reverse()).reverse();
    set('grid', {grid});
};

const up = e => {
    let { grid } = get('grid', {grid: matrix});
    for (let c = 0; c < 4; c++) {
        let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        col = slide(col);
        for (let r = 0; r < 4; r++) grid[r][c] = col[r];
    }
    set('grid', {grid});
};

const down = e => {
    let { grid } = get('grid', {grid: matrix});
    for (let c = 0; c < 4; c++) {
        let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        col = slide(col.reverse()).reverse();
        for (let r = 0; r < 4; r++) grid[r][c] = col[r];
    }
    set('grid', {grid});
};

const swipe = e => {
    e.preventDefault();
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    const { grid } = get('grid', {grid: matrix});
    const prevGrid = JSON.stringify(grid);

    if (absDeltaX > absDeltaY) {
        if (deltaX > 0) right();
        else left();
    } else {
        if (deltaY > 0) down();
        else up();
    }
    const { grid: updateGrid } = get('grid', {grid: matrix});
    if (JSON.stringify(updateGrid) != prevGrid) {
        random();
        update();
        const { score } = get('score', {score: 0});
        scoreEle.textContent = score.toLocaleString();
    }
};

// const swipe = e => {
//     e.preventDefault();
    
//     const deltaX = touchEndX - touchStartX;
//     const deltaY = touchEndY - touchStartY;

//     const absDeltaX = Math.abs(deltaX);
//     const absDeltaY = Math.abs(deltaY);

//     const prevGrid = JSON.stringify(grid);

//     if (absDeltaX > absDeltaY) {
//         if (deltaX > 0) right();
//         else left();
//     } else {
//         if (deltaY > 0) down();
//         else up();
//     }
// };

document.addEventListener('keydown', e => {
    const { grid } = get('grid', {grid: matrix});
    const prevGrid = JSON.stringify(grid);
    if (e.key === 'ArrowLeft') left();
    else if (e.key === 'ArrowRight') right();
    else if (e.key === 'ArrowUp') up();
    else if (e.key === 'ArrowDown') down();
    const { grid: updateGrid } = get('grid', {grid: matrix});
    if (JSON.stringify(updateGrid) != prevGrid) {
        random();
        update();
        const { score } = get('score', {score: 0});
        scoreEle.textContent = score.toLocaleString();
    }
});

document.querySelector('#restart-btn').addEventListener('click', e => {
    let { scores } = get('scores', {scores: []});
    const { score } = get('score', {score: 0});
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 5);
    set('scores', {scores});
    set('score', {score: 0});
    set('grid', {grid: matrix});
    start();
});

container.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    swipe();
});

document.addEventListener('DOMContentLoaded', e => start());