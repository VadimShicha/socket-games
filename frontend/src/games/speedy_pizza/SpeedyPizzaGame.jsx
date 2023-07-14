import React, {createRef} from 'react';
import RedCar from './assets/red_car.svg';
import BlueCar from './assets/blue_car.svg';
import Matter from 'matter-js';

const lightLaneOptions = {
    isStatic: true,
    collisionFilter: {group: -1, mask: 0},
    render:
    {
        fillStyle: "#707070",
        lineWidth: 0
    }
};

const darkLaneOptions = {
    isStatic: true,
    collisionFilter: {group: -1, mask: 0},
    render:
    {
        fillStyle: "dimgray",
        lineWidth: 0
    }
};

class SpeedyPizzaGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.pizzaCar = Matter.Bodies.rectangle(400, 500, 80, 130, {isStatic: false, frictionAir: 0, render: {sprite: {texture: RedCar}}});
        this.blueCar = Matter.Bodies.rectangle(200, 0, 80, 130, {isStatic: true, render: {sprite: {texture: BlueCar}}});
        this.blueCar2 = Matter.Bodies.rectangle(400, 0, 80, 130, {isStatic: true, render: {sprite: {texture: BlueCar}}});
        this.blueCar3 = Matter.Bodies.rectangle(500, 0, 80, 130, {isStatic: true, render: {sprite: {texture: BlueCar}}});
        this.blueCar4 = Matter.Bodies.rectangle(600, 0, 80, 130, {isStatic: true, render: {sprite: {texture: BlueCar}}});
        this.road = Matter.Bodies.rectangle(400, 0, 500, 10000,
        {
            isStatic: true,
            collisionFilter: {group: -1, mask: 0},
            render:
            {
                fillStyle: "dimgray",
                lineWidth: 0
            }
        });
        this.roadLane0 = Matter.Bodies.rectangle(200, 0, 100, 10000, lightLaneOptions);
        this.roadLane1 = Matter.Bodies.rectangle(300, 0, 100, 10000, darkLaneOptions);
        this.roadLane2 = Matter.Bodies.rectangle(400, 0, 100, 10000, lightLaneOptions);
        this.roadLane3 = Matter.Bodies.rectangle(500, 0, 100, 10000, darkLaneOptions);
        this.roadLane4 = Matter.Bodies.rectangle(600, 0, 100, 10000, lightLaneOptions);

        this.lane = 0;

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
                background: "dodgerblue",
                wireframes: false
            }
        });

       

        Matter.Events.on(this.engine, 'beforeUpdate', function()
        {
            Matter.Body.setVelocity(this.pizzaCar, {x: 0, y: -8});
            Matter.Render.lookAt(this.renderer, {x: 400, y: this.pizzaCar.position.y - this.renderer.options.height / 2}, {x: 500, y: 500});
        }.bind(this));

        Matter.Composite.add(this.engine.world, [
            this.road,
            this.roadLane0,
            this.roadLane1,
            this.roadLane2,
            this.roadLane3,
            this.roadLane4,
            this.pizzaCar,
            this.blueCar,
            this.blueCar2,
            this.blueCar3,
            this.blueCar4
        ]);
        Matter.Render.run(this.renderer);

        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);
        document.addEventListener("keyup", this.keyUp);

        this.loaded = true;
    };

    move(direction)
    {
        if(this.lane == -2 && direction == -1 || this.lane == 2 && direction == 1)
            return;

        this.lane += direction;
        Matter.Body.setPosition(this.pizzaCar, {x: this.pizzaCar.position.x + (direction * 100), y: this.pizzaCar.position.y})
    }

    keyUp = (e) =>
    {
        if(e.key == "a")
            this.move(-1);
        else if(e.key == "d")
            this.move(1);
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

export default SpeedyPizzaGame;