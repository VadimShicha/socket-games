import React, {createRef} from 'react';
import Matter from 'matter-js';
import { socket } from '../socket';
import Cookies from 'js-cookie';

const defaultRender = {fillStyle: "chocolate", strokeStyle: "white", lineWidth: 0};

class FirstMultiGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.boxA = Matter.Bodies.rectangle(400, 200, 80, 80, {render: defaultRender}); //isStatic: true,
        this.ground = Matter.Bodies.rectangle(400, 610, 810, 60,
        {
            isStatic: true,
            render:
            {
                fillStyle: "burlywood",
                lineWidth: 0
            }
        });

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

        Matter.Composite.add(this.engine.world, [this.boxA, this.ground]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        this.loaded = true;

        let boxA = this.boxA;

        socket.on("game_tick", (args) =>
        {
            console.log(args);
            Matter.Body.applyForce(boxA, args.boxA);
            //this.boxA = args.boxA;
        });
    };

    componentDidMount()
    {
        if(!this.loaded)
            this.load();
    };

    move(direction)
    {
        // let yVelocity = -0.15;

        // if(direction == 0)
        //     yVelocity = -0.3;

        // Matter.Body.applyForce(this.boxA, this.boxA.position, Matter.Vector.create(0.1 * direction, yVelocity));

        socket.emit("first_game_move", {gameID: Cookies.get("gameID")});
    }

    update()
    {

    }

    render()
    {
        return (
            <div>
                <div ref={this.mainRef}></div>
                <button onClick={() => this.move(-1)}>Left</button>
                <button onClick={() => this.move(0)}>Center</button>
                <button onClick={() => this.move(1)}>Right</button>
            </div>
        );
    };
}

export default FirstMultiGame;