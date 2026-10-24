import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
async function init(){
const assetBase=new URL('./',import.meta.url);
const draco=new DRACOLoader();draco.setDecoderPath(new URL('draco/',assetBase).href);
const loader=new GLTFLoader();loader.setDRACOLoader(draco);
const textureLoader=new THREE.TextureLoader();
const textures=await Promise.all(['black-16','grey-2','yellow-3'].map(n=>textureLoader.loadAsync(new URL(`matcap/${n}.jpg`,assetBase).href)));
textures.forEach(t=>t.colorSpace=THREE.SRGBColorSpace);
const model=await loader.loadAsync(new URL('bb.glb',assetBase).href);
const bear=model.scene.getObjectByName('bear');
if(!bear)throw new Error('Bear model has no bear node');
bear.traverse(n=>{if(n.isMesh){let t=textures[0];if(/yellow/i.test(n.name))t=textures[2];else if(/grey|spec|glass|eyeball|eyebrow/i.test(n.name))t=textures[1];n.geometry.computeVertexNormals();n.material=/yellow/i.test(n.name)?new THREE.MeshBasicMaterial({color:0xffee00}):new THREE.MeshMatcapMaterial({matcap:t,color:/grey|spec|glass|eyeball|eyebrow/i.test(n.name)?0xb0b0b0:0xdddddd});}});
bear.updateWorldMatrix(true,true);
const box=new THREE.Box3().setFromObject(bear),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
const views=[];let progress={opening:0,contact:0};
function makeView(id,kind){
 const host=document.getElementById(id);if(!host)return;
 try{
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);host.append(renderer.domElement);
  const scene=new THREE.Scene(),group=new THREE.Group(),copy=bear.clone(true);group.add(copy);group.position.copy(center).multiplyScalar(-1);scene.add(group);
  const camera=new THREE.PerspectiveCamera(38,1,.01,1000);
  const view={renderer,scene,camera,host,kind,size,center,group};views.push(view);
  if(kind==='contact')document.getElementById('contact-bear').classList.add('model-ready');
  if(kind==='closeup')document.querySelector('.closeup-layer').classList.add('model-ready');
  return view;
 }catch(error){console.warn('3D view unavailable; retained animated bear fallback.',error.message)}
}
makeView('closeup-model','closeup');makeView('contact-model','contact');
function render(view){
 const {renderer,host,camera,size,scene,kind}=view,width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
 if(view.lastWidth!==width||view.lastHeight!==height){renderer.setSize(width,height,false);view.lastWidth=width;view.lastHeight=height}camera.aspect=width/height;
 const full=size.y/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
 if(kind==='closeup'){
  const q=Math.max(0,Math.min(1,(progress.opening-.35)/.65));const angle=-1.3+q*2.4;
  const distance=full*(.23+q*.18);
  camera.position.set(Math.sin(angle)*distance,size.y*(.08+q*.04),Math.cos(angle)*distance);
  camera.lookAt(0,size.y*.12,0);
 }else{
  const distance=full*(kind==='menu'?1.1:1.13)*Math.max(1,1/camera.aspect);
  camera.position.set(distance*.13,size.y*.12,distance);
  camera.lookAt(0,size.y*.02,0);
 }
 camera.updateProjectionMatrix();renderer.render(scene,camera);
}
window.setBearSceneProgress=(opening,contact)=>{progress={opening,contact};views.forEach(view=>{const r=view.host.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&r.width>0)render(view)})};
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;views.forEach(render)})}
addEventListener('resize',schedule);new MutationObserver(schedule).observe(document.querySelector('.nav-overlay'),{attributes:true,attributeFilter:['hidden']});views.forEach(render);
document.body.dataset.modelReady=String(views.length);
window.bearModelInfo={size:size.toArray(),center:center.toArray(),nodes:[],animations:model.animations.map(a=>a.name)};
bear.traverse(n=>{if(n.isMesh)window.bearModelInfo.nodes.push(n.name)});
draco.dispose();

}
init().catch(error=>{document.body.dataset.modelReady='error';console.warn('3D bear could not load; animated fallback retained.',error.message)});
