import React, { Component } from "react";
import * as THREE from "three";
import lisa from "./textures/lisa.png";

class App extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    this.camera.position.z = 4;
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.renderer.setClearColor("#000000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //ADD CUBE
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    var texture = new THREE.TextureLoader().load(lisa);

    const material = new THREE.MeshStandardMaterial({
      //color: "#433F81"
      //wireframe: true,
      map: texture
    });

    this.cube = new THREE.Mesh(geometry, material);
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    this.cube2 = new THREE.Mesh(geometry, material);
    this.cube2.castShadow = true;
    this.cube2.position.x = 1;
    this.scene.add(this.cube2);

    var planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 32);
    var planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = 80;
    this.plane.position.y = -1;
    this.plane.receiveShadow = true;

    this.scene.add(this.plane);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    ambientLight.castShadow = true;
    this.scene.add(ambientLight);
    var light = new THREE.SpotLight(0xffffff, 0.8);

    light.position.set(0, 2, 0);
    light.castShadow = true;
    var lightHelper = new THREE.SpotLightHelper(light);
    this.scene.add(light);
    this.scene.add(lightHelper);
    this.start();
  }
  componentWillUnmount() {
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
    this.cube.rotation.x += 0.04;
    this.cube.rotation.y += 0.01;
    //this.camera.target.position.copy(this.cube);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.x += 0.2;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };
  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };
  render() {
    return (
      <div
        style={{ width: window.innerWidth, height: window.innerHeight }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}
export default App;
