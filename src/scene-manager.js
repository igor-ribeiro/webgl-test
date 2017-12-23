import * as THREE from 'three';

import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader';

class SceneManager {
  constructor(rootElement, width, height) {
    this.root = rootElement;
    this.width = width;
    this.height = height;
    this.aspectRatio = width / height;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.objectLoader = new THREE.OBJLoader();

    this.renderer.setSize(width, height);
    this.canvas = this.renderer.domElement;
    this.scene.background = new THREE.Color(0x444444);

    rootElement.appendChild(this.canvas);

    this.camera = null;
    this.model = null;
  }

  setCamera(camera, showHelper = false) {
    this.camera = camera;
    this.camera.position.z = 80;
    this.camera.zoom = 6;
    this.camera.updateProjectionMatrix();

    const helper = new THREE.CameraHelper(camera);

    this.scene.add(camera);
    this.scene.add(helper);
  }

  updateCamera(callback) {
    callback(this.camera);

    this.camera.updateProjectionMatrix();
  }

  addLight(light) {
    if (Array.isArray(light)) {
      light.forEach(l => this.addLight(l));

      return;
    }

    const helper = THREE[`${light.type}Helper`];

    if (helper) {
      light.lookAt(this.scene.position);

      this.scene.add(new helper(light));
    }

    this.scene.add(light);
  }

  addModel(url) {
    this.objectLoader.load(
      url,
      this._onObjectLoaded.bind(this),
      this._onObjectProgress.bind(this),
      this._onObjectError.bind(this)
    );
  }

  updateModel(callback) {
    callback(this.model);

    this.model.needsUpdate = true;
  }

  _onObjectLoaded(object) {
    object.traverse(child => {
      if (child instanceof THREE.Mesh && !this.model) {
        this.model = child;
      }
    });

    this._smoothModel(this.model);

    this.model.scale.set(0.1, 0.1, 0.1);
    this.model.position.y = -1;
    this.model.material = new THREE.MeshPhongMaterial();

    this.scene.add(this.model);
  }

  _onObjectProgress() {
  }

  _onObjectError() {
  }

  _smoothModel(model) {
    const positions = model.geometry.attributes.position.array;
    const vertices = [];

    for (let i = 0, n = positions.length; i < n; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      vertices.push(new THREE.Vector3(x, y, z));
    }

    const faces = [];

    for (let i = 0, n = vertices.length; i < n; i += 3) {
        faces.push(new THREE.Face3(i, i + 1, i + 2));
    }

    const geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    model.geometry.fromGeometry(geometry);
  }

  applyTexture(texture) {
    // const texture = new THREE.TextureLoader().load(url);

    if (!this.model) {
      window.requestAnimationFrame(() => this.applyTexture(texture));

      return;
    }

    this.model.material.map = texture;
    this.model.material.needsUpdate = true;
  }

  render() {
    if (!this.camera) {
      throw new Error('Camera is required.');
    }

    window.requestAnimationFrame(() => this.render());

    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }
}

export default SceneManager;