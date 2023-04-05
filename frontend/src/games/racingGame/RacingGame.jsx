import React, {createRef} from 'react';
import Matter from 'matter-js';
import Wheel from './wheel.svg';

const wheelOptions = {
    mass: 5,
    render:
    {
        lineWidth: 0,
        sprite:
        {
            texture: Wheel,
            xScale: 0.35,
            yScale: 0.35
        }
    }
};

const bodyOptions = {
    mass: 5,
    render:
    {
        lineWidth: 0,
        fillStyle: "coral"
    }
};

class RacingGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        // this.topGround = Matter.Bodies.rectangle(400, 610, 5000, 60,
        // {
        //     isStatic: true,
        //     render:
        //     {
        //         fillStyle: "darkseagreen",
        //         lineWidth: 0
        //     }
        // });

        this.ground = Matter.Bodies.rectangle(400, 1890, 5000, 500,
        {
            isStatic: true,
            render:
            {
                fillStyle: "moccasin",
                lineWidth: 0
            }
        });

        this.wheel1 = Matter.Bodies.circle(0, 250, 25, wheelOptions);
        this.wheel2 = Matter.Bodies.circle(150, 250, 25, wheelOptions);

        this.body = Matter.Bodies.rectangle(75, 200, 250, 40, bodyOptions);
        this.wheel1Constraint = Matter.Constraint.create({
            bodyA: this.body,
            bodyB: this.wheel1,
            pointA: {x: -75, y: 0},
            stiffness: 1,
            damping: 1,
            render:
            {
                strokeStyle: "gray"
            }
        });

        this.wheel2Constraint = Matter.Constraint.create({
            bodyA: this.body,
            bodyB: this.wheel2,
            pointA: {x: 75, y: 0},
            stiffness: 1,
            damping: 1,
            render:
            {
                strokeStyle: "gray"
            }
        });

        this.boxA = Matter.Bodies.rectangle(300, 0, 80, 80);
        this.boxB = Matter.Bodies.rectangle(-300, 0, 80, 80);

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

        let groundVertices = [];

        for(let i = -50; i < 50; i++)
        {
            //Math.floor(Math.random * 8) + 1
            groundVertices.push({x: i * 5, y: 500});
        }

        console.log(groundVertices);

        this.topGround = Matter.Bodies.fromVertices(0, 0, groundVertices, {
            isStatic: true,
            render:
            {
                fillStyle: "darkseagreen",
                lineWidth: 5
            }
        });

        Matter.Composite.add(this.engine.world,
            [
                this.topGround,
                this.ground,
                this.wheel1,
                this.wheel1Constraint,
                this.wheel2,
                this.wheel2Constraint,
                this.body,
                this.boxA,
                this.boxB
            ]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        this.loaded = true;
        setInterval(this.look, 1, this);
        
        document.addEventListener("keypress", this.keyUp);
    };

    keyUp = (e) =>
    {
        if(e.key == "a")
            this.move(-1);
        else if(e.key == "d")
            this.move(1);
    }

    look = () =>
    {
        Matter.Render.lookAt(this.renderer, this.wheel1, {x: 500, y:500});
    }

    move = (direction) =>
    {
        Matter.Body.setVelocity(this.wheel1, Matter.Vector.create(5 * direction, 0));
        Matter.Body.setVelocity(this.wheel2, Matter.Vector.create(5 * direction, 0));
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

export default RacingGame;