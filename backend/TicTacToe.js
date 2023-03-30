//checks the game status (win, draw, game going)
//-2 draw
//-1 - the game is still goin
//0  - player 1 won
//1  - player 2 won
exports.checkStatus = function(board)
{
    //check if there is a win for either player
    for(let turn = 0; turn < 2; turn++)
    {
        //horizontal wins
        if(board[0][0] == turn && board[0][1] == turn && board[0][2] == turn) return turn;
        if(board[1][0] == turn && board[1][1] == turn && board[1][2] == turn) return turn;
        if(board[2][0] == turn && board[2][1] == turn && board[2][2] == turn) return turn;

        //vertical wins
        if(board[0][0] == turn && board[1][0] == turn && board[2][0] == turn) return turn;
        if(board[0][1] == turn && board[1][1] == turn && board[2][1] == turn) return turn;
        if(board[0][2] == turn && board[1][2] == turn && board[2][2] == turn) return turn;

        //diagonal wins
        if(board[0][0] == turn && board[1][1] == turn && board[2][2] == turn) return turn; //top left to bottom right
        if(board[2][0] == turn && board[1][1] == turn && board[0][2] == turn) return turn; //bottom left to top right
    }


    //check if there are any empty spaces. if so the game is still going. if not the game is a draw
    for(let row = 0; row < 3; row++)
        for(let column = 0; column < 3; column++)
            if(board[row][column] == -1)
                return -1;

    return -2; //the game is a draw
};

exports.getOppositePlayer = function(player)
{
    if(player == 0)
        return 1;
    return 0;
}