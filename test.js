var stats, loader;
var meshes = [];
var camera, cubeCamera, controls, scene, renderer, object, sphere, groundMirror;

init();
animate();

function init() {

    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x071721, 0.7); //(color , intensity)

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var container = document.getElementById('body');
    container.appendChild(renderer.domElement);

    //Camera settings
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-50, 50, 50); //(x, y, z)

    //Control settings
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.125;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 15;
    controls.maxDistance = 200;

    // world
    //create a texture loader object for loading materials
    var textureLoader = new THREE.TextureLoader();

    //cube map
    var path = "three.js/examples/textures/cube/skybox/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
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

    // LIGHTS
    // hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);//(sky color, ground color, intensity)
    // scene.add(hemiLight);

    //var ambient = new THREE.AmbientLight(0xffffff);
    //scene.add(ambient);

    pointLight = new THREE.PointLight(0x140bbe, 2);
    pointLight.position.set(250, 250, 250);
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0xda1818, 1);
    pointLight.position.set(-250, 250, -250);
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-100, 250, -100);
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);



    //Create cube camera for generating materials with dynamic cube maps
    //     NOTE: All materials with dynamic cube mapping will need to be
    //     updated in the renderer and request animation frames
    cubeCamera = new THREE.CubeCamera(1, 100, 512);//( near, far, cubeResolution )
    scene.add(cubeCamera);

    // create a texture loader(image loader)
    var textureLoader = new THREE.TextureLoader();

    //Materials list
    var black = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.5,
        metalness: 0.2,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 1
    });
    var glass = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        envMap: reflectionCube,
        opacity: 0.3,
        transparent: true
    });
    var rglass = new THREE.MeshLambertMaterial({
        color: 0xa71b1b,
        envMap: reflectionCube,
        opacity: 0.6,
        transparent: true
    });
    var yglass = new THREE.MeshLambertMaterial({
        color: 0xe3bf23,
        envMap: reflectionCube,
        opacity: 0.6,
        transparent: true
    });
    var red = new THREE.MeshStandardMaterial({
        color: 0x6e1111,
        roughness: 0,
        metalness: 0.1,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 1
    });
    var grey = new THREE.MeshStandardMaterial({
        color: 0x424141,
        roughness: 0,
        metalness: 0.1,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 1
    });
    var leather = new THREE.MeshStandardMaterial({
        color: 0x825937,
        roughness: 0.8,
        metalness: 0.2,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 0.2
    });
    var lights = new THREE.MeshStandardMaterial({
        color: 0xb31515,
        emissive: 0xb31515,
        emissiveIntensity: 1,
        roughness: 0.02,
        metalness: 0.3,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 0.5
    });
    var black_shiny = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.02,
        metalness: 0.5,
        opacity: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube,
        envMapIntensity: 1
    });
    var Alum_L = new THREE.MeshStandardMaterial({
        color: 0xb6b6b6,
        metalness: 1,
        shading: THREE.SmoothShading,
        envMap: reflectionCube
    });
    var shiny_floor = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        envMap: cubeCamera.renderTarget,
        reflectivity: 0.2,
        shading: THREE.SmoothShading
    });

    //Geometry list
    loader = new THREE.CTMLoader();

    var planeGeo = new THREE.PlaneBufferGeometry( 10000, 10000);

  				// MIRROR planes
  				groundMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: 2048, textureHeight: 2048, color: 0x777777, opacity: 0.2} );

  				var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
  				mirrorMesh.add( groundMirror );
  				mirrorMesh.rotateX( - Math.PI / 2 );
  				scene.add( mirrorMesh );


    // loader.load("camaro/Camaro.ctm", function(geometry) {
    //     var mesh = new THREE.Mesh(geometry, shiny_floor);
    //     scene.add(mesh);
    //     meshes['camaro'] = mesh;
    // });
    loader.load("car/body.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, red);
        scene.add(mesh);
        meshes['body'] = mesh;
    });
    loader.load("car/breaks.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, grey);
        scene.add(mesh);
        meshes['breaks'] = mesh;
    });
    loader.load("car/glass.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, glass);
        scene.add(mesh);
        meshes['glass'] = mesh;
    });
    loader.load("car/leds.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, lights);
        scene.add(mesh);
        meshes['leds'] = mesh;
    });
    loader.load("car/metal.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, Alum_L);
        scene.add(mesh);
        meshes['metal'] = mesh;
    });
    loader.load("car/red_glass.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, rglass);
        scene.add(mesh);
        meshes['red_glass'] = mesh;
    });
    loader.load("car/yellow_glass.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, yglass);
        scene.add(mesh);
        meshes['yellow_glass'] = mesh;
    });
    loader.load("car/mirrors.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, Alum_L);
        scene.add(mesh);
        meshes['mirrors'] = mesh;
    });
    loader.load("car/seats.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, leather);
        scene.add(mesh);
        meshes['seats'] = mesh;
    });
    loader.load("car/stearingwheel.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, black_shiny);
        scene.add(mesh);
        meshes['stearingwheel'] = mesh;
    });
    loader.load("car/top.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, leather);
        scene.add(mesh);
        meshes['top'] = mesh;
    });
    loader.load("car/trim.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, Alum_L);
        scene.add(mesh);
        meshes['trim'] = mesh;
    });
    loader.load("car/dash.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, black);
        scene.add(mesh);
        meshes['dash'] = mesh;
    });
    loader.load("car/tires.ctm", function(geometry) {
        var mesh = new THREE.Mesh(geometry, black);
        scene.add(mesh);
        meshes['tires'] = mesh;
    });

    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    groundMirror.render();

    stats.update();

    render();

}

function render() {

    groundMirror.visible = true;
    renderer.render(scene, camera);

}
