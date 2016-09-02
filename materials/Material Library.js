import {THREE} from '../three.js-master/build/three.js';

/**
 * Materials Library For THREE.js
 */



 //create a texture loader object for loading materials
 var textureLoader = new THREE.TextureLoader();

 //cube map
 var path = "three.js-master/examples/textures/cube/skybox/";
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
   standardMaterial.roughnessMap = map;
   standardMaterial.bumpMap = map;
   standardMaterial.needsUpdate = true;
 } );
