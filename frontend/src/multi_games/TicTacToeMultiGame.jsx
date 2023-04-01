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
        this.board = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
        //-1 EMPTY
        //0 X
        //1 O
        this.loaded = false;
    };

    rematch()
    {
        socket.emit("rematch", {token: DataManager.token}, function(data)
        {

        });
    }

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
        socket.emit("tic_tac_toe_move", {token: DataManager.token, row: row, column: column}, function(data)
        {
            this.updateTable();
        });
    }

    updateTurn()
    {
        socket.emit("tic_tac_toe_is_turn", {token: DataManager.token}, function(data)
        {
            console.log(data);
            if(data)
                this.setState({turnText: "Your turn"});
            else
                this.setState({turnText: "Waiting for opponent"});
        }.bind(this));
    }

    tick(data)
    {
        this.board = data.board;
        this.updateTurn();
        this.updateTable();
    }

    status(data)
    {
        this.setState({status: data.status, statusMessage: data.statusMessage});
        if(data.status != -1)
            DataManager.popTextRef.current.show(data.statusMessage);
    }

    load()
    {
        this.updateTurn();
        this.updateTable();
        socket.on("tic_tac_toe_tick", this.tick.bind(this));
        socket.on("tic_tac_toe_status", this.status.bind(this));
    }

    componentDidMount()
    {
        if(this.loaded)
            return;

        console.log("LOAD");

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