import React, {createRef} from 'react';
import '../../../src/styles/GamePage.css';
import './SpeedyPizzaGame.css';
import RedCar from './assets/red_car.svg';
import BlueCar from './assets/blue_car.svg';
import OrangeCar from './assets/orange_car.svg';
import GreenCar from './assets/green_car.svg';
import PurpleCar from './assets/purple_car.svg';
import YellowCar from './assets/yellow_car.svg';
import RedTruck from './assets/red_truck.svg';
import RoadHole from './assets/road_hole.svg';
import RoadCone from './assets/cone.svg';
import Bridge from './assets/bridge.svg';
import PizzaShop from './assets/pizza_shop.svg';
import CarShop from './assets/car_shop.svg';
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

const CarTextures = [BlueCar, OrangeCar, GreenCar, PurpleCar, YellowCar];
const TruckTextures = [RedTruck];

class SpeedyPizzaGame extends React.Component
{
    constructor(props)
    {
        super(props);
        this.mainRef = createRef();
        this.loaded = false;

        this.pizzaCar = Matter.Bodies.rectangle(400, 300, 80, 130, {label: "Pizza Car", collisionFilter: {category: 0b10}, isStatic: false, frictionAir: 0, render: {sprite: {texture: RedCar}}});
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
        this.roadLane0 = Matter.Bodies.rectangle(200, -50000, 100, 100000, lightLaneOptions);
        this.roadLane1 = Matter.Bodies.rectangle(300, -50000, 100, 100000, darkLaneOptions);
        this.roadLane2 = Matter.Bodies.rectangle(400, -50000, 100, 100000, lightLaneOptions);
        this.roadLane3 = Matter.Bodies.rectangle(500, -50000, 100, 100000, darkLaneOptions);
        this.roadLane4 = Matter.Bodies.rectangle(600, -50000, 100, 100000, lightLaneOptions);

        this.pizzaShop = Matter.Bodies.rectangle(650, 300, 900, 900,
        {
            isStatic: true,
            collisionFilter: {group: -1, mask: 0},
            render:
            {
                sprite:
                {
                    xScale: 2,
                    yScale: 2,
                    texture: PizzaShop
                }
            }
        });

        this.lane = 0;
        this.carSpeed = 8;
        this.chunksLoaded = 0;
        this.chunkSize = 730;
        this.gameover = false;
        this.state = {scene: "Home", currentUI: 0, distanceTraveled: 0};


        this.engine = null;
        this.renderer = null;
        this.runner = null;
    };

    getRandomCarTexture()
    {
        return CarTextures[Math.floor(Math.random() * CarTextures.length)];
    }

    getRandomTruckTexture()
    {
        return TruckTextures[Math.floor(Math.random() * TruckTextures.length)];
    }

    //generates a chuck of the road obstacles based on the index
    generateChunk(index, yPos)
    {
        let chunkObjects = [];

        if(index >= 0 && index <= 9)
        {
            for(let i = 0; i < 5; i++)
            {
                if(i == index || i == index - 5)
                    continue;
                
                //1/5 chance of a truck spawning insead of a car
                if(Math.random() > 0.8)
                    chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 100, 270, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 1.8, yScale: 1.8, texture: this.getRandomTruckTexture()}}}));
                else if(Math.random() > 0.9)
                    chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 80, 130, {label: "Obstacle", isStatic: true, render: {sprite: {texture: RoadHole}}}));
                else if(Math.random() > 0.9)
                    chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 70, 70, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 0.6, yScale: 0.6, texture: RoadCone}}}));
                else
                    chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 80, 130, {label: "Obstacle", isStatic: true, render: {sprite: {texture: this.getRandomCarTexture()}}}));
            }
        }
        else if(index >= 10 && index <= 14)
        {
            for(let i = 0; i < 5; i++)
            {
                if(i == index - 10 || i == index - 9)
                    continue;
            
                chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 100, 270, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 1.8, yScale: 1.8, texture: this.getRandomTruckTexture()}}}));
            }
        }
        else if(index >= 15 && index <= 19)
        {
            for(let i = 0; i < 5; i++)
            {
                if(i == index - 15 || i == index - 14)
                    continue;
            
                chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 200, yPos, 70, 70, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 0.6, yScale: 0.6, texture: RoadCone}}}));
            }
        }
        else if(index >= 20 && index <= 24) //bridge
        {
            chunkObjects.push(Matter.Bodies.rectangle(200, yPos + 300, 70, 70, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 0.6, yScale: 0.6, texture: RoadCone}}}));
            chunkObjects.push(Matter.Bodies.rectangle(600, yPos + 300, 70, 70, {label: "Obstacle", isStatic: true, render: {sprite: {xScale: 0.6, yScale: 0.6, texture: RoadCone}}}));

            chunkObjects.push(Matter.Bodies.rectangle(200, yPos, 100, 500, {label: "Obstacle", isStatic: true, render: {fillStyle: "dodgerblue"}}));
            chunkObjects.push(Matter.Bodies.rectangle(600, yPos, 100, 500, {label: "Obstacle", isStatic: true, render: {fillStyle: "dodgerblue"}}));
            
            for(let i = 0; i < 3; i++)
            {
                chunkObjects.push(Matter.Bodies.rectangle((i * 100) + 300, yPos, 100, 1000, {label: "Bridge", collisionFilter: {group: -1, mask: 0}, isStatic: true, render: {sprite: {xScale: 7, yScale: 7, texture: Bridge}}}));
            }
        }

        return chunkObjects;
    }

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

        this.engine.world.gravity.scale = 0;

        Matter.Events.on(this.engine, 'beforeUpdate', function()
        {
            if(this.state.scene == "Game" && !this.gameover)
            {
                Matter.Body.setVelocity(this.pizzaCar, {x: 0, y: -this.carSpeed});
                Matter.Render.lookAt(this.renderer, {x: 400, y: this.pizzaCar.position.y - this.renderer.options.height / 2}, {x: 500, y: 500});
                
                if(this.pizzaCar.position.y > 0)
                    this.setState({distanceTraveled: 0});
                else
                    this.setState({distanceTraveled: Math.round(-(this.pizzaCar.position.y / 10))});

                if(this.state.distanceTraveled >= 2490)
                    this.carSpeed = 15;
                else if(this.state.distanceTraveled >= 2095)
                    this.carSpeed = 14;
                else if(this.state.distanceTraveled >= 1560)
                    this.carSpeed = 13;
                else if(this.state.distanceTraveled >= 1050)
                    this.carSpeed = 12;
                else if(this.state.distanceTraveled >= 800)
                    this.carSpeed = 11;
                else if(this.state.distanceTraveled >= 400)
                    this.carSpeed = 10;
                else if(this.state.distanceTraveled >= 180)
                    this.carSpeed = 9;

                if((this.chunksLoaded - 5) * (this.chunkSize / 10) < this.state.distanceTraveled)
                {
                    Matter.Composite.add(this.engine.world, this.generateChunk(Math.floor(Math.random() * 25), -(this.chunksLoaded * this.chunkSize) - 900));
                    Matter.Composite.remove(this.engine.world, [this.pizzaCar]);
                    Matter.Composite.add(this.engine.world, [this.pizzaCar]);
                    this.chunksLoaded++;
                }
            }
            
        }.bind(this));

        Matter.Events.on(this.engine, 'collisionActive', function(e)
        {
            if(this.state.scene == "Game" && !this.gameover)
            {
                for(let i = 0; i < e.pairs.length; i++)
                {
                    if(e.pairs[i].bodyA.label == "Pizza Car" || e.pairs[i].bodyB.label == "Pizza Car")
                    {
                        if(e.pairs[i].bodyA.label == "Obstacle" || e.pairs[i].bodyB.label == "Obstacle")
                        {
                            this.setState({currentUI: "gameover"});
                            this.gameover = true;
                        }
                    }
                }
            }
        }.bind(this));
        
        this.mouse = Matter.Mouse.create(this.render.canvas);
        
        Matter.Events.on(this.engine, "afterUpdate", function(e)
        {
            if(!this.mouse.position.x)
                return;

            Matter.Body.setVelocity(this.pizzaCar, {
                x: this.pizzaCar.position.x - this.mouse.position.x,
                y: 0
            });

            Matter.Body.setPosition(this.pizzaCar, {
                x: this.mouse.position.x - 200,
                y: this.pizzaCar.position.y
            });
        }.bind(this));
        
        this.loadScene("Home");
        Matter.Render.run(this.renderer);


        this.runner = Matter.Runner.create();

        Matter.Runner.run(this.runner, this.engine);

        document.addEventListener("keyup", this.keyUp);

        this.loaded = true;
    };

    unloadScene(name)
    {
        Matter.Composite.clear(this.engine.world);
    }

    loadScene(name)
    {
        this.setState({currentUI: ""});
        this.unloadScene(name);

        this.setState({scene: name});

        if(name === "Loading")
        {

        }
        else if(name === "Game" || name === "Home")
        {
            this.gameover = false;

            Matter.Composite.add(this.engine.world, [
                this.road,
                this.roadLane0,
                this.roadLane1,
                this.roadLane2,
                this.roadLane3,
                this.roadLane4,
                this.pizzaCar
            ]);

            if(name === "Home")
            {
                Matter.Render.lookAt(this.renderer, {x: 400, y: 150}, {x: 500, y: 500});
                Matter.Composite.add(this.engine.world, [
                   
                ]);
            }
        }
    }

    move(direction)
    {
        if(this.lane == -2 && direction == -1 || this.lane == 2 && direction == 1)
            return;

        this.lane += direction;
        Matter.Body.setPosition(this.pizzaCar, {x: this.pizzaCar.position.x + (direction * 100), y: this.pizzaCar.position.y})
    }

    keyUp = (e) =>
    {
        if(this.state.scene == "Game")
        {
            if(e.key == "a")
                this.move(-1);
            else if(e.key == "d")
                this.move(1); 
        }
        else if(this.state.scene == "Home")
        {
            if(e.key == " ")
                this.loadScene("Game");
        }
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
                        <h2 hidden={this.state.scene != "Game"} className="game_ui_distance_text">{this.state.distanceTraveled}m</h2>
                        
                        <div hidden={this.state.scene != "Home"} className="game_ui_home_div">
                            
                            <input type="image" src={PizzaShop} className="game_ui_home_pizza_shop" onClick={() => this.loadScene("Game")}></input>
                            <input type="image" src={CarShop} className="game_ui_home_car_shop" onClick={() => this.loadScene("Shop")}></input>
                        
                        </div>
                        <div hidden={this.state.scene != "Shop"} className="game_ui_shop_div">
                            <button className="game_ui_shop_back_button" onClick={() => this.loadScene("Home")}>Back</button>
                            
                        </div>
                        <div hidden={this.state.scene != "Loading"} className="game_ui_loading_div">
                            <h1 className="game_ui_loading_title">Speedy Pizza</h1>

                            <button className="game_ui_loading_button" onClick={() => this.loadScene("Game")}>Play</button>
                            <br></br>
                            <button className="game_ui_loading_button" onClick={() => this.loadScene("Shop")}>Shop</button>
                            <br></br>
                            <button className="game_ui_loading_button" onClick={() => this.loadScene("About")}>About</button>
                        </div>
                        <div hidden={this.state.currentUI != "gameover"} className="game_ui_gameover_div">
                            <h1>Gameover</h1>

                            <button onClick={() => this.loadScene("Loading")}>Main Screen</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default SpeedyPizzaGame;