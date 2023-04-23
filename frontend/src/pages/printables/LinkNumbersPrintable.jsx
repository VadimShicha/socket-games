import React, { createRef, useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import "../../styles/LinkNumbersPrintable.css";
import DataManager from '../../dataManager';

function LinkNumbersPrintable(props)
{
    const canvasRef = useRef(null);
    const [reloader, setReloader] = useState(false);

    function randInt(min, max)
    {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function generate(level, numbers)
    {
        let context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        context.textAlign = "center";
        context.font = "bold 25px Arial";
        context.fillText("Link the Numbers", canvasRef.current.width / 2, 45);
        context.font = "normal 20px Arial";
        context.fillText(level, canvasRef.current.width / 2, 80);
        context.fillText("Draw a line from each number to the other. You can't go out of bounds, cross any lines or circles.", canvasRef.current.width / 2, canvasRef.current.height - 70);

        context.fillStyle = "black";
        context.font = "normal 17px Arial";
        context.lineWidth = 5;
        
        context.strokeRect(100, 100, canvasRef.current.width - 200, canvasRef.current.height - 200);
        context.lineWidth = 1;

        let numberPositions = [];

        for(let i = 0; i < numbers; i++)
        {
            for(let j = 0; j < 2; j++)
            {
                
                let posX = randInt(150, canvasRef.current.width - 150);
                let posY = randInt(150, canvasRef.current.height - 150);

                // for(let k = 0; k < numberPositions; k++)
                // {
                //     if(numberPositions[k][0])
                // }

                context.fillText((i + 1).toString(), posX + 6, posY); //posX - ((i + 1).toString().length * 7) + 9,
                context.beginPath();
                context.arc(posX + 7, posY - 7, 13, 0, 2 * Math.PI);
                context.stroke();

                numberPositions.push([posX, posY]);
            }
        }

        setReloader(!reloader);
        window.print();
    }

    return (
        <>
            <div className="printable">
                <div className="printable_ui_div">
                    <div className="printable_ui_logo_div">
                        <img src="/assets/trumpet.svg"></img>
                        <p>trumpetgames.com/printables</p>
                    </div>
                    
                </div>
                
                <canvas width="1052px" height="812px" ref={canvasRef}></canvas>
            </div>
            <div className="non_printable">
                <NavBar page={-1}></NavBar>
                <div className="nav_bar_body">
                    <h2>Link the Numbers Printable</h2>
                    <p>Select a level to play</p>

                    <button onClick={() => generate("Noob", 7)}>Noob (7 numbers)</button>
                    <br></br>
                    <button onClick={() => generate("Easy", 10)}>Easy (10 numbers)</button>
                    <br></br>
                    <button onClick={() => generate("Medium", 15)}>Medium (15 numbers)</button>
                    <br></br>
                    <button onClick={() => generate("Hard", 20)}>Hard (20 numbers)</button>
                    <br></br>
                    <button onClick={() => generate("Challenger", 25)}>Challenger (25 numbers)</button>
                </div>
            </div>
            
        </>
    )
}

export default LinkNumbersPrintable;