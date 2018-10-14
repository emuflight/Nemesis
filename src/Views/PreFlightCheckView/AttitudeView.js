import React, { Component } from "react";
import "three/examples/js/WebGL";
import FCConnector from "../../utilities/FCConnector";

var THREE = require("three");
var STLLoader = require("three-stl-loader")(THREE);

export default class AttitudeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  handleGyroData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "attitude") {
        this.mesh.rotation.set(
          telemetry.y * 0.017453292519943295 + Math.PI / 2,
          telemetry.x * 0.017453292519943295,
          0
        );
        //rotate Yaw from the scene perspective (y) and not the mesh so when the quad model moves it doesn't mess up p/r
        this.scene.rotation.set(0, telemetry.z * 0.017453292519943295, 0);
        this.renderer.render(this.scene, this.camera);
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  onWindowResize() {
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(300, 300);
  }
  componentDidMount() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x424242);
    this.scene.fog = new THREE.Fog(0x424242, 2, 15);

    this.camera = new THREE.PerspectiveCamera(100, 1, 1, 400);
    this.camera.position.set(0, 0, 200);
    this.cameraTarget = new THREE.Vector3(0, 0, 90);
    this.camera.lookAt(this.cameraTarget);

    var loader = new STLLoader();
    loader.load("assets/gatesman.stl", geometry => {
      console.log(geometry);
      var material = new THREE.MeshNormalMaterial();
      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);

      this.renderer.render(this.scene, this.camera);
    });
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.clearColor(0, 0, 0, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(300, 300);
    this.refs.modelContainer.appendChild(this.renderer.domElement);
    FCConnector.webSockets.addEventListener("message", this.handleGyroData);
    FCConnector.startTelemetry("attitude");
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    FCConnector.webSockets.removeEventListener("message", this.handleGyroData);
    FCConnector.stopTelemetry();
  }

  render() {
    return <div ref="modelContainer" style={{ height: 300, width: 300 }} />;
  }
}
