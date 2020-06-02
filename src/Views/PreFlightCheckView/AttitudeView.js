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
      if (attitude) {
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
    this.scene.background = new THREE.Color(0x424242);
    this.scene.fog = new THREE.Fog(0x424242, 2, 15);

    this.camera = new THREE.PerspectiveCamera(100, 1, 1, 400);
    this.camera.position.set(0, 0, 200);
    this.cameraTarget = new THREE.Vector3(0, 0, 90);
    this.camera.lookAt(this.cameraTarget);

    var loader = new STLLoader();
    loader.load(this.props.modelUrl, geometry => {
      var material = new THREE.MeshNormalMaterial();
      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);

      this.renderer.render(this.scene, this.camera);
    });
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.clearColor(0, 0, 0, 0);
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
    FCConnector.stopTelemetry();
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
