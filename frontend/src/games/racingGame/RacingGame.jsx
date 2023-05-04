import React, {createRef} from 'react';
import '../../../src/styles/GamePage.css';
import '../../../src/styles/RacingGame.css';
import Matter from 'matter-js';
import Wheel from './assets/wheels/wheel.svg';
import RoadWheel from './assets/wheels/road_wheel.svg';
import MudWheel from './assets/wheels/mud_wheel.svg';
import SandWheel from './assets/wheels/sand_wheel.svg';
import SnowWheel from './assets/wheels/snow_wheel.svg';
import WetWheel from './assets/wheels/wet_wheel.svg';
import BikeBodyRed from './assets/bike_bodies/bike_body_red.svg';
import BikeBodyRedFlipped from './assets/bike_bodies/bike_body_red_flipped.svg';
import BikeBodyGreen from './assets/bike_bodies/bike_body_green.svg';
import BikeBodyGreenFlipped from './assets/bike_bodies/bike_body_green_flipped.svg';
import BikeBodyBlue from './assets/bike_bodies/bike_body_blue.svg'; 
import BikeBodyBlueFlipped from './assets/bike_bodies/bike_body_blue_flipped.svg'; 
import ProgressBar from '../../components/ProgressBar';
import Cactus from './assets/cactus.svg';
import TrumpetCoin from './assets/trumpet_coin.svg';
import GasStation from './assets/gas_station.svg';
import WheelShop from './assets/wheel_shop.svg';
import BodyShop from './assets/body_shop.svg';
import Garage from './assets/garage.svg';
import UpgradeIcon from './assets/upgrade_icon.svg';
import EngineIcon from './assets/engine_icon.svg';
import SuspensionIcon from './assets/suspension_icon.svg';
import GasIcon from './assets/gas_icon.svg';
import RaceIcon from './assets/race_icon.svg';
import LeftArrow from './assets/left_arrow.svg';
import RaceChecker from './assets/race_checker.svg';
import RaceStartIcon from './assets/race_start_icon.svg';
import RaceMarkerIcon from './assets/race_marker_icon.svg';

const BikeWheels = [Wheel, RoadWheel, MudWheel, SandWheel, SnowWheel, WetWheel];
const BikeBodies = [BikeBodyRed, BikeBodyGreen, BikeBodyBlue];
const BikeBodiesFlipped = [BikeBodyRedFlipped, BikeBodyGreenFlipped, BikeBodyBlueFlipped];

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
    stiffness: 0.1,
    damping: 0.2,
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
            texture: BikeBodyRed
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
const bodyShopPostion = {x: -5600, y: 0};

const maxUpgradeLevel = 16;

const bikeWheelCosts = [0, 500, 650, 850, 1000, 1400];
const bikeBodyCosts = [0, 400, 600];

class RacingGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.scene = "Home";

        this.state = {
            coins: 500 + 9500,
            countdown: 3,
            countdownID: "",
            currentRaceLength: 10000,
            carGas: 100,
            carGasColor: "limegreen",
            items: {wheels: [0], bodies: [0]},
            upgrades: [0, 0, 0, 0],
            currentUI: 0,
            currentUIData: [""],
            bikeBodyIndex: 0,
            bikeWheelsIndex: 0
        };

        this.body = {position: {x: 0}};

        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    unloadScene(scene)
    {
        if(scene == "Home")
        {
            Matter.Composite.remove(this.engine.world, [
                this.homeGround,
                this.homeGroundLeftHill,
                this.homeGarage,
                this.homeGroundHill,
                this.homeHillGround,
                this.homeRightBorderWall,
                this.gasStation,
                this.wheelShop,
                this.bodyShop
            ]);
            Matter.Composite.remove(this.engine.world, this.cactuses);
        }
        else if(scene == "Game")
        {
            Matter.Composite.remove(this.engine.world, [this.ground, this.topGround]);
        }
    }

    loadScene(scene)
    {
        this.setCurrentUI(0); //close any opened UI

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

            let homeGroundLeftHillVertices = [{x: -4000, y: 500}, {x: -4200, y: -150}, {x: -4400, y: -200}, {x: -4700, y: -80}, {x: -4900, y: 500}];

            this.homeGroundLeftHill = Matter.Bodies.fromVertices(-4000, 0, homeGroundLeftHillVertices,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "gainsboro",
                    strokeStyle: "gainsboro",
                    lineWidth: 3
                }
            });

            this.homeRightBorderWall = Matter.Bodies.rectangle(9000, 0, 20, 2000, {isStatic: true, render: {fillStyle: "gainsboro"}});

            //Matter.Bodies.fromVertices(150, -5, [{x: -210, y: -15}, {x: 150, y: -100}, {x: 500, y: -15}], {isStatic: true, render: {fillStyle: "gainsboro"}});

            // this.homeGarageLeftWall = Matter.Bodies.rectangle(garagePosition.x - 350, 135, 20, 280,
            // {
            //     isStatic: true,
            //     render: {fillStyle: "#dcdcdcd3"},
            //     collisionFilter: {group: -1, mask: 0}
            // });
            // this.homeGarageRightWall = Matter.Bodies.rectangle(garagePosition.x + 350, 135, 20, 280,
            // {
            //     isStatic: true,
            //     render: {fillStyle: "#dcdcdcd3"},
            //     collisionFilter: {group: -1, mask: 0}
            // });
            // this.homeGarageRoof = Matter.Bodies.rectangle(garagePosition.x, garagePosition.y + 5, 700, 20,
            // {
            //     isStatic: true,
            //     render: {fillStyle: "#dcdcdc"}
            // });
            // this.homeGarageTopRoof = Matter.Bodies.fromVertices(garagePosition.x, garagePosition.y - 35,
            // [{x: garagePosition.x -350, y: garagePosition.y}, {x: garagePosition.x, y: garagePosition.y -100}, {x: garagePosition.x + 350, y: garagePosition.y}],
            // {
            //     isStatic: true,
            //     render: {fillStyle: "#dcdcdc"}
            // });
            // this.homeGarageBackground = Matter.Bodies.rectangle(garagePosition.x, garagePosition.y + 135, 700, 280,
            // {
            //     isStatic: true,
            //     render: {fillStyle: "gray", sprite: {texture: GarageTexture, xScale: 4.6, yScale: 1.86}},
            //     collisionFilter: {group: -1, mask: 0}
            // });

            this.homeGarage = Matter.Bodies.rectangle(garagePosition.x, garagePosition.y + 50, 700, 400,
            {
                isStatic: true,
                render: {sprite: {texture: Garage, xScale: 3, yScale: 3}},
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

            this.bodyShop = Matter.Bodies.rectangle(bodyShopPostion.x, bodyShopPostion.y + 50, 800, 420,
            {
                isStatic: true,
                render: {sprite: {texture: BodyShop, xScale: 3, yScale: 3}},
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
                this.homeGarage,
                this.homeGroundLeftHill,
                this.homeGround,
                this.homeGroundHill,
                this.homeHillGround,
                this.homeRightBorderWall,
                this.gasStation,
                this.wheelShop,
                this.bodyShop,
                center
            ]);
            Matter.Composite.add(this.engine.world, this.cactuses);

            this.addDefaultsToWorld();
        }
        else if(scene == "Game")
        {
            let firstY = 800;
            let raceLength = 10000;

            this.startGround = Matter.Bodies.rectangle(0, firstY, 1000, 1000,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "white",
                    lineWidth: 0
                }
            });

            this.endGround = Matter.Bodies.rectangle(raceLength, firstY + 80, 1000, 1000,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "white",
                    lineWidth: 0
                }
            });

            this.groundStartChecker = Matter.Bodies.rectangle(0, firstY - 450, 1000, 100,
            {
                isStatic: true,
                render:
                {
                    sprite:
                    {
                        texture: RaceChecker,
                        xScale: 3.3333,
                        yScale: 3.3333
                    }
                }
            });

            this.groundEndChecker = Matter.Bodies.rectangle(raceLength, firstY - 370, 1000, 100,
            {
                isStatic: true,
                render:
                {
                    sprite:
                    {
                        texture: RaceChecker,
                        xScale: 3.3333,
                        yScale: 3.3333
                    }
                }
            });

            

            this.gameLeftBorderWall = Matter.Bodies.rectangle(-500 - 25, 0, 50, 3000,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "gainsboro",
                    lineWidth: 0
                }
            });

            this.gameRightBorderWall = Matter.Bodies.rectangle(raceLength + 500 + 25, 0, 50, 3000,
            {
                isStatic: true,
                render:
                {
                    fillStyle: "gainsboro",
                    lineWidth: 0
                }
            });

            let groundVertices = [{x: -200, y: firstY - 100}];
            let isHill = 0;


            for(let i = 1; i < 80; i++)
            {
                if(isHill > 0)
                    isHill -= 1;
                else if(Math.floor(Math.random() * 17) == 0)
                    isHill = 10;

                groundVertices.push({x: i * 125, y: (Math.floor(Math.random() * 60) + (isHill > 0 ? 200 : 0) - ((isHill > 0 && isHill < 4) || (isHill > 8) ? 200 : 0))});
            }

            groundVertices.push({x: raceLength, y: 800});

            groundVertices = Matter.Vertices.chamfer(groundVertices, 25);

            this.topGround = Matter.Bodies.fromVertices(raceLength / 2, 600, groundVertices, {
                isStatic: true,
                render:
                {
                    fillStyle: "white",
                    lineWidth: 1,
                    strokeStyle: "white"
                }
            });

            this.startCountdown(3000, function()
            {
                
            });

            this.setBikePosition({x: 0, y: 0}, false);
            
            Matter.Composite.add(this.engine.world, [
                this.topGround,
                this.startGround,
                this.endGround,
                this.groundStartChecker,
                this.groundEndChecker,
                this.gameLeftBorderWall,
                this.gameRightBorderWall
            ]);
        }
        this.scene = scene;
    }

    startCountdown(time, callback)
    {
        let countdownID = setInterval(() =>
        {
            this.setState({countdown: this.state.countdown - 1});
  
            //callback called at 1 second to not have a wait on 0 seconds
            if(this.state.countdown == 1)
            {
                callback();
                
                //made to show a "start" message at 0 seconds
                setTimeout(() =>
                {
                    clearInterval(countdownID);
                    this.setState({countdownID: ""});
                }, 500);
            }
        }, 1000);

        this.setState({countdownID: countdownID, countdown: time / 1000});
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
        if(this.state.currentUI == 0 && this.state.countdownID == "")
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
            if(this.scene == "Home")
            {
                if(Matter.Collision.collides(this.body, this.homeGarage))
                    this.setCurrentUI(1);
                else if(Matter.Collision.collides(this.body, this.gasStation))
                    this.setCurrentUI(2);
                else if(Matter.Collision.collides(this.body, this.wheelShop))
                    this.setCurrentUI(3);
                else if(Matter.Collision.collides(this.body, this.bodyShop))
                    this.setCurrentUI(4); 
            }
        }
        else if(e.key == "Escape")
        {
            if(this.state.currentUI != 0)
                this.setCurrentUI(0);
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
        let power = 15 + (this.state.upgrades[0] / 1.46);

        if(this.state.carGas <= 0)
            power = 3;
        else
            this.setCarGas(this.state.carGas - (0.1 - (this.state.upgrades[3] / 290)));

        this.updateBikeBody(this.state.bikeBodyIndex);

        Matter.Body.setVelocity(this.leftWheel, {x: power * direction, y: 0});
        Matter.Body.setVelocity(this.rightWheel, {x: power * direction, y: 0});
    }

    updateBikeBody()
    {
        if(this.leftWheel.velocity.x < -3)
        this.setBikeFlipped(true);
        else if(this.leftWheel.velocity.x > 3)
            this.setBikeFlipped(false);
    }

    setBikeFlipped(flipped)
    {
        if(flipped)
            this.body.render.sprite.texture = BikeBodiesFlipped[this.state.bikeBodyIndex];
        else
            this.body.render.sprite.texture = BikeBodies[this.state.bikeBodyIndex];
    }

    setBikePosition(pos, flipped = null)
    {
        if(flipped != null)
            this.setBikeFlipped(flipped);

        Matter.Body.setVelocity(this.body, {x: 0, y: 0});
        Matter.Body.setVelocity(this.leftWheel, {x: 0, y: 0});
        Matter.Body.setVelocity(this.rightWheel, {x: 0, y: 0});
            
        Matter.Body.setPosition(this.body, {x: pos.x + 85, y: pos.y + 200});
        Matter.Body.setPosition(this.leftWheel, {x: pos.x, y: pos.y + 250});
        Matter.Body.setPosition(this.rightWheel, {x: pos.x + 165, y: pos.y + 250});
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
        if(this.state.coins >= bikeWheelCosts[index])
        {
            this.setState({coins: this.state.coins - bikeWheelCosts[index]});
            this.setState({items: {wheels: this.state.items.wheels.concat([index]), bodies: this.state.items.bodies}});
        }
    }

    bodyShopBuy = (index) =>
    {
        if(this.state.coins >= bikeBodyCosts[index])
        {
            this.setState({coins: this.state.coins - bikeBodyCosts[index]});
            this.setState({items: {wheels: this.state.items.wheels, bodies: this.state.items.bodies.concat([index])}});
        }
    }

    setCurrentUI(index)
    {
        this.setState({currentUI: index, currentUIData: [""]});
    }

    setBikeBody(index)
    {
        this.setState({bikeBodyIndex: index});

        this.body.render.sprite.texture = BikeBodies[index];
        this.updateBikeBody();
    }

    upgradeBike(index)
    {
        let newUpgrades = this.state.upgrades;

        if(this.state.upgrades[index] < 16)
        {
            newUpgrades[index]++;
            this.setState({upgrades: newUpgrades});

            if(index == 1)
            {
                let newStiffness = wheelConstraintOptions.stiffness + (this.state.upgrades[index] / (maxUpgradeLevel * 2));

                this.leftWheelConstraint1.stiffness = newStiffness;
                this.leftWheelConstraint2.stiffness = newStiffness;
                this.rightWheelConstraint1.stiffness = newStiffness;
                this.rightWheelConstraint2.stiffness = newStiffness;
            }
        }
    }

    setBikeWheels(index)
    {
        this.setState({bikeWheelsIndex: index});

        this.leftWheel.render.sprite.texture = BikeWheels[index];
        this.rightWheel.render.sprite.texture = BikeWheels[index];
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
                        <button className="game_pause_button action_button_resizable pause_button"></button>

                        <div className="game_ui_countdown">
                            <p hidden={this.state.countdownID == ""}>{this.state.countdown > 0 ? this.state.countdown : "Go!"}</p>
                        </div>

                        <div hidden={this.scene != "Game"} className="game_ui_race_map">
                            <img srcSet={RaceStartIcon} className="game_ui_race_map_icon game_ui_race_map_start"></img>
                            <img srcSet={RaceMarkerIcon} className="game_ui_race_map_icon" style={{left: (this.body.position.x / this.state.currentRaceLength) * 100 + "%"}}></img>
                            <img srcSet={RaceIcon} className="game_ui_race_map_icon game_ui_race_map_finish"></img>
                        </div>
                        
                        {/* <p className="game_press_to_interact">Press [F] to interact</p> */}
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 1}>
                            <h1>{this.state.currentUIData[0] == "" ? "Garage" : this.state.currentUIData[0]}</h1>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
                            <button hidden={this.state.currentUIData[0] == ""} className="game_form_ui_back" style={{backgroundImage: `url(${LeftArrow})`}} onClick={() => this.setState({currentUIData: [""]})}></button>
                            <div hidden={this.state.currentUIData[0] !== ""}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.setState({currentUIData: ["Upgrades"]})} className="game_garage_ui_section">
                                        <img srcSet={UpgradeIcon}></img>
                                        <h2>Upgrades</h2>
                                    </button>
                                    <button onClick={() => this.setState({currentUIData: ["Body"]})} className="game_garage_ui_section">
                                        <img srcSet={BikeBodyRed}></img>
                                        <h2>Body</h2>
                                    </button>
                                    <button onClick={() => this.setState({currentUIData: ["Wheels"]})} className="game_garage_ui_section">
                                        <img srcSet={Wheel}></img>
                                        <h2>Wheels</h2>
                                    </button>
                                    <button onClick={() => this.loadScene("Game")} className="game_garage_ui_section">
                                        <img srcSet={RaceIcon}></img>
                                        <h2>Start Race</h2>
                                    </button>
                                </div>
                            </div>

                            <div hidden={this.state.currentUIData[0] !== "Upgrades"}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.upgradeBike(0)} className="game_garage_ui_section">
                                        <img srcSet={EngineIcon}></img>
                                        <p>{this.state.upgrades[0] < maxUpgradeLevel ? this.state.upgrades[0] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Engine</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(1)} className="game_garage_ui_section">
                                        <img srcSet={SuspensionIcon}></img>
                                        <p>{this.state.upgrades[1] < maxUpgradeLevel ? this.state.upgrades[1] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Suspension</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(2)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[2]}></img>
                                        <p>{this.state.upgrades[2] < maxUpgradeLevel ? this.state.upgrades[2] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Traction</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(3)} className="game_garage_ui_section">
                                        <img srcSet={GasIcon}></img>
                                        <p>{this.state.upgrades[3] < maxUpgradeLevel ? this.state.upgrades[3] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Gas Efficiency</h2>
                                    </button>
                                </div>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== "Body"}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.setBikeBody(0)} className="game_garage_ui_section">
                                        <img srcSet={BikeBodies[0]}></img>
                                        <h2>Red</h2>
                                    </button>
                                    <button hidden={!this.state.items.bodies.includes(1)} onClick={() => this.setBikeBody(1)} className="game_garage_ui_section">
                                        <img srcSet={BikeBodies[1]}></img>
                                        <h2>Green</h2>
                                    </button>
                                    <button hidden={!this.state.items.bodies.includes(2)} onClick={() => this.setBikeBody(2)} className="game_garage_ui_section">
                                        <img srcSet={BikeBodies[2]}></img>
                                        <h2>Blue</h2>
                                    </button>
                                </div>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== "Wheels"}>
                                <div className="game_form_ui_sections center_align">
                                    <button className="game_garage_ui_section" onClick={() => this.setBikeWheels(0)}>
                                        <img srcSet={BikeWheels[0]}></img>
                                        <h2>Default Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(1)} onClick={() => this.setBikeWheels(1)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[1]}></img>
                                        <h2>Road Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(2)} onClick={() => this.setBikeWheels(2)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[2]}></img>
                                        <h2>Mud Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(3)} onClick={() => this.setBikeWheels(3)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[3]}></img>
                                        <h2>Sand Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(4)} onClick={() => this.setBikeWheels(4)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[4]}></img>
                                        <h2>Snow Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(5)} onClick={() => this.setBikeWheels(5)} className="game_garage_ui_section">
                                        <img srcSet={BikeWheels[5]}></img>
                                        <h2>Wet Wheels</h2>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 2}>
                            <h1>Biker's Gas</h1>
                            <h4>Any extra fuel will not be added to your vehicle</h4>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
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
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 3}>
                            <h1>Wheelie Wheels</h1>
                            <h4>Apply wheels that fit your terrain needs</h4>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
                            <div className="game_form_ui_sections center_align">
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Road Wheels</h3>
                                    <img alt="Tough Wheels" className="center_align" srcSet={BikeWheels[1]}></img>
                                    <p>+20% speed on roads</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(1)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 1)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeWheelCosts[1]}</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Mud Wheels</h3>
                                    <img alt="Grippy Wheels" className="center_align" srcSet={BikeWheels[2]}></img>
                                    <p>+60% speed on wet terrain</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(2)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 2)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeWheelCosts[2]}</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Sand Wheels</h3>
                                    <img alt="Hill Wheels" className="center_align" srcSet={BikeWheels[3]}></img>
                                    <p>+60% speed in the desert</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(3)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 3)}>
                                            <img srcSet={TrumpetCoin}></img>
                                            <p>{bikeWheelCosts[3]}</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Snow Wheels</h3>
                                    <img alt="Snow Wheels" className="center_align" srcSet={BikeWheels[4]}></img>
                                    <p>+60% speed on snow and ice</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(4)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 4)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeWheelCosts[4]}</p> 
                                        </button>
                                    </div>
                                </div>
                                <div className="game_wheel_shop_ui_section">
                                    <h3>Wet Wheels</h3>
                                    <img alt="Mountain Wheels" className="center_align" srcSet={BikeWheels[5]}></img>
                                    <p>+75% speed in water</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.wheels.includes(5)}>
                                        <button onClick={this.wheelShopBuy.bind(this, 5)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeWheelCosts[5]}</p> 
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="game_form_ui_div" hidden={this.state.currentUI != 4}>
                            <h1>Bob's Bodies</h1>
                            <h4>Fresh bike bodies!</h4>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
                            <div className="game_form_ui_sections center_align">
                                <div className="game_body_shop_ui_section">
                                    <h2>Green Body</h2>
                                    <img alt="Green Body" className="center_align" srcSet={BikeBodies[1]}></img>
                                    <p>Default body in green</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.bodies.includes(1)}>
                                        <button onClick={this.bodyShopBuy.bind(this, 1)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeBodyCosts[1]}</p>
                                        </button>
                                    </div>
                                </div>
                                <div className="game_body_shop_ui_section">
                                    <h2>Blue Body</h2>
                                    <img alt="Blue Body" className="center_align" srcSet={BikeBodies[2]}></img>
                                    <p>Default body in blue</p>
                                    <div className="game_ui_buy_button_div" hidden={this.state.items.bodies.includes(2)}>
                                        <button onClick={this.bodyShopBuy.bind(this, 2)}>
                                            <img alt="coin" srcSet={TrumpetCoin}></img>
                                            <p>{bikeBodyCosts[2]}</p>
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