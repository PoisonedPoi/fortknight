function Piece(type, index) {
    this.index = index;
    this.type = type;
    this.icon = document.createElement('div');
    this.icon.appendChild(document.querySelector('#' + type).cloneNode());
    let turnOrder = document.createElement('div');
    turnOrder.style.background = 'white';
    this.icon.appendChild(turnOrder);
    this.icon.style.height = 'auto';
    this.icon.children[0].style.height = '2vh';
    this.icon.style.position = 'absolute';
    this.icon.style.transform = 'translate(-50%,-50%)';
    this.deploymentCounter = type == 'queen' ? 5 : 3; //PC changed this line 5:3 is original, 3 is time between spawns
    this.checkAlive = () => {
        if (playerIndex != this.index) occupiedSquares.push(this.index);
        return playerIndex != this.index;
    };
    this.move = () => {
        if (this.deploymentCounter == 0) {
            // check if player is on me
            // if so, return false
            // else
            // generate possible moves
            let possibleMoves = protopieces[this.type].generateMoves(this.index);
            possibleMoves = possibleMoves.filter((i) => !isOccupied(i));
            if (!possibleMoves.length) return false; // die
            // check if I can hit player and not drunk
            if (possibleMoves.includes(playerIndex) && gameMode != 'drunk') {
                this.index = playerIndex;
                // if i can hit player, hit player
            } else {
                this.index =
                    possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
            this.moved = true;
            return true;
        } else if (this.deploymentCounter > 1) {
            this.deploymentCounter--;
            return true;
        } else {
            this.icon.children[0].style.height = '5vh';
            this.deploymentCounter--;
            return true;
        }
    };

    // Part of is square safe
    this.canHitSquare = (SquareIndex) => {
        console.log('piece deployment counter', this.deploymentCounter);
        if (this.deploymentCounter <= 1) {
            // check if player is on me
            // if so, return false because square is safe as can continue moving
            // else
            // generate possible moves
            let possibleMoves = protopieces[this.type].generateMoves(this.index);
            possibleMoves = possibleMoves.filter((i) => !isOccupied(i));
            if (!possibleMoves.length) return false; // die
            // check if I can hit the specified square
            if (possibleMoves.includes(SquareIndex) && gameMode != 'drunk') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    this.cleanup = () => {
        //this.icon.remove();
        this.moved = this.deploymentCounter != 0;
    };
    this.draw = () => {
        turnOrder.innerText = this.deploymentCounter;
        if (this.deploymentCounter == 0 && gameMode != 'strategist') {
            turnOrder.style.display = 'none';
        } else if (this.deploymentCounter == 0) {
            turnOrder.innerText = pieces.indexOf(this) + 1;
        }
        drawToIndex(this.icon, this.index);
    };
}
let isOccupied = (index) => {
    for (let i of pieces) {
        if (i.index == index) return true;
    }
    return gameMode != 'strategist' && occupiedSquares.indexOf(index) != -1;
};
let protopieces = {
    knight: {
        value: 3,
        spawnTries: 5,
        generateMoves: (index) => {
            let possibleMoves = [];
            /*Up two over one left*/
            if (index % 7 > 0 && Math.floor(index / 7) > 1) possibleMoves.push(-15);
            /*Up two over one right */
            if (index % 7 < 6 && Math.floor(index / 7) > 1) possibleMoves.push(-13);

            /*Left two up one*/
            if (index % 7 > 1 && Math.floor(index / 7) > 0) possibleMoves.push(-9);
            /*Right two up one*/
            if (index % 7 < 5 && Math.floor(index / 7) > 0) possibleMoves.push(-5);

            /*Right two down one*/
            if (index % 7 > 1 && Math.floor(index / 7) < 6) possibleMoves.push(5);
            /*Left two down one*/
            if (index % 7 < 5 && Math.floor(index / 7) < 6) possibleMoves.push(9);
            /*Down two over one right */
            if (index % 7 > 0 && Math.floor(index / 7) < 5) possibleMoves.push(13);
            /*Down two over one left*/
            if (index % 7 < 6 && Math.floor(index / 7) < 5) possibleMoves.push(15);
            possibleMoves = possibleMoves.map((i) => i + index);
            return possibleMoves;
        },
    },
    king: {
        value: 2,
        spawnTries: 6,
        generateMoves: (index) => {
            let possibleMoves = [];
            if (index % 7 > 0) possibleMoves.push(-1);
            if (index % 7 < 6) possibleMoves.push(1);
            if (Math.floor(index / 7) > 0) possibleMoves.push(-7);
            if (Math.floor(index / 7) < 6) possibleMoves.push(7);
            if (index % 7 > 0 && Math.floor(index / 7) > 0) possibleMoves.push(-8);
            if (index % 7 < 6 && Math.floor(index / 7) > 0) possibleMoves.push(-6);
            if (index % 7 > 0 && Math.floor(index / 7) < 6) possibleMoves.push(6);
            if (index % 7 < 6 && Math.floor(index / 7) < 6) possibleMoves.push(8);
            possibleMoves = possibleMoves.map((i) => i + index);
            return possibleMoves;
        },
    },
    rook: {
        value: 3,
        spawnTries: 4,
        generateMoves: (index) => {
            let possibleMoves = [];
            let left = index % 7,
                top = Math.floor(index / 7);
            for (let i = 0; i < top; i++) {
                let d = (index % 7) + (top - i - 1) * 7;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            for (let i = 0; i < left; i++) {
                let d = index - (i + 1);
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            for (let i = 0; i < 6 - left; i++) {
                d = index + (i + 1);
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            for (let i = 0; i < 6 - top; i++) {
                d = (index % 7) + (top + i + 1) * 7;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            return possibleMoves;
        },
    },
    bishop: {
        value: 3,
        spawnTries: 4,
        generateMoves: (index) => {
            let possibleMoves = [];
            let left = index % 7,
                top = Math.floor(index / 7);
            let idash = index;
            for (let i = 0; i < top && i < left; i++) {
                d = idash -= 8;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            idash = index;

            for (let i = 0; i < 6 - top && i < 6 - left; i++) {
                d = idash += 8;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            idash = index;

            for (let i = 0; i < top && i < 6 - left; i++) {
                d = idash -= 6;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            idash = index;

            for (let i = 0; i < 6 - top && i < left; i++) {
                d = idash += 6;
                if (!isOccupied(d)) possibleMoves.push(d);
                else break;
            }
            return possibleMoves;
        },
    },
    queen: {
        value: 5,
        spawnTries: 1,
        generateMoves: (index) => {
            let possibleMoves = protopieces.bishop.generateMoves(index);
            possibleMoves.push(...protopieces.rook.generateMoves(index));
            return possibleMoves;
        },
    },
};
let protoArr = Object.entries(protopieces);