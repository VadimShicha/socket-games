module.exports = class TicTacToe
{
    constructor()
    {
        this.board = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
        this.turn = Math.floor(Math.random() * 2);
        this.timeSinceLastMove = Date.now();
        this.timeoutID = null;
        this.onLoseTimeFunc = function(){};
    }

    getTurn()
    {
        return this.turn;
    }

    onLoseTime(func)
    {
        this.switchTurn();
        this.onLoseTimeFunc = func;
    }

    startTime()
    {
        if(this.timeoutID != null)
        {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }

        this.timeoutID = setTimeout(function()
        {
            this.onLoseTimeFunc();
        }.bind(this), 9000);
    }

    move(turnIndex, row, column)
    {
        if(this.timeoutID != null)
        {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }

        if(this.board[row][column] == -1 && turnIndex == this.turn)
        {
            this.board[row][column] = turnIndex;
            this.startTime(turnIndex);

            return true;
        }
        else
            return false;
    }

    switchTurn()
    {
        this.turn = this.getOppositePlayer(this.turn);
    }

    getOppositePlayer(player)
    {
        if(player == 0)
            return 1;
        return 0;
    }

    getBoard()
    {
        return this.board;
    }

    //checks the game status (win, draw, game going)
    //-2 draw
    //-1 - the game is still goin
    //0  - player 1 won
    //1  - player 2 won
    getStatus()
    {
        //check if there is a win for either player
        for(let turn = 0; turn < 2; turn++)
        {
            //horizontal wins
            if(this.board[0][0] == turn && this.board[0][1] == turn && this.board[0][2] == turn) return turn;
            if(this.board[1][0] == turn && this.board[1][1] == turn && this.board[1][2] == turn) return turn;
            if(this.board[2][0] == turn && this.board[2][1] == turn && this.board[2][2] == turn) return turn;

            //vertical wins
            if(this.board[0][0] == turn && this.board[1][0] == turn && this.board[2][0] == turn) return turn;
            if(this.board[0][1] == turn && this.board[1][1] == turn && this.board[2][1] == turn) return turn;
            if(this.board[0][2] == turn && this.board[1][2] == turn && this.board[2][2] == turn) return turn;

            //diagonal wins
            if(this.board[0][0] == turn && this.board[1][1] == turn && this.board[2][2] == turn) return turn; //top left to bottom right
            if(this.board[2][0] == turn && this.board[1][1] == turn && this.board[0][2] == turn) return turn; //bottom left to top right
        }


        //check if there are any empty spaces. if so the game is still going. if not the game is a draw
        for(let row = 0; row < 3; row++)
            for(let column = 0; column < 3; column++)
                if(this.board[row][column] == -1)
                    return -1;

        return -2; //the game is a draw
    }
}