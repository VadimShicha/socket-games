import React, {createRef} from 'react';
import Matter from 'matter-js';

const defaultRender = {fillStyle: "chocolate", strokeStyle: "white", lineWidth: 0};

class FirstMultiGame extends React.Component
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

        this.loaded = true;
    };

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

export default FirstMultiGame;