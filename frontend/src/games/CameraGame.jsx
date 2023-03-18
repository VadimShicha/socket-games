import React, {createRef} from 'react';
import Matter from 'matter-js';

class CameraGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.ground = Matter.Bodies.rectangle(400, 610, 810, 60,
        {
            isStatic: true,
            render:
            {
                fillStyle: "burlywood",
                lineWidth: 0
            }
        });

        this.player = Matter.Bodies.circle(100, 100, 5,
        {
            render:
            {
                fillStyle: "red",
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

        Matter.Composite.add(this.engine.world, [this.player, this.ground]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        this.loaded = true;
        

        console.log(this.engine);

        setInterval(this.look, 10, this);

        document.addEventListener("keydown", function(e, _this)
        {
            console.log(e);
        });
    };

    look(_this)
    {
        Matter.Render.lookAt(_this.renderer, _this.player, {x: 500, y:500});
    }

    move(_this, direction)
    {
        let yVelocity = -0.15;

        if(direction == 0)
            yVelocity = -0.3;

        Matter.Body.applyForce(_this.player, _this.player.position, Matter.Vector.create(0.1 * direction, yVelocity));
    }

    componentDidMount()
    {
        if(!this.loaded)
            this.load();
    };

    render()
    {
        return (
            <div>
                <div ref={this.mainRef}></div>
                <button onClick={() => this.look(this)}>Look</button>
            </div>
        );
    };
}

export default CameraGame;