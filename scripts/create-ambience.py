"""Render an original 16-bar lounge cue. Requires NumPy and ffmpeg; not needed at runtime."""
from pathlib import Path
import numpy as np
import wave, subprocess, tempfile
RATE=32000
BPM=74
BEAT=60/BPM
BARS=16
LENGTH=BARS*4*BEAT
N=round(LENGTH*RATE)
rng=np.random.default_rng(41)
track=np.zeros((N,2),dtype=np.float64)
def midi(n): return 440*2**((n-69)/12)
def add(signal,when,level,pan=0):
 start=round(when*RATE)
 indices=(start+np.arange(len(signal)))%N
 left=np.sqrt((1-pan)/2)*level;right=np.sqrt((1+pan)/2)*level
 np.add.at(track[:,0],indices,signal*left)
 np.add.at(track[:,1],indices,signal*right)
def keys(note,when,level=.13,pan=0,duration=3.4):
 t=np.arange(round(duration*RATE))/RATE;f=midi(note)
 # Warm tine/piano partials with a soft felt attack, slight beating and natural decay.
 env=(1-np.exp(-t*42))*np.exp(-t/1.6)
 sig=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.002*t)*np.exp(-t/.8)+.09*np.sin(2*np.pi*f*3*t)*np.exp(-t/.5)+.045*np.sin(2*np.pi*f*4.001*t)*np.exp(-t/.4))
 sig*=env;sig*=np.minimum(1,(duration-t)/.12)
 add(sig,when,level,pan)
def bass(note,when,level=.13):
 duration=1.3;t=np.arange(round(duration*RATE))/RATE;f=midi(note)
 sig=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2*t))*np.exp(-t*3.6)*(1-np.exp(-t*120))
 add(sig,when,level,-.08)
def brush(when,level=.009):
 duration=.16;t=np.arange(round(duration*RATE))/RATE
 noise=rng.normal(0,1,len(t));noise=np.diff(noise,prepend=noise[0]);noise=np.convolve(noise,np.ones(5)/5,mode='same')
 add(noise*np.exp(-t*28)*(1-np.exp(-t*800)),when,level,.25)
def kick(when):
 t=np.arange(round(.28*RATE))/RATE
 sig=np.sin(2*np.pi*(49*t+2*(1-np.exp(-t*24))))*np.exp(-t*19)*(1-np.exp(-t*150))
 add(sig,when,.022,-.1)
# Original voicings on a common lounge harmonic vocabulary; no sampled recordings.
chords=[([60,64,67,71,74],36),([60,64,67,71,76],33),([60,65,69,72,76],38),([59,64,65,69,74],43),([60,64,67,71,74],36),([59,62,66,69,73],35),([60,65,69,72,76],38),([59,63,65,69,74],43)]*2
melody={1:[(1.5,79),(3.25,76)],3:[(2.5,74),(3.5,71)],5:[(1.5,78),(3.25,76)],7:[(2.5,74)],9:[(1.5,83),(3.25,79)],11:[(2.5,77),(3.5,74)],13:[(1.5,78),(3.25,76)],15:[(2.5,74),(3.5,71)]}
for bar,(voicing,root) in enumerate(chords):
 base=bar*4*BEAT
 for beat,gain in [(0,.068),(2.65,.043)]:
  for j,note in enumerate(voicing): keys(note,base+(beat+j*.018)*BEAT,gain,(j-2)*.15)
 for beat,note,vol in [(0,root,.14),(1.6,root+7,.065),(2.65,root+12,.075),(3.5,root+7,.05)]: bass(note,base+beat*BEAT,vol)
 for beat in [0,.66,1,1.66,2,2.66,3,3.66]: brush(base+beat*BEAT,.012 if beat in [1,3] else .006)
 kick(base);kick(base+2*BEAT)
 for beat,note in melody.get(bar,[]):keys(note,base+beat*BEAT,.032,.22,2.8)
# Circular stereo room reflections preserve a continuous loop boundary.
dry=track.copy()
for delay,gain in [(.083,.11),(.137,.09),(.229,.07),(.347,.045),(.53,.03)]:
 shift=round(delay*RATE)
 track[:,0]+=np.roll(dry[:,1],shift)*gain
 track[:,1]+=np.roll(dry[:,0],shift+113)*gain
track=np.tanh(track*.85)
peak=np.max(np.abs(track));track*=.67/max(peak,1e-9)
rms=float(np.sqrt(np.mean(track**2)))
root=Path(__file__).resolve().parent.parent
out=root/'assets/kenny/kenny-lounge.mp3'
with tempfile.TemporaryDirectory() as tmp:
 wav=Path(tmp)/'ambience.wav'
 with wave.open(str(wav),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE);f.writeframes((track*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','160k','-metadata','title=An Evening at Kenny','-metadata','artist=Kenny Kitchen — original procedural composition',str(out)],check=True)
print(f'Original loop exported: {LENGTH:.2f}s, peak {np.max(np.abs(track)):.3f}, RMS {rms:.4f}')
