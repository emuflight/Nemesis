import React, { Component } from "react";
import "three/examples/js/WebGL";
import FCConnector from "../../utilities/FCConnector";

var THREE = require("three");
var STLLoader = require("three-stl-loader")(THREE);

export default class AttitudeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: this.props.size || 500,
      isBxF: this.props.firmwareName !== "RACEFLIGHT"
    };
  }
  handleStatusMessage = message => {
    try {
      let { attitude } = JSON.parse(message.data);
      if (attitude && this.mesh) {
        //rotate the model on the Y axis so it's oriented correctly
        this.mesh.rotation.set(
          attitude.y * 0.017453292519943295 + Math.PI / 2,
          attitude.x * 0.017453292519943295,
          0
        );
        //rotate Yaw from the scene perspective (y) and not the mesh so when the quad model moves it doesn't mess up p/r
        this.scene.rotation.set(0, attitude.z * -1.0 * 0.017453292519943295, 0);
        //rotate Yaw from the scene perspective (y) and not the mesh so when the quad model moves it doesn't mess up p/r
        this.renderer.render(this.scene, this.camera);
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  onWindowResize() {
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.state.size, this.state.size);
  }
  componentDidMount() {
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(0x424242);

    this.camera = new THREE.PerspectiveCamera(100, 1, 1, 400);
    this.camera.position.set(0, 0, 200);
    this.cameraTarget = new THREE.Vector3(0, 0, 90);
    this.camera.lookAt(this.cameraTarget);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);

    this.scene.add(ambientLight);

    // Add scene direct light
    const color = 0xffffff;
    const intensity = 1.2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 400);
    light.target.position.set(0, 0, 90);
    this.scene.add(light);
    this.scene.add(light.target);

    var loader = new STLLoader();
    loader.load(this.props.modelUrl, geometry => {
      //add Model color
      var material = new THREE.MeshStandardMaterial({
        color: 0x2194ce,
        wireframeLinewidth: 1,
        refractionRatio: 0.98,
        wireframe: 1,
        roughness: 1
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);

      this.renderer.render(this.scene, this.camera);
    });
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0); // transparent background
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.state.size, this.state.size);
    this.refs.modelContainer.appendChild(this.renderer.domElement);
    FCConnector.webSockets.addEventListener(
      "message",
      this.handleStatusMessage
    );
    FCConnector.startTelemetry("attitude");
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    FCConnector.stopFastTelemetry();
    FCConnector.webSockets.removeEventListener(
      "message",
      this.handleStatusMessage
    );
  }

  render() {
    return (
      <div
        ref="modelContainer"
        style={{ height: this.state.size, width: this.state.size }}
      />
    );
  }
}
