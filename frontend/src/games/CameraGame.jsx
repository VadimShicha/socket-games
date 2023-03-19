import React, {createRef} from 'react';
import Matter from 'matter-js';

class CameraGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.ground = Matter.Bodies.rectangle(400, 610, 5000, 60,
        {
            isStatic: true,
            render:
            {
                fillStyle: "burlywood",
                lineWidth: 0
            }
        });

        this.roof = Matter.Bodies.rectangle(400, 0, 5000, 60,
        {
            isStatic: true,
            render:
            {
                fillStyle: "burlywood",
                lineWidth: 0
            }
        });

        this.player = Matter.Bodies.circle(100, 250, 20,
        {
            mass: 5,
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

        Matter.Composite.add(this.engine.world, [this.player, this.ground, this.roof]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        this.loaded = true;
        
        setInterval(this.look, 1, this);

        document.addEventListener("keyup", this.keyUp);
    };

    keyUp = (e) =>
    {
        if(e.key == "a")
            this.move(-1);
        else if(e.key == "d")
            this.move(1);
        else if(e.key == " ")
            this.move(0);
    }

    look = () =>
    {
        Matter.Render.lookAt(this.renderer, this.player, {x: 500, y:500});
    }

    move = (direction) =>
    {
        let yVelocity = 0;

        if(direction == 0)
            yVelocity = -0.3;

        Matter.Body.applyForce(this.player, this.player.position, Matter.Vector.create(0.1 * direction, yVelocity));
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
            </div>
        );
    };
}

export default CameraGame;