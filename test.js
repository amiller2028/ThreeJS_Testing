var stats,loader;
var meshes = [];
var camera, controls, scene, renderer, plane;

init();
animate();

function init() {

  scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0xcccccc, 0.5);//(color , intensity)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);


  var container = document.getElementById('body');
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-500, 500, 500);//(x, y, z)

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
  controls.enableDamping = true;
  controls.dampingFactor = 0.125;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.2;

  // world
  //create a texture loader object for loading materials
  var textureLoader = new THREE.TextureLoader();

  //cube map
  var path = "cubemap/";
  var format = '.jpg';
  var urls = [
    path + 'sides' + format, path + 'sides' + format,
    path + 'posY' + format, path + 'negY' + format,
    path + 'sides' + format, path + 'sides' + format
  ];

  //standard cube map
   var reflectionCube = new THREE.CubeTextureLoader().load(urls);
   reflectionCube.format = THREE.RGBFormat;

   //refraction cube map
   var refractionCube = new THREE.CubeTextureLoader().load(urls);
   refractionCube.mapping = THREE.CubeRefractionMapping;
   refractionCube.format = THREE.RGBFormat;

  //make backround reflection cube map
  scene = new THREE.Scene();
  //scene.background = reflectionCube;

  //Materials list is pretty cool
  var textureLoader = new THREE.TextureLoader();
  var material = new THREE.MeshPhongMaterial({
    color: 0x21a3bb,
    normalScale: new THREE.Vector2(0.8, 0.8)
  });
  material.side = THREE.DoubleSide;
  var material1 = new THREE.MeshLambertMaterial({
    color: 0xff6600,
    envMap: reflectionCube,
    combine: THREE.MixOperation,
    reflectivity: 0.6
  });
  var material2 = new THREE.MeshLambertMaterial({
    color: 0xffee00,
    envMap: refractionCube,
    refractionRatio: 0.95
  });
  var material3 = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: textureLoader.load("heli/Textures/sh3.jpg"),
    envMap: reflectionCube,
    specularMap: textureLoader.load("heli/Textures/sh3_s.jpg")
  });
  var mat_heli = new THREE.MeshStandardMaterial({
    map: textureLoader.load("heli/Textures/sh3.jpg"),
    lightMap: textureLoader.load("heli/Textures/sh3_s.jpg"),
    envMap: reflectionCube
  });

  //Aluminum Large texture
  var Alum_L = new THREE.MeshStandardMaterial( {
    map: null,
    color: 0xffffff,
    metalness: 1.0,
    shading: THREE.SmoothShading,
    envMap: reflectionCube

  } );
  textureLoader.load( "Material Library/aluminum_bump.jpg", function( map ) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set( 9, 2 );
    Alum_L.roughnessMap = map;
    //Alum_L.bumpMap = map;
    //Alum_L.needsUpdate = true;
  } );

  //Geometry list
  loader = new THREE.CTMLoader();
  /* var meshes; */
  loader.load("camaro/Camaro.ctm", function(geometry) {

    var mesh = new THREE.Mesh(geometry, material1);
    scene.add(mesh);
    meshes['camaro'] = mesh;

  });


  // LIGHTS

  //                                    sky color, ground color, intensity
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  scene.add(hemiLight);

  //var ambient = new THREE.AmbientLight(0xffffff);
  //scene.add(ambient);

  //pointLight = new THREE.PointLight(0xffffff, 2);
  //pointLight.position.set(1, 2, 5);
  //scene.add(pointLight);

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener('resize', onWindowResize, false);

  // GUI
  setupGui();

}

function setupGui() {

    effectController = {

      shininess: 40.0,
      ka: 0.17,
      kd: 0.51,
      ks: 0.2,
      metallic: true,

      hue:		0.121,
      saturation: 0.73,
      lightness:  0.66,

      lhue:		 0.04,
      lsaturation: 0.01,	// non-zero so that fractions will be shown
      llightness:  1.0,

      // bizarrely, if you initialize these with negative numbers, the sliders
      // will not show any decimal places.
      lx: 0.32,
      ly: 0.39,
      lz: 0.7,
      newTess: 15,
      bottom: true,
      lid: true,
      body: true,
      fitLid: false,
      nonblinn: false,
      newShading: "glossy"
    };

    var h;

    var gui = new dat.GUI();

    // material (attributes)

    h = gui.addFolder( "Material control" );

    h.add( effectController, "shininess", 1.0, 400.0, 1.0 ).name( "shininess" ).onChange( render );
    h.add( effectController, "kd", 0.0, 1.0, 0.025 ).name( "diffuse strength" ).onChange( render );
    h.add( effectController, "ks", 0.0, 1.0, 0.025 ).name( "specular strength" ).onChange( render );
    h.add( effectController, "metallic" ).onChange( render );

    // material (color)

    h = gui.addFolder( "Material color" );

    h.add( effectController, "hue", 0.0, 1.0, 0.025 ).name( "hue" ).onChange( render );
    h.add( effectController, "saturation", 0.0, 1.0, 0.025 ).name( "saturation" ).onChange( render );
    h.add( effectController, "lightness", 0.0, 1.0, 0.025 ).name( "lightness" ).onChange( render );

    // light (point)

    h = gui.addFolder( "Lighting" );

    h.add( effectController, "lhue", 0.0, 1.0, 0.025 ).name( "hue" ).onChange( render );
    h.add( effectController, "lsaturation", 0.0, 1.0, 0.025 ).name( "saturation" ).onChange( render );
    h.add( effectController, "llightness", 0.0, 1.0, 0.025 ).name( "lightness" ).onChange( render );
    h.add( effectController, "ka", 0.0, 1.0, 0.025 ).name( "ambient" ).onChange( render );

    // light (directional)

    h = gui.addFolder( "Light direction" );

    h.add( effectController, "lx", -1.0, 1.0, 0.025 ).name( "x" ).onChange( render );
    h.add( effectController, "ly", -1.0, 1.0, 0.025 ).name( "y" ).onChange( render );
    h.add( effectController, "lz", -1.0, 1.0, 0.025 ).name( "z" ).onChange( render );

    h = gui.addFolder( "Tessellation control" );
    h.add( effectController, "newTess", [ 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50 ] ).name( "Tessellation Level" ).onChange( render );
    h.add( effectController, "lid" ).name( "display lid" ).onChange( render );
    h.add( effectController, "body" ).name( "display body" ).onChange( render );
    h.add( effectController, "bottom" ).name( "display bottom" ).onChange( render );
    h.add( effectController, "fitLid" ).name( "snug lid" ).onChange( render );
    h.add( effectController, "nonblinn" ).name( "original scale" ).onChange( render );

    // shading
    h = gui.add( effectController, "newShading", [ "wireframe", "flat", "smooth", "glossy", "textured", "reflective" ] ).name( "Shading" ).onChange( render );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

  stats.update();

  render();

}

function render() {

  renderer.render(scene, camera);

}
