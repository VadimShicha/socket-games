import React, {createRef} from 'react';
import '../../../src/styles/GamePage.css';
import '../../../src/styles/RacingGame.css';
import Matter from 'matter-js';
import Wheel from './wheel.svg';
import BikeBody from './bike_body.svg';
import GarageTexture from './garage_texture.svg';
import ProgressBar from '../../components/ProgressBar';
import Cactus from './cactus.svg';
import TrumpetCoin from './trumpet_coin.svg';

function toDegrees(radians)
{
    return radians * (180 / Math.PI);
}

function toRadians(degrees)
{
    return degrees * (Math.PI / 180);
}

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

const wheelConstraintOptions = {
    stiffness: 1,
    damping: 1,
    render:
    {
        lineWidth: 0,
        anchors: false,
        strokeStyle: "gray"
    },

};

const bodyOptions = {
    mass: 15,
    render:
    {
        lineWidth: 0,
        fillStyle: "coral",
        sprite:
        {
            texture: BikeBody
        }
    }
};

const cactusOptions = {
    collisionFilter: {group: -1, mask: 0},
    isStatic: true,
    render:
    {
        lineWidth: 0,
        sprite:
        {
            texture: Cactus,
            xScale: 0.5,
            yScale: 0.5
        }
    }
};

class RacingGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.scene = "Home";

        this.state = {carGas: 100, carGasColor: "limegreen"}; //0 - 100

        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    unloadScene(scene)
    {
        if(scene == "Home")
        {
            Matter.Composite.remove(this.engine.world, [this.homeGround, this.homeRightBorderWall, this.homeGarageLeftWall, this.homeGarageRoof, this.homeGarageTopRoof, this.homeGarageBackground]);
            Matter.Composite.remove(this.engine.world, this.cactuses);
        }
        else if(scene == "Game")
        {
            Matter.Composite.remove(this.engine.world, [this.ground, this.topGround]);
            //document.removeEventListener("keypress");
        }
    }

    loadScene(scene)
    {
        if(this.scene != scene)
            this.unloadScene(this.scene); //unload the old scene

        if(scene == "Home")
        {
            this.homeGround = Matter.Bodies.rectangle(0, 525, 5000, 500,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "moccasin",
                    lineWidth: 0
                }
            });

            this.homeRightBorderWall = Matter.Bodies.rectangle(2500, 0, 20, 2000, {isStatic: true, render: {fillStyle: "gainsboro"}});

            //Matter.Bodies.fromVertices(150, -5, [{x: -210, y: -15}, {x: 150, y: -100}, {x: 500, y: -15}], {isStatic: true, render: {fillStyle: "gainsboro"}});

            this.homeGarageLeftWall = Matter.Bodies.rectangle(-200, 135, 20, 280, {isStatic: true, render: {fillStyle: "gainsboro"}});
            this.homeGarageRoof = Matter.Bodies.rectangle(150, 5, 700, 20, {isStatic: true, render: {fillStyle: "gainsboro"}});
            this.homeGarageTopRoof = Matter.Bodies.fromVertices(150, -35, [{x: -210, y: 0}, {x: 150, y: -100}, {x: 500, y: 0}], {isStatic: true, render: {fillStyle: "gainsboro"}});
            this.homeGarageBackground = Matter.Bodies.rectangle(150, 135, 700, 280,
            {
                isStatic: true,
                render: {fillStyle: "gray", sprite: {texture: GarageTexture, xScale: 4.6, yScale: 1.86}},
                collisionFilter: {group: -1, mask: 0}
            });

            this.cactuses = [];
            this.cactuses.push(Matter.Bodies.rectangle(900, 237, 100, 100, cactusOptions));
            this.cactuses.push(Matter.Bodies.rectangle(1320, 237, 100, 100, cactusOptions));
            this.cactuses.push(Matter.Bodies.rectangle(1840, 237, 100, 100, cactusOptions));
            this.cactuses.push(Matter.Bodies.rectangle(2150, 237, 100, 100, cactusOptions));

            Matter.Composite.clear(this.engine.world);
            

            Matter.Composite.add(this.engine.world,
            [
                this.homeGarageBackground,
                this.homeGround,
                this.homeRightBorderWall,
                this.homeGarageLeftWall,
                this.homeGarageRoof,
                this.homeGarageTopRoof,
            ]);
            Matter.Composite.add(this.engine.world, this.cactuses);

            this.addDefaultsToWorld();
        }
        else if(scene == "Game")
        {
            this.ground = Matter.Bodies.rectangle(400, 1890, 5000, 500,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "moccasin",
                    lineWidth: 0
                }
            });

            let groundVertices = [{x: 0, y: 800}];
            let isHill = 0;

            for(let i = 0; i < 80; i++)
            {
                if(isHill > 0)
                    isHill -= 1;
                else if(Math.floor(Math.random() * 17) == 0)
                    isHill = 10;

                groundVertices.push({x: i * 125, y: (Math.floor(Math.random() * 80) + (isHill > 0 ? 200 : 0) - (isHill > 0 && isHill < 4 ? 400 : 0))});
            }

            groundVertices.push({x: 10000, y: 800});

            groundVertices = Matter.Vertices.chamfer(groundVertices, 25);

            this.topGround = Matter.Bodies.fromVertices(0, 600, groundVertices, {
                isStatic: true,
                render:
                {
                    fillStyle: "white",
                    lineWidth: 1,
                    strokeStyle: "white"
                }
            });

            Matter.Composite.add(this.engine.world, [this.ground, this.topGround]);
        }
        this.scene = scene;
    }

    addDefaultsToWorld()
    {
        Matter.Composite.add(this.engine.world,
        [
            this.body,
            this.leftWheel,
            this.leftWheelConstraint1,
            this.leftWheelConstraint2,
            this.rightWheel,
            this.rightWheelConstraint1,
            this.rightWheelConstraint2
        ]);
    }

    load()
    {
        Matter.Common.setDecomp(require("poly-decomp"));

        this.engine = Matter.Engine.create();
        this.renderer = Matter.Render.create({
            element: this.mainRef.current,
            engine: this.engine,
            options:
            {
                background: "lightskyblue", //aliceblue
                wireframes: false,
                width: 800 * ((window.innerHeight - 50) / 600),
                height: 600 * ((window.innerHeight - 50) / 600)
            }
        });

        this.leftWheel = Matter.Bodies.circle(0, 250, 25, wheelOptions);
        this.rightWheel = Matter.Bodies.circle(150, 250, 25, wheelOptions);

        this.body = Matter.Bodies.rectangle(75, 200, 250, 40, bodyOptions);
        this.leftWheelConstraint1 = Matter.Constraint.create(Object.assign({
            bodyA: this.body,
            bodyB: this.leftWheel,
            pointA: {x: -60, y: 0}
        }, wheelConstraintOptions));

        this.leftWheelConstraint2 = Matter.Constraint.create(Object.assign({
            bodyA: this.body,
            bodyB: this.leftWheel,
            pointA: {x: -90, y: 0}
        }, wheelConstraintOptions));

        this.rightWheelConstraint1 = Matter.Constraint.create(Object.assign({
            bodyA: this.body,
            bodyB: this.rightWheel,
            pointA: {x: 60, y: 0}
        }, wheelConstraintOptions));

        this.rightWheelConstraint2 = Matter.Constraint.create(Object.assign({
            bodyA: this.body,
            bodyB: this.rightWheel,
            pointA: {x: 90, y: 0}
        }, wheelConstraintOptions));

        this.addDefaultsToWorld();
        this.loadScene("Home");

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
            this.carMove(-1);
        else if(e.key == "d")
            this.carMove(1);
        else if(e.key == "e")
            this.carBrake();
    }

    look = () =>
    {
        Matter.Render.lookAt(this.renderer, this.body, {x: 500, y:500});
    }

    setCarGas(gas)
    {
        this.setState({carGas: gas});

        if(gas <= 30)
            this.setState({carGasColor: "red"});
        else if(gas <= 50)
            this.setState({carGasColor: "greenyellow"});
        else
            this.setState({carGasColor: "limegreen"});
    }

    carMove = (direction) =>
    {
        let power = 11;

        if(this.state.carGas <= 0)
            power = 3;
        else
            this.setCarGas(this.state.carGas - 0.1);

        Matter.Body.setVelocity(this.leftWheel, {x: power * direction, y: 0});
        Matter.Body.setVelocity(this.rightWheel, {x: power * direction, y: 0});
    }

    carBrake = () =>
    {
        //Matter.Body.setVelocity(this.body, {x: 10, y: -10});
        //Matter.Body.rotate(this.body, toRadians(toDegrees(this.body.angle) - 10), this.body.position, true);
        //Matter.Body.setVelocity(this.rightWheel, {x: 20, y: -30});
        //Matter.Body.setVelocity(this.body, {x: 0, y: 30});
        // Matter.Body.setVelocity(this.leftWheel, {x: this.leftWheel.position.x / 8, y: 0});
        // Matter.Body.setVelocity(this.rightWheel, {x: this.rightWheel.position.x / 8, y: 0});
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
                <div ref={this.mainRef} className="game_div center_align" style={{width: "fit-content"}}>
                    <div className="game_ui_div">
                        <button className="game_pause_button action_button_resizable pause_button" onClick={() => this.loadScene("Game")}></button>
                        {/* <input className="game_gas_input" type="range" min={0} max={1} step={0.001} value={this.state.carGas}></input> */}
                        
                        <div className="game_coins_div">
                            <img className="game_coins_image" srcSet={TrumpetCoin}></img>
                            <h2 className="game_coins_text">17251827318275</h2>
                        </div>
                        
                        <div className="game_gas_bar">
                            <ProgressBar mainColor={this.state.carGasColor} bgColor="gray" value={this.state.carGas}></ProgressBar> 
                            <p className="game_gas_bar_text" hidden={this.state.carGas > 0}>Empty</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default RacingGame;