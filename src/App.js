import React, { Component } from "react";

import logo from "./logo.svg";
import "./App.css";
import lisa from "./textures/lisa.png";

import nx from "./textures/SwedishRoyalCastle/nx.jpg";
import ny from "./textures/SwedishRoyalCastle/ny.jpg";
import nz from "./textures/SwedishRoyalCastle/nz.jpg";
import px from "./textures/SwedishRoyalCastle/px.jpg";
import py from "./textures/SwedishRoyalCastle/py.jpg";
import pz from "./textures/SwedishRoyalCastle/pz.jpg";
import { NarrowPhase } from "cannon";

//import * as THREE from "three";
var THREE = require("three");
var CANNON = require("cannon");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentKey: "",
      mouseX: 0.5,
      mouseY: 0.5,
      angle: 0.0,
      angle2: 0.0,
      powerup: 0,
      removeBody: false
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.collision = this.collision.bind(this);
  }

  collision(e) {
    if (this.powerupBodies.includes(e.body)) {
      this.setState({ powerup: this.state.powerup + 1 });
      this.bodyToRemove = e.body;
      var indexToRemove = this.powerupBodies.indexOf(e.body);
      var powerupToRemove = this.powerups[indexToRemove];
      this.scene.remove(powerupToRemove);

      this.setState({ removeBody: true });
    }
  }

  handleKeyPress(e) {
    this.setState({ currentKey: e.keyCode });
    if (e.keyCode === 27) {
      console.log("You just pressed Escape!");
      this.cube.position.z -= 0.3;
    }
  }
  handleTouchMove(e) {
    console.log("Touch move!");
    e.preventDefault();

    this.setState({
      mouseX: e.changedTouches[0].pageX / window.innerWidth,
      mouseY: e.changedTouches[0].pageY / window.innerHeight
    });
  }

  createExplosion(position) {
    var radius = 0.1;
    for (var i = 0; i < 50; i++) {
      var explosionShape = new CANNON.Sphere(radius);
      this.explosionBody = new CANNON.Body({
        mass: 1,
        shape: explosionShape,
        collisionFilterMask: 0
      });

      this.explosionBody.position.set(position.x, position.y, position.z);
      var particleVelocityX = 20 * (Math.random() - 0.5);
      var particleVelocityY = 20 * (Math.random() - 0.5);
      var particleVelocityZ = 20 * (Math.random() - 0.5);

      this.explosionBody.velocity.set(
        particleVelocityX,
        particleVelocityY,
        particleVelocityZ
      );
      this.explosionBodies.push(this.explosionBody);
      this.world.add(this.explosionBody);

      var explosionMaterial = new THREE.MeshPhongMaterial({
        color: "blue",
        envMap: this.cubeCamera1.renderTarget.texture
      });
      this.explosion = new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(radius, 3),
        explosionMaterial
      );

      this.explosions.push(this.explosion);
      this.scene.add(this.explosion);
    }
  }

  createBullet(startLocationX, startLocationY, radius) {
    console.log("Touch start!");

    this.bulletShape = new CANNON.Sphere(radius);
    this.bulletBody = new CANNON.Body({ mass: 5, shape: this.bulletShape });

    this.localbulletPosition = new CANNON.Vec3(
      startLocationX,
      startLocationY,
      -3
    );
    this.localbulletVelocity = new CANNON.Vec3(0, 0, -100);
    this.bulletPosition = this.playerBody.quaternion
      .vmult(this.localbulletPosition)
      .vadd(this.playerBody.position);
    this.bulletVelocity = this.playerBody.quaternion.vmult(
      this.localbulletVelocity
    );

    this.bulletBody.velocity.set(
      this.bulletVelocity.x,
      this.bulletVelocity.y,
      this.bulletVelocity.z
    );
    this.bulletBody.position.set(
      this.bulletPosition.x,
      this.bulletPosition.y,
      this.bulletPosition.z
    );
    this.bulletBodies.push(this.bulletBody);
    this.world.add(this.bulletBody);

    var bulletMaterial = new THREE.MeshPhongMaterial({
      color: "red",
      envMap: this.cubeCamera1.renderTarget.texture
    });
    this.bullet = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(radius, 3),
      bulletMaterial
    );

    this.bullets.push(this.bullet);
    this.scene.add(this.bullet);
  }

  handleTouchStart(e) {
    e.preventDefault();

    switch (this.state.powerup) {
      case 0:
        this.createBullet(0, 0, 0.5);
        break;
      case 1:
        this.createBullet(1, 0, 0.5);
        this.createBullet(-1, 0, 0.5);
        break;
      case 2:
        this.createBullet(2, 0, 0.5);
        this.createBullet(0, 0, 0.5);
        this.createBullet(-2, 0, 0.5);
        break;
      case 3:
        this.createBullet(0, 1.5, 0.5);
        this.createBullet(0, -1.5, 0.5);
        this.createBullet(1.5, 0, 0.5);
        this.createBullet(-1.5, 0, 0.5);
        break;
      case 4:
        this.createBullet(0, 2, 1);
        this.createBullet(0, -2, 1);
        this.createBullet(2, 0, 1);
        this.createBullet(-2, 0, 1);
        break;
      default:
        this.createBullet(0, 4, 2);
        this.createBullet(0, -4, 2);
        this.createBullet(4, 0, 2);
        this.createBullet(-4, 0, 2);
    }
  }

  handleMouseMove(e) {
    console.log("You just moved the mouse!");

    this.setState({
      mouseX: e.pageX / window.innerWidth,
      mouseY: e.pageY / window.innerHeight
    });
    //console.log(e.pageX / window.innerWidth);
  }

  componentDidMount() {
    //document.body.classList.add("noscroll");

    //document.body.style.overflow = "hidden";

    //document.addEventListener("keydown", this.handleKeyPress);
    //document.addEventListener("touchmove", this.handleTouchMove);
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene();
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 4;

    this.cubeCamera1 = new THREE.CubeCamera(1, 1000, 256);
    this.scene.add(this.cubeCamera1);

    var urls = [px, nx, py, ny, pz, nz];
    var textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.mapping = THREE.CubeRefractionMapping;

    this.scene.background = textureCube;

    // LIGHTS
    var ambient = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(ambient);

    var lightsphere = new THREE.SphereBufferGeometry(0.1, 16, 8);
    this.light1 = new THREE.PointLight(0xffffff, 10, 5);
    this.light1.add(
      new THREE.Mesh(
        lightsphere,
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
    );
    this.scene.add(this.light1);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#000000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false
    });

    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.NaiveBroadphase();

    //Lisa
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    var cubeTexture = new THREE.TextureLoader().load(lisa);
    const material = new THREE.MeshPhongMaterial({
      //color: "orange",

      map: cubeTexture,
      //envMap: textureCube
      envMap: this.cubeCamera1.renderTarget.texture
    });

    const material2 = new THREE.MeshPhongMaterial({
      //color: "green",
      envMap: this.cubeCamera1.renderTarget.texture
    });
    const powerupMaterial = new THREE.MeshPhongMaterial({
      color: "green",
      envMap: this.cubeCamera1.renderTarget.texture
    });

    const ringMaterial = new THREE.MeshPhongMaterial({ color: "red" });

    var ringGeometry = new THREE.RingGeometry(1, 1.02, 32);
    var dotGeometry = new THREE.RingGeometry(0.0001, 0.02, 32);

    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.dot = new THREE.Mesh(dotGeometry, ringMaterial);

    this.ring.add(this.dot);
    this.ring.add(this.camera);
    this.scene.add(this.ring);

    // this.scene.add(this.dot);

    this.playerShape = new CANNON.Sphere(1.1);
    this.playerBody = new CANNON.Body({ mass: 0.2, shape: this.playerShape });

    this.playerBody.position.set(0, 0, 0);
    this.world.add(this.playerBody);

    this.playerBody.addEventListener("collide", this.collision);

    this.cube2 = new THREE.Mesh(geometry, material);
    this.cube2.position.x = 2;
    this.scene.add(this.cube2);

    // var sphere = new THREE.Mesh(
    //   new THREE.IcosahedronBufferGeometry(0.5, 3),
    //   material2
    // );
    // sphere.position.y = 2;
    // this.scene.add(sphere);

    var torusgeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    this.torus = new THREE.Mesh(torusgeometry, material2);
    this.torus.position.x = -1.5;
    this.torus.position.z = -1.5;
    this.scene.add(this.torus);

    this.toruses = [];
    this.torusBodies = [];
    this.spheres = [];
    this.sphereBodies = [];
    this.cubes = [];
    this.cubeBodies = [];
    this.powerups = [];
    this.powerupBodies = [];
    this.explosions = [];
    this.explosionBodies = [];

    this.bullets = [];
    this.bulletBodies = [];
    this.angle = 0.0;
    this.angle2 = 0.0;

    this.bodyToRemove = new CANNON.Body({});
    this.objectToRemove = new THREE.Mesh({});

    for (var i = 0; i < 150; i++) {
      this.torusShape = new CANNON.Cylinder(1.2, 1.2, 2.2, 8);
      this.torusBody = new CANNON.Body({ mass: 1, shape: this.torusShape });

      var torusgeometry2 = new THREE.TorusGeometry(1, 0.4, 16, 100);
      this.torus = new THREE.Mesh(torusgeometry2, material2);
      this.torusBody.position.x = (Math.random() - 0.5) * 100;
      this.torusBody.position.y = (Math.random() - 0.5) * 100;
      this.torusBody.position.z = (Math.random() - 0.5) * 100;
      //this.torusBody.rotation.set(
      //Math.random() * 2 * Math.PI,
      //Math.random() * 2 * Math.PI,
      //Math.random() * 2 * Math.PI
      //);
      this.toruses.push(this.torus);
      this.scene.add(this.torus);
      this.world.add(this.torusBody);
      this.torusBodies[i] = this.torusBody;
    }

    for (var i = 0; i < 150; i++) {
      //////
      this.sphereShape = new CANNON.Sphere(1);
      this.sphereBody = new CANNON.Body({ mass: 1, shape: this.sphereShape });

      var spheregeometry2 = new THREE.SphereBufferGeometry(1, 16);
      this.sphere = new THREE.Mesh(spheregeometry2, material2);
      this.sphereBody.position.x = (Math.random() - 0.5) * 100;
      this.sphereBody.position.y = (Math.random() - 0.5) * 100;
      this.sphereBody.position.z = (Math.random() - 0.5) * 100;

      this.spheres.push(this.sphere);
      this.scene.add(this.sphere);
      this.world.add(this.sphereBody);

      this.sphereBodies[i] = this.sphereBody;
      //////
    }
    for (var i = 0; i < 150; i++) {
      //////
      this.cubeShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      this.cubeBody = new CANNON.Body({ mass: 1, shape: this.cubeShape });

      var cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
      this.cube = new THREE.Mesh(cubeGeometry, material2);
      this.cubeBody.position.x = (Math.random() - 0.5) * 100;
      this.cubeBody.position.y = (Math.random() - 0.5) * 100;
      this.cubeBody.position.z = (Math.random() - 0.5) * 100;

      this.cubes.push(this.cube);
      this.scene.add(this.cube);

      this.world.add(this.cubeBody);

      this.cubeBodies[i] = this.cubeBody;
      //////
    }
    for (var i = 0; i < 20; i++) {
      //////
      this.powerupShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      this.powerupBody = new CANNON.Body({ mass: 1, shape: this.powerupShape });

      var powerupGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
      this.powerup = new THREE.Mesh(powerupGeometry, powerupMaterial);
      this.powerupBody.position.x = (Math.random() - 0.5) * 100;
      this.powerupBody.position.y = (Math.random() - 0.5) * 100;
      this.powerupBody.position.z = (Math.random() - 0.5) * 100;
      this.powerupBody.angularVelocity.set(1, 3, 0);

      this.powerups.push(this.powerup);
      this.scene.add(this.powerup);

      this.world.add(this.powerupBody);

      this.powerupBodies[i] = this.powerupBody;

      //////
    }

    this.playerBodyLocalVelocity = new CANNON.Vec3(0, 0, -5);
    this.playerBodyLocalXAxis = new CANNON.Vec3(1, 0, 0);
    this.playerBodyLocalYAxis = new CANNON.Vec3(0, 1, 0);

    this.start();
  }
  componentWillUnmount() {
    // document.removeEventListener("keydown", this.handleKeyPress);
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.torus.rotation.x += 0.03;
    this.torus.rotation.y += 0.03;
    this.torus.rotation.z += 0.01;
    if (this.state.removeBody === true) {
      this.world.removeBody(this.bodyToRemove);
      this.createExplosion(this.bodyToRemove.position);
      this.scene.remove(this.objectToRemove);
      this.setState({ removeBody: false });
    }

    this.world.step(1 / 60);

    for (var i = 0; i < 150; i++) {
      this.cubes[i].rotation.x += 0.01;
      this.cubes[i].rotation.y += 0.01;
      this.cubes[i].rotation.z += 0.005;
      //this.toruses[i].rotation.x += 0.03;
      //this.toruses[i].rotation.y += 0.03;
      //this.toruses[i].rotation.z += 0.01;

      this.toruses[i].position.copy(this.torusBodies[i].position);
      this.toruses[i].quaternion.copy(this.torusBodies[i].quaternion);

      this.spheres[i].position.copy(this.sphereBodies[i].position);
      this.spheres[i].quaternion.copy(this.sphereBodies[i].quaternion);

      this.cubes[i].position.copy(this.cubeBodies[i].position);
      this.cubes[i].quaternion.copy(this.cubeBodies[i].quaternion);
    }
    for (var i = 0; i < 20; i++) {
      this.powerups[i].position.copy(this.powerupBodies[i].position);
      this.powerups[i].quaternion.copy(this.powerupBodies[i].quaternion);
    }
    for (var i = 0; i < this.explosionBodies.length; i++) {
      this.explosions[i].position.copy(this.explosionBodies[i].position);
      this.explosions[i].quaternion.copy(this.explosionBodies[i].quaternion);
    }

    var axis = new CANNON.Vec3(0, 1, 0);
    this.angle -= 0.05 * (this.state.mouseX - 0.5);
    var axis2 = new CANNON.Vec3(1, 0, 0);
    this.angle2 -= 0.05 * (this.state.mouseY - 0.5);
    var yRange = (0.8 * (1 * Math.PI)) / 2;
    this.angle2 = Math.max(-yRange, Math.min(yRange, this.angle2));

    //this.playerBody.quaternion.vmult(axis, axis);
    //this.playerBody.quaternion.vmult(axis2, axis2);

    // if ((Math.abs(this.angle2)%(2*Math.PI) < (Math.PI/2)) || (Math.abs(this.angle2)%(2*Math.PI) > (3*Math.PI/2)))
    //{

    //}
    // else
    // {
    //   this.angle += .02*(this.state.mouseX - 0.5);
    //   console.log("...");
    // }

    var q1 = new CANNON.Quaternion();
    var q2 = new CANNON.Quaternion();

    q1.setFromAxisAngle(axis, this.angle);
    q2.setFromAxisAngle(axis2, this.angle2);

    var resultant = q1.mult(q2);
    resultant.normalize();
    this.playerBody.quaternion.copy(resultant);

    var worldVelocity = this.playerBody.quaternion.vmult(
      this.playerBodyLocalVelocity
    );
    this.playerBody.velocity.copy(worldVelocity);

    this.ring.position.copy(this.playerBody.position);
    this.ring.quaternion.copy(this.playerBody.quaternion);

    this.cubeCamera1.update(this.renderer, this.scene);

    var time = Date.now() * 0.0005;
    this.light1.position.x = Math.sin(time * 2) * 4 + 2;
    this.light1.position.y = Math.cos(time * 1) * 4 + 2;
    this.light1.position.z = Math.cos(time * 1) * 4 + 2;

    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].position.copy(this.bulletBodies[i].position);
      this.bullets[i].quaternion.copy(this.bulletBodies[i].quaternion);
    }

    //this.controls.update();

    this.renderScene();

    //this.controls.update() must be called after any manual changes to the camera's transform
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  //if (this.controls.keys.LEFT) console.log("left");
  // handleKeyDown = event => {
  //   console.log("up");
  // };
  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      // <div onKeyDown={this.handleKeyDown} tabIndex="0">
      //   {/* <h2>
      //     Last pressed keycode: {this.state.currentKey}, Last mouse position:{" "}
      //     {this.state.mouseX}, {this.state.mouseY}
      //   </h2> */}
      <div
        // onFocus="true"
        // onClick={this.handleKeyDown}
        onClick={this.handleTouchStart}
        onTouchStart={this.handleTouchStart}
        onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}
        style={{ width: window.innerWidth, height: window.innerHeight }}
        ref={mount => {
          this.mount = mount;
        }}
      />
      // </div>
    );
  }
}
export default App;
