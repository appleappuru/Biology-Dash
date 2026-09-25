/** Original procedural Biology Dash audio. No sampled or third-party sound assets.
 * Director owns musical/density policy; renderer owns Web Audio voices and lifecycle.
 */
import type {PatrolEvent} from './simulation';
export type Cue = 'hug'|'clear'|'bind'|'complement'|'wall'|'growth'|'fungal'|'peptide'|'threat'|'heal'|'reward'|'victory'|'ready'|'cytotoxic'|'noMatch';
export type Bus = 'sfx'|'music'|'focus';
export interface Note {cue:Cue; frequency:number; end?:number; duration:number; gain:number; delay?:number; priority:number; bus:Bus; variant:number;}
export interface AudioOptions {muted:boolean;volume:number;sfxVolume:number;musicVolume:number;}
export const AUDIO_DEFAULTS:AudioOptions={muted:false,volume:.25,sfxVolume:1,musicVolume:.45};
const scale=[0,2,4,7,9,12,14,16];
const hz=(step:number)=>392*2**(step/12);
export class AudioDirector {
    combo=0; lastClear=-Infinity; pending=0; due=Infinity; lastPhrase=-Infinity;
    private times=new Map<Cue,number>();
    private lastCluster=-Infinity;
    constructor(private play:(note:Note)=>void,private random= Math.random){}
    reset(){this.combo=0;this.pending=0;this.due=Infinity;this.lastClear=-Infinity;this.lastPhrase=-Infinity;this.lastCluster=-Infinity;this.times.clear();}
    note(cue:Cue,frequency:number,duration:number,gain:number,priority=1,bus:Bus='sfx',delay=0,end?:number){
        this.play({cue,frequency:frequency*2**((this.random()-.5)*.014),end,duration,gain:gain*(.92+this.random()*.08),priority,bus,delay,variant:Math.floor(this.random()*3)});
    }
    cue(cue:Cue,now:number,deep=false,strength=0){
        const gap=cue==='hug'?.12:cue==='bind'?.16:cue==='peptide'?.22:cue==='threat'?2:cue==='heal'?.4:.2;
        if(now-(this.times.get(cue)??-Infinity)<gap)return;
        this.times.set(cue,now);
        switch(cue){
            case 'hug':this.note(cue,deep?180:270,.17,.16,1,'sfx',0,deep?95:145);break;
            case 'bind':this.note(cue,784,.11,.09);break;
            case 'peptide':this.note(cue,330,.1,.075,1,'sfx',0,490);break;
            case 'complement':[0,4,7].forEach((n,i)=>this.note(cue,hz(n),.2,.08,2,'sfx',i*.055));break;
            case 'wall':this.note(cue,260,.26,.18,3,'focus',0,120);this.note(cue,523,.17,.08,3,'focus',.035);break;
            case 'fungal':this.note(cue,196,.3,.17,3,'focus',0,98);this.note(cue,392,.22,.09,3,'focus',.06);break;
            case 'growth':this.note(cue,440,.22,.13,3,'focus',0,330);this.note(cue,660,.18,.07,3,'focus',.07);break;
            case 'noMatch':this.note(cue,220,.16,.08,3,'focus',0,185);break;
            case 'ready':this.note(cue,659,.18,.07,3,'focus');this.note(cue,784,.18,.05,3,'focus',.055);break;
            case 'threat':this.note(cue,130,.22,.09,2,'sfx',0,115);break;
            case 'heal':[0,7].forEach((n,i)=>this.note(cue,196*2**(n/12),.4,.10,2,'focus',i*.06));break;
            case 'reward':[0,7,12].forEach((n,i)=>this.note(cue,hz(n),.32,.10,3,'focus',i*.08));break;
            case 'victory':[0,4,7,9,12].forEach((n,i)=>this.note(cue,hz(n),.5,.13,4,'focus',i*.13));break;
            case 'cytotoxic':this.note(cue,520,.12,.1,2,'sfx',0,220);break;
        }
        if((cue==='wall'||cue==='growth'||cue==='fungal')&&strength>=.95)this.note('ready',784,.22,.055,3,'focus',.12);
    }
    clearance(now:number){
        this.combo=now-this.lastClear>2?1:Math.min(64,this.combo+1);this.lastClear=now;
        this.pending=Math.min(30,this.pending+1);if(!Number.isFinite(this.due))this.due=Math.max(now+.065,this.lastCluster+.24);
    }
    update(now:number){
        if(!this.pending||now<this.due)return;
        const count=this.pending;this.lastCluster=now;this.pending=0;this.due=Infinity;
        // At most three notes for a whole burst, independent of kill count.
        const notes=Math.min(3,count),step=Math.min(7,Math.floor((this.combo-1)/2));
        for(let i=0;i<notes;i++)this.note('clear',hz(scale[(step+i)%scale.length]),.17,.105/Math.sqrt(notes),1,'sfx',i*.045);
        if(this.combo>=4&&now-this.lastPhrase>1.4){
            this.lastPhrase=now;this.note('clear',hz(scale[step])/2,.4,.065,1,'music');
            this.note('clear',hz(scale[step])*1.5,.3,.035,1,'music',.08);
        }
    }
    event(event:PatrolEvent,now:number,macrophage=false){
        if(event.type==='contact')this.cue('hug',now,macrophage);
        if(event.type==='death'){this.clearance(now);if(event.boss)this.cue('reward',now);}
        if(event.type==='tag')this.cue('bind',now);
        if(event.type==='complement')this.cue('complement',now);
        if(event.type==='medicine')this.cue(event.affected===0?'noMatch':event.cause==='doxycycline'?'growth':event.cause==='micafungin'?'fungal':'wall',now,false,event.charge);
        if(event.type==='hit'&&event.cause==='defensin')this.cue('peptide',now);
        if(event.type==='gate'||event.type==='summon')this.cue('heal',now);
        if(event.type==='loss'||event.type==='boss')this.cue('threat',now);
    }
}
interface Voice {end:number;priority:number;gain:GainNode;sources:OscillatorNode[];stop:()=>void;}
export class BioAudio {
    context?:AudioContext;private master?:GainNode;private sfx?:GainNode;private music?:GainNode;private focus?:GainNode;
    private generation=0;
    private voices:Voice[]=[];private charge?:{sources:OscillatorNode[];gain:GainNode;start:number;ready:boolean};
    options:AudioOptions={...AUDIO_DEFAULTS};
    stats={played:0,dropped:0,peakVoices:0,chargeStarts:0,chargeStops:0};
    readonly director=new AudioDirector(note=>this.play(note));
    get activeVoices(){return this.voices.length;}
    get charging(){return !!this.charge;}
    /** Called only from user gestures. The same context is supplied to Phaser. */
    unlock(){
        try{
            if(!this.context){this.context=new AudioContext();this.connect(this.context);}
            if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
        }catch{/* Silent fallback leaves the game fully playable. */}
        return this.context;
    }
    private connect(ctx:AudioContext){
        this.master=ctx.createGain();this.sfx=ctx.createGain();this.music=ctx.createGain();this.focus=ctx.createGain();
        const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3000;filter.Q.value=.5;
        const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.18;
        this.sfx.connect(filter);this.music.connect(filter);this.focus.connect(filter);filter.connect(limiter);limiter.connect(this.master);this.master.connect(ctx.destination);this.configure(this.options);
    }
    configure(options:AudioOptions){
        this.options={...options};const now=this.context?.currentTime??0;
        const safe=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
        for(const node of [this.master,this.sfx,this.music,this.focus])node?.gain.cancelScheduledValues(now);
        this.master?.gain.setTargetAtTime(options.muted?0:safe(options.volume)*.5,now,.015);
        this.sfx?.gain.setTargetAtTime(safe(options.sfxVolume),now,.02);this.focus?.gain.setTargetAtTime(safe(options.sfxVolume),now,.02);this.music?.gain.setTargetAtTime(safe(options.musicVolume),now,.02);
        if(options.muted||options.volume<=0)this.stop();
        else if(options.sfxVolume<=0)this.stopCharge();
    }
    private play(note:Note){
        const ctx=this.context;if(!ctx||(ctx.state!=='running'&&!('startRendering' in ctx))||this.options.muted||this.options.volume<=0||(note.bus==='music'?this.options.musicVolume:this.options.sfxVolume)<=0)return;
        this.prune();
        if(this.voices.length>=8){const victim=this.voices.reduce((a,b)=>a.priority<b.priority?a:b);if(victim.priority>=note.priority){this.stats.dropped++;return;}victim.stop();this.voices=this.voices.filter(v=>v!==victim);}
        const at=ctx.currentTime+(note.delay??0),end=at+note.duration;
        const gain=ctx.createGain();gain.gain.value=0;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(note.gain,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,end);gain.gain.setValueAtTime(0,end+.01);
        gain.connect(note.bus==='music'?this.music!:note.bus==='focus'?this.focus!:this.sfx!);
        const sources:OscillatorNode[]=[];
        for(let i=0;i<2;i++){
            const osc=ctx.createOscillator(),level=ctx.createGain();
            const tactile=['hug','threat','wall','fungal','peptide','cytotoxic'].includes(note.cue);
            osc.type=i===0?'sine':tactile?'triangle':'sine';
            const ratio=i===0?1:tactile?1.5:2+(note.variant===2?.003:0);
            osc.frequency.setValueAtTime(note.frequency*ratio,at);if(note.end)osc.frequency.exponentialRampToValueAtTime(note.end*ratio,end);
            level.gain.value=i===0?.8:.13;osc.connect(level);level.connect(gain);osc.start(at);osc.stop(end+.025);osc.onended=()=>{osc.disconnect();level.disconnect();};sources.push(osc);
        }
        const voice:Voice={end:end+.03,priority:note.priority,gain,sources,stop:()=>{gain.gain.cancelAndHoldAtTime(ctx.currentTime);gain.gain.linearRampToValueAtTime(0,ctx.currentTime+.025);sources.forEach(s=>{try{s.stop(ctx.currentTime+.04);}catch{}});setTimeout(()=>gain.disconnect(),70);}};
        this.voices.push(voice);this.stats.played++;this.stats.peakVoices=Math.max(this.stats.peakVoices,this.voices.length);
        sources[0].addEventListener('ended',()=>{gain.disconnect();this.voices=this.voices.filter(v=>v!==voice);});
        if(note.priority>=3){this.sfx!.gain.cancelScheduledValues(ctx.currentTime);this.sfx!.gain.setTargetAtTime(this.options.sfxVolume*.55,ctx.currentTime,.015);this.sfx!.gain.setTargetAtTime(this.options.sfxVolume,end+.06,.12);this.music!.gain.cancelScheduledValues(ctx.currentTime);this.music!.gain.setTargetAtTime(this.options.musicVolume*.5,ctx.currentTime,.02);this.music!.gain.setTargetAtTime(this.options.musicVolume,end+.1,.15);}
    }
    private prune(){const now=this.context?.currentTime??0;this.voices=this.voices.filter(v=>v.end>now);}
    event(event:PatrolEvent,macrophage=false){if(this.options.muted||this.options.volume<=0)return;this.director.event(event,this.context?.currentTime??0,macrophage);}
    cue(cue:Cue){const ctx=this.context;if(ctx?.state==='suspended'&&!('startRendering' in ctx)){const requested=performance.now(),generation=this.generation;void ctx.resume().then(()=>{if(this.generation===generation&&performance.now()-requested<250&&!this.options.muted)this.director.cue(cue,ctx.currentTime);}).catch(()=>{});}else this.director.cue(cue,ctx?.currentTime??0);}
    update(charging=false,progress=0){
        const ctx=this.context;if(!ctx)return;this.prune();this.director.update(ctx.currentTime);
        if(!charging||this.options.muted||this.options.volume<=0||this.options.sfxVolume<=0||(ctx.state!=='running'&&!('startRendering' in ctx))){this.stopCharge();return;}
        if(!this.charge){
            const gain=ctx.createGain();gain.gain.value=0;gain.connect(this.sfx!);const sources=[ctx.createOscillator(),ctx.createOscillator()];
            sources.forEach((o,i)=>{o.type='sine';o.frequency.value=196*(i?1.5:1);o.connect(gain);o.start();});this.charge={sources,gain,start:ctx.currentTime,ready:false};this.stats.chargeStarts++;
        }
        const q=this.charge,p=Math.max(0,Math.min(1,progress));
        q.sources.forEach((o,i)=>o.frequency.setTargetAtTime((196+98*p)*(i?1.5:1),ctx.currentTime,.045));
        // Settles to a whisper if the player holds beyond readiness; no repeated ready ping.
        q.gain.gain.setTargetAtTime((.004+.014*p)*(ctx.currentTime-q.start>2.2?.45:1),ctx.currentTime,.06);
        if(p>=.98&&!q.ready){q.ready=true;this.director.cue('ready',ctx.currentTime);}
    }
    stopCharge(){const q=this.charge,ctx=this.context;if(!q||!ctx)return;this.charge=undefined;this.stats.chargeStops++;q.gain.gain.cancelScheduledValues(ctx.currentTime);q.gain.gain.setTargetAtTime(0,ctx.currentTime,.008);q.sources.forEach(o=>{o.stop(ctx.currentTime+.04);o.onended=()=>o.disconnect();});setTimeout(()=>q.gain.disconnect(),70);}
    stop(){this.generation++;this.stopCharge();for(const voice of this.voices)voice.stop();this.voices=[];this.director.reset();}
}
export const bioAudio=new BioAudio();
