import React, {createRef} from 'react';
import { randFloat, randInt, sendPOST, userLoggedIn } from '../../tools';
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
import RaceMarkerIcon from './assets/race_markers/you_marker.svg';
import BlueMarker from './assets/race_markers/blue_marker.svg';
import GreenMarker from './assets/race_markers/green_marker.svg';
import OrangeMarker from './assets/race_markers/orange_marker.svg';
import RedMarker from './assets/race_markers/red_marker.svg';
import PausedIcon from './assets/paused_icon.svg';
import SaveIcon from './assets/save_icon.svg';

const BikeWheels = [Wheel, RoadWheel, MudWheel, SandWheel, SnowWheel, WetWheel];
const BikeBodies = [BikeBodyRed, BikeBodyGreen, BikeBodyBlue];
const BikeBodiesFlipped = [BikeBodyRedFlipped, BikeBodyGreenFlipped, BikeBodyBlueFlipped];

const RaceMarkers = [BlueMarker, GreenMarker, OrangeMarker, RedMarker];
const RaceBotNames = [
    "Bob", "Joe", "James", "Arnold", "Roger", "Oliver", "Noah",
    "Beck", "Will", "Edward", "Sam", "Chad", "Juan", "Max", "Jake",
    "Felix", "Mike", "Thomas", "Henry", "Liam", "Jason", "Sean",
    "Sally", "Anna", "Emily", "Rose", "Emma", "Jane", "Lillie",
    "Ella", "Susan", "Erin", "Isabel", "Olivia", "Abby", "Debbie",
    "Sandy", "Rose", "Katie", "Myra"
];

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
        this.loggedIn = userLoggedIn();

        this.state = {
            coins: 500 + 9500,
            gamePaused: false,
            raceBots: [{name: "", speed: 0, posX: 0}, {name: "", speed: 0, posX: 0}, {name: "", speed: 0, posX: 0}, {name: "", speed: 0, posX: 0}], //EXAMPLE: {name: "Bob", speed: 5, posX: 0}
            countdown: 3,
            countdownID: "",
            currentRaceLength: 10000,
            bikeGas: 100,
            bikeGasColor: "limegreen",
            items: {wheels: [0], bodies: [0]},
            upgrades: [0, 0, 0, 0],
            currentUI: 0,
            currentUIData: [],
            bikeBodyIndex: 0,
            bikeWheelsIndex: 0,
            saveText: "Save Data",
            autoSaving: false
        };

        this.body = {position: {x: 0}};

        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    saveGame(autoSaving = false)
    {
        let saveData = {
            coins: this.state.coins,
            bikeGas: this.state.bikeGas,
            items: this.state.items,
            upgrades: this.state.upgrades,
            bikeBodyIndex: this.state.bikeBodyIndex,
            bikeWheelsIndex: this.state.bikeWheelsIndex
        };

        if(autoSaving)
            this.setState({autoSaving: true});

        this.setState({saveText: "Saving..."});

        sendPOST({requestID: "save_game_data", gameUrl: "raceride", gameData: saveData}, function(){
            this.setState({saveText: "Save Data"});

            if(this.state.autoSaving)
            {
                setTimeout(function()
                {
                    this.setState({autoSaving: false});
                }.bind(this), 1000);
            }
            
        }.bind(this));
    }

    loadGame()
    {
        sendPOST({requestID: "load_game_data", gameUrl: "raceride"}, function(data)
        {
            console.log(data);
            if(data.success)
            {
                let gameData = data.data

                this.setState({
                    coins: gameData.coins,
                    items: gameData.items,
                    upgrades: gameData.upgrades
                });

                this.setBikeGas(gameData.bikeGas);
                this.setBikeBody(gameData.bikeBodyIndex);
                this.setBikeWheels(gameData.bikeWheelsIndex)
            }
            else
                this.setCurrentUI(1);
        }.bind(this));
    }

    unloadScene(scene)
    {
        if(scene === "Home")
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
        else if(scene === "Game")
        {
            Matter.Composite.remove(this.engine.world, [this.topGround]);
        }
    }

    loadScene(scene)
    {
        this.setCurrentUI(0); //close any opened UI

        if(this.scene !== scene)
            this.unloadScene(this.scene); //unload the old scene

        if(scene === "Home")
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
                this.bodyShop
            ]);
            Matter.Composite.add(this.engine.world, this.cactuses);

            this.addDefaultsToWorld();
        }
        else if(scene === "Game")
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
                else if(Math.floor(Math.random() * 17) === 0)
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
                let bots = [];

                for(let i = 0; i < 4; i++)
                {
                    let name = RaceBotNames[Math.floor(Math.random() * RaceBotNames.length)];

                    bots.push({name: name, speed: randFloat(this.getBikeSpeed() - 4, this.getBikeSpeed() + 2), posX: 0});
                }

                setInterval(function()
                {
                    let bots = this.state.raceBots;

                    for(let i = 0; i < bots.length; i++)
                    {
                        if(randInt(0, 1000) === 0)
                            bots[i].speed -= 1;
                        
                        bots[i].posX += bots[i].speed;
                    }

                    this.setState({raceBots: bots});
                }.bind(this), 20);

                this.setState({raceBots: bots});
            }.bind(this));

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
            if(this.state.countdown === 1)
            {
                //made to show a "start" message at 0 seconds
                setTimeout(() =>
                {
                    clearInterval(countdownID);
                    this.setState({countdownID: ""});
                    callback();
                }, 500, callback);
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

        if(this.loggedIn)
            this.loadGame();
        else
            this.setCurrentUI(1);

        //start auto-save clock
        setInterval(function()
        {
            this.saveGame(true);
            console.log("Auto-Saving...");
        }.bind(this), 60000);

        document.addEventListener("keypress", this.keyUp);
        document.addEventListener("keydown", this.keyDown);
    };

    keyUp = (e) =>
    {
        if(this.state.currentUI === 0 && this.state.countdownID === "" && !this.state.gamePaused)
        {
            if(e.key === "a")
                this.bikeMove(-1);
            else if(e.key === "d")
                this.bikeMove(1);
        }
    }

    keyDown = (e) =>
    {
        if(e.key === "f")
        {
            if(this.scene === "Home" && !this.state.gamePaused && this.state.currentUI === 0)
            {
                if(Matter.Collision.collides(this.body, this.homeGarage))
                    this.setCurrentUI(2);
                else if(Matter.Collision.collides(this.body, this.gasStation))
                    this.setCurrentUI(4);
                else if(Matter.Collision.collides(this.body, this.wheelShop))
                    this.setCurrentUI(5);
                else if(Matter.Collision.collides(this.body, this.bodyShop))
                    this.setCurrentUI(6); 
            }
        }
        else if(e.key === "Escape")
        {
            if(this.state.currentUI !== 0)
                this.setCurrentUI(0);
        }
    }

    look = () =>
    {
        Matter.Render.lookAt(this.renderer, this.body, {x: 500, y: 500});
    }

    setBikeGas(gas)
    {
        this.setState({bikeGas: gas});

        if(gas <= 30)
            this.setState({bikeGasColor: "red"});
        else if(gas <= 50)
            this.setState({bikeGasColor: "greenyellow"});
        else
            this.setState({bikeGasColor: "limegreen"});
    }

    getBikeSpeed()
    {
        return 15 + (this.state.upgrades[0] / 1.46);
    }

    bikeMove = (direction) =>
    {
        let power = this.getBikeSpeed();

        if(this.state.bikeGas <= 0)
            power = 3;
        else
            this.setBikeGas(this.state.bikeGas - (0.1 - (this.state.upgrades[3] / 290)));

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
        if(flipped !== null)
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
        if(this.state.bikeGas === 100)
            return;

        let newGas = 0;

        if(index === 0)
        {
            if(this.state.coins < 60)
                return;

            newGas = this.state.bikeGas + 25;
            this.setState({coins: this.state.coins - 60});
        }
        else if(index === 1)
        {
            if(this.state.coins < 110)
                return;

            newGas = this.state.bikeGas + 50;
            this.setState({coins: this.state.coins - 110});
        }
        else if(index === 2)
        {
            if(this.state.coins < 200)
                return;

            newGas = 100;
            this.setState({coins: this.state.coins - 200});
        }

        if(newGas > 100)
            newGas = 100;

        this.setBikeGas(newGas);
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

    gotoGarageBuy()
    {
        if(this.state.coins >= 10)
        {
            this.setState({coins: this.state.coins - 10});
            this.setBikePosition({x: 0, y: 0});
            this.loadScene("Home");
            this.setGamePaused(false);
        }
    }

    setCurrentUI(index)
    {
        if(index == 3)
            this.setState({currentUI: index, currentUIData: [0]});
        else
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

            if(index === 1)
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

    setGamePaused(paused)
    {
        if(paused)
            this.engine.timing.timeScale = 0;
        else
            this.engine.timing.timeScale = 1;

        this.setState({gamePaused: paused});
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
                        <button hidden={this.state.gamePaused} className="game_pause_button action_button_resizable pause_button" onClick={() => this.setGamePaused(true)}></button>

                        {/* <p className="game_bottom_right_text">Press [F] to interact</p> */}
                        <p className="game_bottom_right_text" hidden={!this.state.autoSaving}>Auto Saving...</p>

                        <div hidden={this.state.currentUI !== 1} className="game_ui_tutorial_div">
                            <div hidden={this.state.currentUIData[0] !== ""}>
                                <h1>Welcome</h1>
                                <h4>Welcome to the Racing Game!</h4>
                                <p>In this game you ride your bike around the city. There are races you can do against bots to earn rewards. You can tune your bike with unlockable parts and upgrades.</p>
                                <h3>How Game Saving Works:</h3>
                                <p>You must be logged in to save progress. Your game data saves automatically every minute. You can always manually save your game in the garage menu. <span style={{color: "red"}}>If you don't save before closing some progress may NOT be saved.</span></p>
                                
                                {/*It also saves when you close the game (non forcefully).*/}
                                <button className="racing_game_button" onClick={() => this.setState({currentUIData: ["Controls"]})}>Next Page -&#62;</button>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== "Controls"}>
                                <h1>Controls:</h1>
                                <p>Main click <b>(Left Click)</b></p>
                                <p>Move bike <b>(A & D)</b></p>
                                <p>Interact / open place <b>(F)</b></p>
                                <button className="racing_game_button" onClick={() => this.setCurrentUI(0)}>Start Playing!</button>
                            </div>
                            
                        </div>

                        <div className="game_ui_countdown">
                            <p hidden={this.state.countdownID === ""}>{this.state.countdown > 0 ? this.state.countdown : "Go!"}</p>
                        </div>

                        <div hidden={this.state.currentUI !== 3} className="game_ui_race_map_div">
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
                            <button className="game_form_ui_info loading_button" onClick={() => this.setState({currentUIData: [-1]})}></button>
                            
                            <button hidden={this.state.currentUIData[0] === 0} className="game_ui_race_map_left_button" onClick={() => this.setState({currentUIData: [this.state.currentUIData[0] - 1]})}>&#60;</button>
                            <button hidden={this.state.currentUIData[0] === 2} className="game_ui_race_map_right_button" onClick={() => this.setState({currentUIData: [this.state.currentUIData[0] + 1]})}>&#62;</button>

                            <div hidden={this.state.currentUIData[0] !== -1}>
                                <h1>Info</h1>
                                <p>Complete 2 levels to unlock the next map variant</p>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== 0}>
                                <h1>North Pole</h1>
                                <table className="game_ui_race_map_levels_table center_align">
                                    <tbody>
                                        <tr>
                                            <th>Snowy Fields</th>
                                            <td><button>1</button></td>
                                            <td><button>2</button></td>
                                            <td><button>3</button></td>
                                        </tr>
                                        <tr>
                                            <th>Snowy Hills</th>
                                            <td><button>1</button></td>
                                            <td><button>2</button></td>
                                            <td><button>3</button></td>
                                        </tr>
                                        <tr>
                                            <th>Snowy Mountains</th>
                                            <td><button>1</button></td>
                                            <td><button>2</button></td>
                                            <td><button>3</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                                {/* <div className="game_ui_race_map_levels_div center_align">
                                    <p></p>
                                    <button>1</button>
                                    <button>2</button>
                                    <button>3</button>
                                </div>
                                <div className="game_ui_race_map_levels_div center_align">
                                    <button>4</button>
                                    <button>5</button>
                                    <button>6</button>
                                </div>
                                <div className="game_ui_race_map_levels_div center_align">
                                    <button>7</button>
                                    <button>8</button>
                                    <button>9</button>
                                </div> */}
                            </div>
                            <div hidden={this.state.currentUIData[0] !== 1}>
                                <h1>Swamp</h1>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== 2}>
                                <h1>Desert</h1>
                            </div>
                        </div>

                        <div hidden={this.scene !== "Game"} className="game_ui_race_line">
                            <img alt="Start" srcSet={RaceStartIcon} className="game_ui_race_line_icon game_ui_race_line_start"></img>
                            <img alt="Bot" srcSet={RaceMarkers[0]} className="game_ui_race_line_icon" style={{left: Math.min((this.state.raceBots[0].posX / this.state.currentRaceLength) * 100, 100) + "%"}}></img>
                            <img alt="Bot" srcSet={RaceMarkers[1]} className="game_ui_race_line_icon" style={{left: Math.min((this.state.raceBots[1].posX / this.state.currentRaceLength) * 100, 100) + "%"}}></img>
                            <img alt="Bot" srcSet={RaceMarkers[2]} className="game_ui_race_line_icon" style={{left: Math.min((this.state.raceBots[2].posX / this.state.currentRaceLength) * 100, 100) + "%"}}></img>
                            <img alt="Bot" srcSet={RaceMarkers[3]} className="game_ui_race_line_icon" style={{left: Math.min((this.state.raceBots[3].posX / this.state.currentRaceLength) * 100, 100) + "%"}}></img>
                            <img alt="Finish" srcSet={RaceIcon} className="game_ui_race_line_icon game_ui_race_line_finish"></img>
                            <img alt="You" srcSet={RaceMarkerIcon} className="game_ui_race_line_icon" style={{left: Math.min((this.body.position.x / this.state.currentRaceLength) * 100, 100) + "%"}}></img>
                        </div>

                        <div hidden={!this.state.gamePaused} className="game_ui_pause_div center_align">
                            <h1>Game Paused</h1>
                            <img alt="Paused Icon" srcSet={PausedIcon} width="130px"></img>
                            <br></br><br></br>

                            <div>
                                <button disabled={!this.loggedIn} onClick={() => this.saveGame()} className="racing_game_button">Manual Save</button>
                            </div>

                            <p>Goto Garage:</p>
                            <div className="game_ui_buy_button_div">
                                <button disabled={this.state.coins < 10} onClick={this.gotoGarageBuy.bind(this)}>
                                    <img disabled={this.state.coins < 10} alt="coin" srcSet={TrumpetCoin}></img>
                                    <p disabled={this.state.coins < 10}>10</p>
                                </button>
                            </div>
                            
                            <div className="game_ui_pause_div_button_div">
                                <button className="racing_game_button" onClick={() => this.setGamePaused(false)}>Resume</button>
                            </div>
                        </div>
                        
                        <div className="game_form_ui_div" hidden={this.state.currentUI !== 2}>
                            <h1>{this.state.currentUIData[0] === "" ? "Garage" : this.state.currentUIData[0]}</h1>
                            <button className="game_form_ui_close decline_button" onClick={() => this.setCurrentUI(0)}></button>
                            <button hidden={this.state.currentUIData[0] === ""} className="game_form_ui_back" style={{backgroundImage: `url(${LeftArrow})`}} onClick={() => this.setState({currentUIData: [""]})}></button>
                            <div hidden={this.state.currentUIData[0] !== ""}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.setState({currentUIData: ["Upgrades"]})} className="game_garage_ui_section">
                                        <img alt="Upgrades Icon" srcSet={UpgradeIcon}></img>
                                        <h2>Upgrades</h2>
                                    </button>
                                    <button onClick={() => this.setState({currentUIData: ["Body"]})} className="game_garage_ui_section">
                                        <img alt="Body Icon" srcSet={BikeBodyRed}></img>
                                        <h2>Body</h2>
                                    </button>
                                    <button onClick={() => this.setState({currentUIData: ["Wheels"]})} className="game_garage_ui_section">
                                        <img alt="Wheels Icon" srcSet={Wheel}></img>
                                        <h2>Wheels</h2>
                                    </button>
                                    <button disabled={!this.loggedIn} onClick={() => this.saveGame()} className="game_garage_ui_section">
                                        <img disabled={!this.loggedIn} alt="Save Icon" srcSet={SaveIcon}></img>
                                        <h2 disabled={!this.loggedIn}>{this.state.saveText}</h2>
                                    </button>
                                    <button onClick={() => this.setCurrentUI(3)} className="game_garage_ui_section">
                                        <img alt="Start Race Icon" srcSet={RaceIcon}></img>
                                        <h2>Start Race</h2>
                                    </button>
                                </div>
                            </div>

                            <div hidden={this.state.currentUIData[0] !== "Upgrades"}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.upgradeBike(0)} className="game_garage_ui_section">
                                        <img alt="Engine Icon" srcSet={EngineIcon}></img>
                                        <p>{this.state.upgrades[0] < maxUpgradeLevel ? this.state.upgrades[0] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Engine</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(1)} className="game_garage_ui_section">
                                        <img alt="Suspension Icon" srcSet={SuspensionIcon}></img>
                                        <p>{this.state.upgrades[1] < maxUpgradeLevel ? this.state.upgrades[1] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Suspension</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(2)} className="game_garage_ui_section">
                                        <img alt="Traction Icon" srcSet={BikeWheels[2]}></img>
                                        <p>{this.state.upgrades[2] < maxUpgradeLevel ? this.state.upgrades[2] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Traction</h2>
                                    </button>
                                    <button onClick={() => this.upgradeBike(3)} className="game_garage_ui_section">
                                        <img alt="Gas Icon" srcSet={GasIcon}></img>
                                        <p>{this.state.upgrades[3] < maxUpgradeLevel ? this.state.upgrades[3] + "/" + maxUpgradeLevel : "MAX"}</p>
                                        <h2>Gas Efficiency</h2>
                                    </button>
                                </div>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== "Body"}>
                                <div className="game_form_ui_sections center_align">
                                    <button onClick={() => this.setBikeBody(0)} className="game_garage_ui_section">
                                        <img alt="Body Icon" srcSet={BikeBodies[0]}></img>
                                        <h2>Red</h2>
                                    </button>
                                    <button hidden={!this.state.items.bodies.includes(1)} onClick={() => this.setBikeBody(1)} className="game_garage_ui_section">
                                        <img alt="Body Icon" srcSet={BikeBodies[1]}></img>
                                        <h2>Green</h2>
                                    </button>
                                    <button hidden={!this.state.items.bodies.includes(2)} onClick={() => this.setBikeBody(2)} className="game_garage_ui_section">
                                        <img alt="Body Icon" srcSet={BikeBodies[2]}></img>
                                        <h2>Blue</h2>
                                    </button>
                                </div>
                            </div>
                            <div hidden={this.state.currentUIData[0] !== "Wheels"}>
                                <div className="game_form_ui_sections center_align">
                                    <button className="game_garage_ui_section" onClick={() => this.setBikeWheels(0)}>
                                        <img alt="Wheel Icon" srcSet={BikeWheels[0]}></img>
                                        <h2>Default Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(1)} onClick={() => this.setBikeWheels(1)} className="game_garage_ui_section">
                                        <img alt="Wheel Icon" srcSet={BikeWheels[1]}></img>
                                        <h2>Road Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(2)} onClick={() => this.setBikeWheels(2)} className="game_garage_ui_section">
                                        <img alt="Wheel Icon" srcSet={BikeWheels[2]}></img>
                                        <h2>Mud Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(3)} onClick={() => this.setBikeWheels(3)} className="game_garage_ui_section">
                                        <img alt="Wheel Icon" srcSet={BikeWheels[3]}></img>
                                        <h2>Sand Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(4)} onClick={() => this.setBikeWheels(4)} className="game_garage_ui_section">
                                        <img alt="Wheel Icon" srcSet={BikeWheels[4]}></img>
                                        <h2>Snow Wheels</h2>
                                    </button>
                                    <button hidden={!this.state.items.wheels.includes(5)} onClick={() => this.setBikeWheels(5)} className="game_garage_ui_section">
                                        <img alt="Wheel Icon" srcSet={BikeWheels[5]}></img>
                                        <h2>Wet Wheels</h2>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="game_form_ui_div" hidden={this.state.currentUI !== 4}>
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
                        <div className="game_form_ui_div" hidden={this.state.currentUI !== 5}>
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
                                            <img alt="Coin" srcSet={TrumpetCoin}></img>
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
                        <div className="game_form_ui_div" hidden={this.state.currentUI !== 6}>
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
                            <img className="game_coins_image" alt="Coin" srcSet={TrumpetCoin}></img>
                            <p className="game_coins_text">{this.state.coins}</p>
                        </div>
                        
                        <div className="game_gas_bar">
                            <ProgressBar mainColor={this.state.bikeGasColor} bgColor="gray" value={this.state.bikeGas}></ProgressBar> 
                            <p className="game_gas_bar_text" hidden={this.state.bikeGas > 0}>Empty</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default RacingGame;