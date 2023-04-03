import React, {createRef} from 'react';
import Matter from 'matter-js';

const defaultRender = {fillStyle: "chocolate", strokeStyle: "white", lineWidth: 0};

class FirstGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.boxA = Matter.Bodies.rectangle(400, 200, 80, 80, {render: defaultRender});
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
        document.addEventListener("keyup", this.keyUp);

        this.loaded = true;
    };

    componentDidMount()
    {
        if(!this.loaded)
            this.load();
    };

    move(direction)
    {
        let yVelocity = -0.15;

        if(direction == 0)
            yVelocity = -0.3;

        Matter.Body.applyForce(this.boxA, this.boxA.position, Matter.Vector.create(0.1 * direction, yVelocity));
    }

    keyUp = (e) =>
    {
        if(e.key == "a")
            this.move(-1);
        else if(e.key == "d")
            this.move(1);
        else if(e.key == " ")
            this.move(0);
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

export default FirstGame;