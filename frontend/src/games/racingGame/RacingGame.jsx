import React, {createRef} from 'react';
import '../../../src/styles/GamePage.css';
import '../../../src/styles/RacingGame.css';
import Matter from 'matter-js';
import Wheel from './wheel.svg';
import BikeBody from './bike_body.svg';
import BikeBodyFlipped from './bike_body_flipped.svg';
import GarageTexture from './garage_texture.svg';
import ProgressBar from '../../components/ProgressBar';
import Cactus from './cactus.svg';
import TrumpetCoin from './trumpet_coin.svg';
import GasStation from './gas_station.svg';
import WheelShop from './wheel_shop.svg';

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
        // fillStyle: "transparent",
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
        lineWidth: 0
    }
};

const smallCactusOptions = {render: {sprite: {texture: Cactus, xScale: 0.5, yScale: 0.5}}};
const mediumCactusOptions = {render: {sprite: {texture: Cactus, xScale: 0.75, yScale: 0.75}}};
const bigCactusOptions = {render: {sprite: {texture: Cactus, xScale: 1, yScale: 1}}};

const garagePosition = {x: 0, y: 0};
const gasStationPosition = {x: 5900, y: -795};
const wheelShopPosition = {x: -3000, y: 0};

class RacingGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.scene = "Home";

        this.state = {coins: 500, carGas: 100, carGasColor: "limegreen", items: {wheels: []}, currentUI: 2}; //0 - 100

        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    unloadScene(scene)
    {
        if(scene == "Home")
        {
            Matter.Composite.remove(this.engine.world, [this.homeGround, this.homeGarageRoof, this.homeGarageTopRoof, this.homeGarageBackground]);
            Matter.Composite.remove(this.engine.world, this.cactuses);
        }
        else if(scene == "Game")
        {
            Matter.Composite.remove(this.engine.world, [this.ground, this.topGround]);
        }
    }

    loadScene(scene)
    {
        if(this.scene != scene)
            this.unloadScene(this.scene); //unload the old scene

        if(scene == "Home")
        {
            // let homeGroundVertices = [{x: -0, y: 500}, {x: -0, y: 0}, {x: 30000, y: 0}, {x: 30000, y: 500}];
            // this.homeGround = Matter.Bodies.fromVertices(0, 525, homeGroundVertices,
            // {
            //     isStatic: true,
            //     render:
            //     {
            //         fillStyle: "moccasin",
            //         lineWidth: 0
            //     }
            // });

            this.homeGround = Matter.Bodies.rectangle(0, 525, 20000, 500,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "moccasin",
                    lineWidth: 0
                }
            });

            let homeGrouldHillVertices = [{x: 0, y: 0}, {x: 2000, y: 0}, {x: 2000, y: -800}];

            this.homeGroundHill = Matter.Bodies.fromVertices(4000, 15, homeGrouldHillVertices,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "moccasin",
                    strokeStyle: "moccasin",
                    lineWidth: 3
                }
            });

            this.homeHillGround = Matter.Bodies.rectangle(6165, -120, 3000, 800,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "moccasin",
                    lineWidth: 0
                }
            });

            this.homeRightBorderWall = Matter.Bodies.rectangle(9000, 0, 20, 2000, {isStatic: true, render: {fillStyle: "gainsboro"}});

            //Matter.Bodies.fromVertices(150, -5, [{x: -210, y: -15}, {x: 150, y: -100}, {x: 500, y: -15}], {isStatic: true, render: {fillStyle: "gainsboro"}});

            this.homeGarageLeftWall = Matter.Bodies.rectangle(garagePosition.x - 350, 135, 20, 280,
            {
                isStatic: true,
                render: {fillStyle: "#dcdcdcd3"},
                collisionFilter: {group: -1, mask: 0}
            });
            this.homeGarageRightWall = Matter.Bodies.rectangle(garagePosition.x + 350, 135, 20, 280,
            {
                isStatic: true,
                render: {fillStyle: "#dcdcdcd3"},
                collisionFilter: {group: -1, mask: 0}
            });
            this.homeGarageRoof = Matter.Bodies.rectangle(garagePosition.x, garagePosition.y + 5, 700, 20,
            {
                isStatic: true,
                render: {fillStyle: "#dcdcdc"}
            });
            this.homeGarageTopRoof = Matter.Bodies.fromVertices(garagePosition.x, garagePosition.y - 35,
            [{x: garagePosition.x -350, y: garagePosition.y}, {x: garagePosition.x, y: garagePosition.y -100}, {x: garagePosition.x + 350, y: garagePosition.y}],
            {
                isStatic: true,
                render: {fillStyle: "#dcdcdc"}
            });
            this.homeGarageBackground = Matter.Bodies.rectangle(garagePosition.x, garagePosition.y + 135, 700, 280,
            {
                isStatic: true,
                render: {fillStyle: "gray", sprite: {texture: GarageTexture, xScale: 4.6, yScale: 1.86}},
                collisionFilter: {group: -1, mask: 0}
            });

            this.gasStation = Matter.Bodies.rectangle(gasStationPosition.x, gasStationPosition.y + 50, 800, 420,
            {
                isStatic: true,
                render: {sprite: {texture: GasStation, xScale: 3, yScale: 3}},
                collisionFilter: {group: -1, mask: 0}
            });

            this.wheelShop = Matter.Bodies.rectangle(wheelShopPosition.x, wheelShopPosition.y + 50, 800, 420,
            {
                isStatic: true,
                render: {sprite: {texture: WheelShop, xScale: 3, yScale: 3}},
                collisionFilter: {group: -1, mask: 0}
            });

            this.cactuses = [];
            this.cactuses.push(Matter.Bodies.rectangle(900, 237, 100, 100, {...cactusOptions, ...smallCactusOptions}));
            this.cactuses.push(Matter.Bodies.rectangle(1320, 237, 100, 100, {...cactusOptions, ...smallCactusOptions}));
            this.cactuses.push(Matter.Bodies.rectangle(1840, 237, 100, 100, {...cactusOptions, ...smallCactusOptions}));
            this.cactuses.push(Matter.Bodies.rectangle(2150, 237, 100, 100, {...cactusOptions, ...smallCactusOptions}));
            this.cactuses.push(Matter.Bodies.rectangle(2600, 237, 100, 100, {...cactusOptions, ...smallCactusOptions}));
            this.cactuses.push(Matter.Bodies.rectangle(3010, 103, 100, 100, {...cactusOptions, ...smallCactusOptions, ...{angle: toRadians(-21.8014095)}}));//
            this.cactuses.push(Matter.Bodies.rectangle(3570, -122, 100, 100, {...cactusOptions, ...smallCactusOptions, ...{angle: toRadians(-21.8014095)}}));
            this.cactuses.push(Matter.Bodies.rectangle(4110, -337, 100, 100, {...cactusOptions, ...smallCactusOptions, ...{angle: toRadians(-21.8014095)}}));
            this.cactuses.push(Matter.Bodies.rectangle(4400, -453, 100, 100, {...cactusOptions, ...smallCactusOptions, ...{angle: toRadians(-21.8014095)}}));

            let center = Matter.Bodies.rectangle(0, 0, 10, 10, {isStatic: true, render: {fillStyle: "red"}});

            Matter.Composite.clear(this.engine.world);
            

            Matter.Composite.add(this.engine.world,
            [
                this.homeGarageBackground,
                this.homeGarageLeftWall,
                this.homeGarageRightWall,
                this.homeGround,
                this.homeGroundHill,
                this.homeHillGround,
                this.homeRightBorderWall,
                this.homeGarageRoof,
                this.homeGarageTopRoof,
                this.gasStation,
                this.wheelShop,
                center
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
        this.rightWheel = Matter.Bodies.circle(165, 250, 25, wheelOptions);

        this.body = Matter.Bodies.rectangle(85, 200, 250, 40, bodyOptions);
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
        document.addEventListener("keydown", this.keyDown);
    };

    keyUp = (e) =>
    {
        if(this.state.currentUI == 0)
        {
            if(e.key == "a")
                this.carMove(-1);
            else if(e.key == "d")
                this.carMove(1);
        }
    }

    keyDown = (e) =>
    {
        if(e.key == "f")
        {
            if(Matter.Collision.collides(this.body, this.gasStation))
                this.setState({currentUI: 1});
            else if(Matter.Collision.collides(this.body, this.wheelShop))
                this.setState({currentUI: 2});
        }
        else if(e.key == "Escape")
        {
            if(this.state.currentUI != 0)
                this.setState({currentUI: 0});
        }
    }

    look = () =>
    {
        Matter.Render.lookAt(this.renderer, this.body, {x: 500, y: 500});
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
        let power = 15;

        if(this.state.carGas <= 0)
            power = 3;
        else
            this.setCarGas(this.state.carGas - 0.1);

        if(this.leftWheel.velocity.x < -3)
            this.body.render.sprite.texture = BikeBodyFlipped;
        else if(this.leftWheel.velocity.x > 3)
            this.body.render.sprite.texture = BikeBody;

        Matter.Body.setVelocity(this.leftWheel, {x: power * direction, y: 0});
        Matter.Body.setVelocity(this.rightWheel, {x: power * direction, y: 0});
    }

    gasStationBuy = (index) =>
    {
        if(this.state.carGas == 100)
            return;

        let newGas = 0;

        if(index == 0)
        {
            if(this.state.coins < 60)
                return;

            newGas = this.state.carGas + 25;
            this.setState({coins: this.state.coins - 60});
        }
        else if(index == 1)
        {
            if(this.state.coins < 110)
                return;

            newGas = this.state.carGas + 50;
            this.setState({coins: this.state.coins - 110});
        }
        else if(index == 2)
        {
            if(this.state.coins < 200)
                return;

            newGas = 100;
            this.setState({coins: this.state.coins - 200});
        }

        if(newGas > 100)
            newGas = 100;

        this.setCarGas(newGas);
    }

    wheelShopBuy = (index) =>
    {
        this.setState({items: {wheels: this.state.items.wheels.concat([index])}});
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
                        
                        {/* <p className="game_press_to_interact">Press [F] to interact</p> */}
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 1}>
                            <h1>Biker's Gas</h1>
                            <h4>Any extra fuel will not be added to you vehicle</h4>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setState({currentUI: 0})}></button>
                            <div className="game_form_ui_sections center_align">
                                <div className="game_gas_station_ui_section">
                                    <h2>Add 25%</h2>
                                    <p>Adds 25% percent of your fuel storage to your vehicle</p>
                                    <div className="game_ui_buy_button_div">
                                        <button onClick={this.gasStationBuy.bind(this, 0)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>60</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_gas_station_ui_section">
                                    <h2>Add 50%</h2>
                                    <p>Adds 50% percent of your fuel storage to your vehicle</p>
                                    <div className="game_ui_buy_button_div">
                                        <button onClick={this.gasStationBuy.bind(this, 1)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>110</p>
                                        </button>
                                    </div>
                                </div>
                                <div className="game_gas_station_ui_section">
                                    <h2>Fill Up</h2>
                                    <p>Fills up your vehicle all the way</p>
                                    <div className="game_ui_buy_button_div">
                                        <button onClick={this.gasStationBuy.bind(this, 2)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>200</p>
                                        </button>
                                    </div>
                                </div> 
                            </div>
                        </div>
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 2}>
                            <h1>Wheelie Wheels</h1>
                            <h4>Apply wheels that fit your terrain needs</h4>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setState({currentUI: 0})}></button>
                            <div className="game_form_ui_sections center_align">
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Road Wheels</h3>
                                    <img alt="Tough Wheels" className="center_align" srcSet={Wheel}></img>
                                    <p>+20% speed on roads</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(0)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 0)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>500</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Mud Wheels</h3>
                                    <img alt="Grippy Wheels" className="center_align" srcSet={Wheel}></img>
                                    <p>+60% speed on wet terrain</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(1)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 1)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>650</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Sand Wheels</h3>
                                    <img alt="Hill Wheels" className="center_align" srcSet={Wheel}></img>
                                    <p>+60% speed in the desert</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(2)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 2)}>
                                            <img srcSet={TrumpetCoin}></img>
                                            <p>850</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Snow Wheels</h3>
                                    <img alt="Snow Wheels" className="center_align" srcSet={Wheel}></img>
                                    <p>+60% speed on snow and ice</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(3)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 3)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>1000</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Wet Wheels</h3>
                                    <img alt="Mountain Wheels" className="center_align" srcSet={Wheel}></img>
                                    <p>+75% speed in water</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(4)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 4)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>1400</p> 
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="game_coins_div">
                            <img className="game_coins_image" srcSet={TrumpetCoin}></img>
                            <p className="game_coins_text">{this.state.coins}</p>
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