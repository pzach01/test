import React, { Component } from "react";
import ReactCursorPosition from "react-cursor-position";
import logo from "./logo.svg";
import "./App.css";
import lisa from "./textures/lisa.png";

import nx from "./textures/SwedishRoyalCastle/nx.jpg";
import ny from "./textures/SwedishRoyalCastle/ny.jpg";
import nz from "./textures/SwedishRoyalCastle/nz.jpg";
import px from "./textures/SwedishRoyalCastle/px.jpg";
import py from "./textures/SwedishRoyalCastle/py.jpg";
import pz from "./textures/SwedishRoyalCastle/pz.jpg";

//import * as THREE from "three";
var THREE = require("three");
var OrbitControls = require("three-orbit-controls")(THREE);
var TrackballControls = require("three-trackballcontrols");
var PointerControls = require("three-pointer-controls")(THREE);
var CANNON = require("cannon");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { currentKey: "", mouseX: 0.5, mouseY: 0.5 };
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  handleKeyPress(e) {
    this.setState({ currentKey: e.keyCode });
    if (e.keyCode === 27) {
      console.log("You just pressed Escape!");
      this.cube.position.z -= 0.3;
    }
  }
  handleTouchMove(e) {
    console.log("You just touched the screen!");
    e.preventDefault();
    var lastXPosition = this.state.mouseX;
    this.setState({
      
      mouseX: lastXPosition - e.changedTouches[0].pageX / window.innerWidth,
      mouseY: e.changedTouches[0].pageY / window.innerHeight
    });
    //console.log(e.changedTouches[0]);
  }
  handleMouseMove(e) {
    console.log("You just moved the mouse!");
    var lastXPosition = this.state.mouseX;
    this.setState({
      mouseX: lastXPosition - e.pageX / window.innerWidth,
      mouseY: e.pageY / window.innerHeight
    });
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
    //lights
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

    // this.renderer.domElement.addEventListener(
    //   "keydown",
    //   this.handleKeyDown,
    //   false
    // );
    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false
    });

    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.controls = new PointerControls();
    //this.controls.control(this.camera);
    //this.controls.listenTo(this.renderer.domElement);
    //this.controls.addEventListener("change", this.render);
    //ADD CUBE
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.NaiveBroadphase();
    //this.world.gravity.set(0, -10, 0);

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    var cubeTexture = new THREE.TextureLoader().load(lisa);
    const material = new THREE.MeshPhongMaterial({
      color: "orange",
      metalness: 1,
      roughness: 0.5,
      map: cubeTexture,
      //envMap: textureCube
      envMap: this.cubeCamera1.renderTarget.texture
    });

    const material2 = new THREE.MeshPhongMaterial({
      //color: "green",
      envMap: this.cubeCamera1.renderTarget.texture
    });

    this.cube = new THREE.Mesh(geometry, material2);

    this.sphereShape = new CANNON.Sphere(3);
    this.cubeBody = new CANNON.Body({ mass: 0.2, shape: this.sphereShape });
    //cubeBody.position.set(0, 20, 0);
    this.cubeBody.position.set(0, 0, 0);
    //this.cubeBody.velocity.set(0, 0, -5);

    this.world.add(this.cubeBody);

    this.cube.add(this.camera);
    this.scene.add(this.cube);
    //this.camera.add(this.cubeBody);

    this.bodyz = this.cubeBody;
    //this.scene.add(this.camera);
    this.cube2 = new THREE.Mesh(geometry, material);
    //this.scene.add(this.cube);
    this.cube2.position.x = 2;
    this.scene.add(this.cube2);
    var sphere = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(0.5, 3),
      material2
    );
    sphere.position.y = 2;
    this.scene.add(sphere);

    var torusgeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    this.torus = new THREE.Mesh(torusgeometry, material2);
    this.torus.position.x = -1.5;
    this.torus.position.z = -1.5;
    this.scene.add(this.torus);

    this.toruses = [];
    this.spheres = [];
    this.cubes = [];
    this.bodies = [];
    for (var i = 0; i < 150; i++) {
      this.torusShape = new CANNON.Cylinder(3, 3, 4, 8);
      this.torusBody = new CANNON.Body({ mass: 1, shape: this.torusShape });

      //cubeBody.position.set(0, 20, 0);
      var torusgeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
      this.torus = new THREE.Mesh(torusgeometry, material2);
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

      this.bodies[i] = this.torusBody;

      var sphere = new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(0.5, 3),
        material2
      );
      sphere.position.x = (Math.random() - 0.5) * 100;
      sphere.position.y = (Math.random() - 0.5) * 100;
      sphere.position.z = (Math.random() - 0.5) * 100;

      this.spheres.push(sphere);
      this.scene.add(sphere);
      var cube = new THREE.Mesh(geometry, material2);
      cube.position.x = (Math.random() - 0.5) * 100;
      cube.position.y = (Math.random() - 0.5) * 100;
      cube.position.z = (Math.random() - 0.5) * 100;
      cube.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );

      this.cubes.push(cube);
      this.scene.add(cube);
    }

    this.bodyzLocalVelocity = new CANNON.Vec3(0, 0, -3.5);
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
    this.world.step(1 / 60);

    for (var i = 0; i < 150; i++) {
      this.cubes[i].rotation.x += 0.01;
      this.cubes[i].rotation.y += 0.01;
      this.cubes[i].rotation.z += 0.005;
      //this.toruses[i].rotation.x += 0.03;
      //this.toruses[i].rotation.y += 0.03;
      //this.toruses[i].rotation.z += 0.01;

      this.toruses[i].position.copy(this.bodies[i].position);
      this.toruses[i].quaternion.copy(this.bodies[i].quaternion);
    }
    //this.bodyz.translateZ(-0.07);

    //this.camera.position.rotateY((0.5 - this.state.mouseX) / 50);
    //this.camera.position.rotateX((0.5 - this.state.mouseY) / 50);

    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;

    //this.bodyz.position.z -= 0.08;
    //this.bodyz.position.x -= (0.5 - this.state.mouseX) * 0.5;
    //this.bodyz.position.y += (0.5 - this.state.mouseY) * 0.5;

    var axis = new CANNON.Vec3(0, 1, 0);
    var angle = this.state.mouseX * 3;
    this.bodyz.quaternion.setFromAxisAngle(axis, angle);

    var worldVelocity = this.bodyz.quaternion.vmult(this.bodyzLocalVelocity);
    this.bodyz.velocity.copy(worldVelocity);

    this.cube.position.copy(this.bodyz.position);
    this.cube.quaternion.copy(this.bodyz.quaternion);

    this.cubeCamera1.updateCubeMap(this.renderer, this.scene);

    var time = Date.now() * 0.0005;
    this.light1.position.x = Math.sin(time * 2) * 4 + 2;
    this.light1.position.y = Math.cos(time * 1) * 4 + 2;
    this.light1.position.z = Math.cos(time * 1) * 4 + 2;

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
