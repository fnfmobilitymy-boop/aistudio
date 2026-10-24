(() => {
  const music=document.querySelector('#kenny-ambience');
  const dock=document.querySelector('.sound-dock');
  const toggle=dock.querySelector('.sound-toggle');
  const settings=dock.querySelector('.sound-settings');
  const panel=document.querySelector('#sound-panel');
  const volumeInput=document.querySelector('#sound-volume');
  const effectsInput=document.querySelector('#sound-effects');
  const status=dock.querySelector('.sound-status');
  let enabled=false,volume=.32,effects=true,context,fxGain,fadeFrame=0,epoch=0;
  try {
    const saved=JSON.parse(localStorage.getItem('kenny-sound-settings')||'null');
    if(saved&&Number.isFinite(saved.volume))volume=Math.max(0,Math.min(1,saved.volume));
    if(saved&&typeof saved.effects==='boolean')effects=saved.effects;
  }catch{}
  music.volume=0;
  volumeInput.value=String(Math.round(volume*100));
  effectsInput.checked=effects;
  function save(){try{localStorage.setItem('kenny-sound-settings',JSON.stringify({volume,effects}))}catch{}}
  function render(){
    document.body.dataset.soundEnabled=String(enabled);
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label',enabled?'关闭背景音乐与交互音效':'开启背景音乐与交互音效');
    dock.querySelector('.sound-label').textContent=enabled?'声音已开':'开启声音';
    dock.classList.toggle('is-playing',enabled&&!music.paused&&!document.hidden&&volume>0);
    document.querySelector('#sound-volume-value').textContent=Math.round(volume*100)+'%';
    if(fxGain&&context)fxGain.gain.setTargetAtTime(enabled&&effects?volume*.28:0,context.currentTime,.04);
  }
  function fadeTo(target,duration=700,done){
    cancelAnimationFrame(fadeFrame);
    const start=music.volume,began=performance.now();
    function step(now){const p=Math.max(0,Math.min(1,(now-began)/duration));music.volume=start+(target-start)*(p*p*(3-2*p));if(p<1)fadeFrame=requestAnimationFrame(step);else done?.()}
    fadeFrame=requestAnimationFrame(step);
  }
  function prepareContext(){
    try{
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!context&&AudioContext){context=new AudioContext();fxGain=context.createGain();fxGain.gain.value=0;fxGain.connect(context.destination)}
      if(context?.state==='suspended')context.resume().catch(()=>{});
    }catch{context=null}
  }
  function note(frequency,when,duration,gain=.12){
    if(!context||!fxGain)return;
    const oscillator=context.createOscillator(),envelope=context.createGain();
    oscillator.type='sine';oscillator.frequency.value=frequency;
    envelope.gain.setValueAtTime(0,when);envelope.gain.linearRampToValueAtTime(gain,when+.008);envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(envelope);envelope.connect(fxGain);oscillator.start(when);oscillator.stop(when+duration+.025);
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect()};
  }
  function cue(kind='tap'){
    if(!enabled||!effects||!context||context.state!=='running'||document.hidden)return;
    const t=context.currentTime;
    if(kind==='welcome'||kind==='success'){[523.25,783.99,1046.5].forEach((f,i)=>note(f,t+i*.075,.48,.075));}
    else if(kind==='slide'){note(698.46,t,.18,.065);note(1046.5,t+.065,.25,.045);}
    else {note(659.25,t,.13,.035);note(1318.5,t,.08,.012)}
  }
  async function enable(){
    const ticket=++epoch;enabled=true;status.textContent='';prepareContext();render();
    try{
      await music.play();
      if(ticket!==epoch||!enabled){if(!enabled)music.pause();return}
      fadeTo(volume,1000);render();cue('welcome');
    }catch{
      if(ticket!==epoch)return;
      enabled=false;cancelAnimationFrame(fadeFrame);music.pause();music.volume=0;
      status.textContent='暂时无法播放，请再点一次开启声音。';render();
    }
  }
  function disable(){const ticket=++epoch;enabled=false;render();fadeTo(0,240,()=>{if(ticket===epoch)music.pause()})}
  toggle.addEventListener('click',()=>{if(enabled)disable();else enable()});
  function closePanel(restore=false){panel.hidden=true;settings.setAttribute('aria-expanded','false');if(restore)settings.focus()}
  settings.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;settings.setAttribute('aria-expanded',String(open));if(open)volumeInput.focus()});
  document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target))closePanel()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){closePanel(true);e.preventDefault()}});
  volumeInput.addEventListener('input',()=>{volume=Number(volumeInput.value)/100;save();if(enabled&&!music.paused)fadeTo(volume,100);render()});
  effectsInput.addEventListener('change',()=>{effects=effectsInput.checked;save();render();if(effects)cue('tap')});
  document.addEventListener('click',e=>{
    if(dock.contains(e.target)||e.target.closest('input,select,textarea'))return;
    const control=e.target.closest('button,a,summary');if(!control)return;
    const slide=control.matches('[data-hero-next],[data-hero-prev],[data-wine-next],[data-wine-prev],[data-wine]');cue(slide?'slide':'tap');
  });
  document.querySelector('#booking-form').addEventListener('submit',()=>{if(!document.querySelector('.booking-success').hidden)cue('success')});
  document.addEventListener('visibilitychange',async()=>{
    if(document.hidden){cancelAnimationFrame(fadeFrame);music.pause();music.volume=0;context?.suspend().catch(()=>{});render();}
    else if(enabled){prepareContext();try{await music.play();if(enabled){fadeTo(volume,700);render()}}catch{enabled=false;render()}}
  });
  music.addEventListener('play',render);music.addEventListener('pause',render);
  addEventListener('pagehide',()=>{music.pause();context?.suspend().catch(()=>{})});
  render();
})();
