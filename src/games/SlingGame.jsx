import React, {useState, useRef, createRef, useEffect} from 'react';
import {sendPOST} from '../tools';
import Matter, { MouseConstraint } from 'matter-js';
import GamePage from '../pages/GamePage';

const crateAmountX = 10;
const crateAmountY = 20;

const crateSize = 20;
const crateOptions = {render: {fillStyle: "chocolate", strokeStyle: "black", lineWidth: 5}};

const wallOptions = {
    isStatic: true,
    render:
    {
        fillStyle: "burlywood",
        lineWidth: 0
    }
};

class SlingGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.ballScale = 40;

        this.crates = new Array(crateAmountX * crateAmountY);

        let i = 0;
        let xOffset = 450;
        
        for(let x = 0; x < crateAmountX; x++)
        {
            for(let y = 0; y < crateAmountY; y++)
            {
                this.crates[i] = Matter.Bodies.rectangle((x * crateSize) + xOffset, (y * crateSize), crateSize, crateSize, crateOptions);
                //Matter.Body.setDensity(this.crates[i], 1000);
                //this.crates[i].restitution = 0;
                i++;
            }
        }

        this.ball = null;
        this.ballConstraint = null;
        this.ground = null;
        this.walls = new Array(3);
        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    load()
    {
        this.engine = Matter.Engine.create();
        this.renderer = Matter.Render.create({
            element: this.mainRef.current,
            engine: this.engine,
            options:
            {
                background: "aliceblue",
                wireframes: false
            }
        });

        this.ball = Matter.Bodies.circle(this.renderer.options.width / 2, 100, this.ballScale,
        {
            render: {fillStyle: "slategray", strokeStyle: "dimgray", lineWidth: 10},
            collisionFilter: {category: 2},
            density: 0.5,
            frictionAir: 0.0002
        });

        this.mouse = Matter.Mouse.create(this.renderer.canvas);
        
        let pointA = Matter.Vector.create(this.renderer.options.width / 2, 100);

        let pointACircle = Matter.Bodies.circle(pointA.x, pointA.y, 8, {isStatic: true, render: {fillStyle: "lightstealblue"}});

        this.ballConstraint = Matter.Constraint.create(
        {
            pointA: pointA,
            bodyB: this.ball,
            render:
            {
                strokeStyle: "gainsboro",
                lineWidth: 5
            },
            length: 400
        });
        this.mouseContraint = Matter.MouseConstraint.create(this.engine, {mouse: this.mouse, constraint: {stiffness: 0.1, render: {visible: false}}}); //collisionFilter: {mask: 2},
        this.renderer.mouse = this.mouse;

        this.ground = Matter.Bodies.rectangle(this.renderer.options.width / 2, this.renderer.options.height, 810, 60,
        {
            isStatic: true,
            render:
            {
                fillStyle: "burlywood",
                lineWidth: 0
            }
        });

        this.walls[0] = Matter.Bodies.rectangle(0, this.renderer.options.height / 2, 60, this.renderer.options.height, wallOptions);
        this.walls[1] = Matter.Bodies.rectangle(this.renderer.options.width / 2, 0, this.renderer.options.width, 60, wallOptions);
        this.walls[2] = Matter.Bodies.rectangle(this.renderer.options.width, this.renderer.options.height / 2, 60, this.renderer.options.width, wallOptions);

        Matter.Composite.add(this.engine.world, this.walls);
        Matter.Composite.add(this.engine.world, this.crates);
        Matter.Composite.add(this.engine.world, [this.ground, this.ball, this.ballConstraint, pointACircle, this.mouseContraint]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        this.loaded = true;
    };

    componentDidUpdate()
    {
        if(!this.loaded)
            this.load();
    };

    render()
    {
        return (
            <>
                <GamePage></GamePage>
                <div ref={this.mainRef}></div>
            </>
        );
    };
}

export default SlingGame;