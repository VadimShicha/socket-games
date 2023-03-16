//page made for test purpose
import React, {useState} from 'react';
import {sendPOST} from '../tools'
import NavBar from '../components/NavBar';

function ColorPalettePage(props)
{
    const size = "50px";

    return (
        <>
            <NavBar page={-1}></NavBar>
            <div className="nav_bar_body">
                <h2>Color Palette:</h2>
                <div className="center_align" style={{width: "fit-content"}}>
                    {/* <div style={{float: "left", width: size, height: size, backgroundColor: "var(--primary-light-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--primary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--primary-secondary-mix-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--secondary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--secondary-light-color)"}}></div> */}

                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--light-primary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--primary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--dark-primary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--dark-secondary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--secondary-color)"}}></div>
                    <div style={{float: "left", width: size, height: size, backgroundColor: "var(--light-secondary-color)"}}></div>
                </div>
            </div>
        </>
    )
}

export default ColorPalettePage;