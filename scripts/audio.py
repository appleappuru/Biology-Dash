"""Original subdued sine/brown-noise cues, synthesized with NumPy and SciPy WAV support."""
import numpy as np
import wave
from pathlib import Path
rng=np.random.default_rng(12)
out=Path('public/assets');out.mkdir(parents=True,exist_ok=True)
for name,duration,freq in [('soft',.12,180),('recruit',.25,300),('finish',.65,260)]:
    t=np.arange(int(44100*duration))/44100
    envelope=np.sin(np.pi*t/duration)**2*np.exp(-t/(duration*.45))
    signal=(np.sin(2*np.pi*freq*t)+.15*np.sin(2*np.pi*freq*1.5*t))*envelope*.13
    with wave.open(str(out/(name+'.wav')), 'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(44100);wav.writeframes((signal*32767).astype(np.int16).tobytes())
    print(name,'peak',round(float(abs(signal).max()),4))
