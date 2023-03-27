import React, {createRef} from 'react';
import Matter from 'matter-js';
import { socket } from '../socket';
import Cookies from 'js-cookie';
import "./TicTacToeMultiGame.css";

class TicTacToeMultiGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {tableBody: <></>};
        this.board = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
        //-1 EMPTY
        //0 X
        //1 O
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
                            <td key={index + "_" + subindex} className={this.getClassByValue(this.board[index][subindex])} onClick={() => this.tableCellClick(index, subindex)}></td>
                        )
                    })}
                </tr>
            )
        });

        this.setState({tableBody: tableBody});
    }

    tableCellClick(row, column)
    {
        socket.emit("tic_tac_toe_move", {row: row, column: column}, function(data)
        {
            console.log(data);
        });
        //this.board[row][column] = -1;
        this.updateTable();
    }

    load()
    {
        this.updateTable();
        let board = this.board;

        socket.on("tic_tac_toe_tick", function(data)
        {
            board = data.board;
            this.updateTable();
        });


        this.board = board;
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
                <h2>Tic Tac Toe</h2>
                <table className="tic_tac_toe_table center_align">
                    <tbody>{this.state.tableBody}</tbody>
                </table>
            </div>
        );
    };
}

export default TicTacToeMultiGame;