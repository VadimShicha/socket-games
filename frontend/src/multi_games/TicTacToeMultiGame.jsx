import React from 'react';
import { socket } from '../socket';
import "../styles/TicTacToeMultiGame.css";
import DataManager from '../dataManager';
import GameOverForm from '../components/forms/GameOverForm';

class TicTacToeMultiGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {tableBody: <></>, turnText: "===============", status: -1, statusMessage: ""};
        this.board = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];//-1 EMPTY   0 X   1 O
        this.playerIndex = -1;
        this.thisTurn = false; //indicates if it's this user's turn (just a quick check incase they clicked accidentially to not send a requests)

        this.loaded = false;
    };

    //gets the class name for x and o image
    getClassByValue(value)
    {
        if(value == 0)
            return "tic_tac_toe_x";
        else if(value == 1)
            return "tic_tac_toe_o";
        return "";
    }

    updateTable()
    {
        let tableBody = this.board.map((item, index) => {
            return (
                <tr key={index}>{item.map((subitem, subindex) => {
                        return (
                            <td key={index + "_" + subindex} className={this.getClassByValue(this.board[index][subindex]) + " " + (index == 1 ? "tic_tac_toe_horizontal" : "") + " " + (subindex == 1 ? "tic_tac_toe_vertical" : "")} onClick={() => this.tableCellClick(index, subindex)}></td>
                        )
                    })}
                </tr>
            )
        });

        this.setState({tableBody: tableBody});
    }

    tableCellClick(row, column)
    {
        //checks if it's the user's turn to not send extra requests
        //(this is NOT the official check. It will be checked in the server again)
        if(this.thisTurn)
        {
            socket.emit("tic_tac_toe_move", {row: row, column: column}, function(data)
            {
                this.updateTable();
            }.bind(this));
        }
    }

    updateTurn(turnIndex)
    {
        if(turnIndex == this.playerIndex)
        {
            this.setState({turnText: "Your turn"});
            this.thisTurn = true;
        } 
        else
        {
            this.setState({turnText: "Waiting for opponent"});
            this.thisTurn = false;
        }
    }

    load()
    {
        this.updateTable();

        socket.emit("tic_tac_toe_get_load", function(data)
        {
            console.log(data);
            if(!data.success)
                alert("Wrong game");

            this.playerIndex = data.playerIndex;
            this.updateTurn(data.turnIndex);
        }.bind(this));

        socket.on("tic_tac_toe_tick", function(data)
        {
            console.log(data);
            this.board = data.board;
            this.updateTurn(data.turnIndex);
            this.updateTable();
            this.setState({status: data.status, statusMessage: data.statusMessage});
            if(data.status != -1)
                DataManager.popTextRef.current.show(data.statusMessage);
        }.bind(this));
    }

    componentDidMount()
    {
        if(this.loaded)
            return;

        this.load();
        this.loaded = true;
    };

    render()
    {
        return (
            <div>
                <GameOverForm status={this.state.status} statusMessage={this.state.statusMessage} rematch={this.rematch}></GameOverForm>
                <h2>Tic Tac Toe</h2>
                <p>{this.state.turnText}</p>
                <table className="tic_tac_toe_table center_align">
                    <tbody>{this.state.tableBody}</tbody>
                </table>
            </div>
        );
    };
}

export default TicTacToeMultiGame;