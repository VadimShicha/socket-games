import React, { createRef, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import "../../styles/LinkNumbersPrintable.css";
import DataManager from '../../dataManager';

function LinkNumbersPrintable(props)
{
    const canvasRef = useRef(null);
    const [reloader, setReloader] = useState(false);

    function generate(numbers)
    {
        let context = canvasRef.current.getContext("2d");
        context.font = "20px Arial";
        context.fillText("Link the Numbers", 100, 50);

        setReloader(!reloader);
        window.print();
    }

    return (
        <>
            <div className="printable">
                <canvas width="1090px" height="840px" ref={canvasRef}></canvas>
            </div>
            <div className="non_printable">
                <NavBar page={-1}></NavBar>
                <div className="nav_bar_body">
                    <h2>Link the Numbers Printable</h2>
                    <p>Select a level to play</p>

                    <button onClick={() => generate(10)}>Easy (10 numbers)</button>
                    <br></br>
                    <button>Medium (15 numbers)</button>
                    <br></br>
                    <button>Hard (20 numbers)</button>
                    
                </div>
            </div>
            
        </>
    )
}

export default LinkNumbersPrintable;