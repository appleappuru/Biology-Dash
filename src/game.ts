import {bioAudio} from './audio';
import * as Phaser from 'phaser';
import { Patrol, BALANCE, type PatrolEvent, type GateOption, type GateLane } from './simulation';
import { PATHOGENS, ANTIBODY_NAMES, medicineEffect, medicineStyle } from './content';



export interface GameHooks {
    tick: (p: Patrol) => void;
    event: (text: string) => void;
    finish: (p: Patrol) => void;
    pause: () => void;
    gesture: () => void;
}
interface CellView { boundId?:number; node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse; digest: Phaser.GameObjects.Image; vesicle: Phaser.GameObjects.Graphics; membrane: Phaser.GameObjects.Graphics; birth: number }
interface EnemyView { preview: Phaser.GameObjects.Graphics; node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; health: Phaser.GameObjects.Rectangle; tag: Phaser.GameObjects.Text; label: Phaser.GameObjects.Text; status: Phaser.GameObjects.Text; row: number; hitUntil: number; lastX: number; heading: number }
interface GateView { node: Phaser.GameObjects.Container; panels: Phaser.GameObjects.Container[] }
/** One orthographic-style perspective shared by sprites, gates, ground and input. */
export function project(x: number, y: number) {
    const scale = .56 + .44 * Phaser.Math.Clamp(y / 780, 0, 1);
    return { x: 210 + (x - 210) * scale, y: 76 + y * .84, scale };
}

export function breachThreats(p: Patrol) {
    return p.phase==='playing' ? p.enemies.filter(e=>e.hp>0 && e.y<=BALANCE.breachY &&
            (BALANCE.breachY-e.y)/(e.boss?30:PATHOGENS.find(k=>k.id===e.kind)!.speed)<=2.5 &&
            !p.cells.some(c=>c.targetId===e.id && c.phase==='wrap'))
            .sort((a,b)=>(BALANCE.breachY-a.y)/(a.boss?30:PATHOGENS.find(k=>k.id===a.kind)!.speed)-
                (BALANCE.breachY-b.y)/(b.boss?30:PATHOGENS.find(k=>k.id===b.kind)!.speed)) : [];
}
export function breachWarning(p: Patrol, threats=breachThreats(p)) {
    const nearest=threats[0];
    if(!nearest)return '';
    const direction=nearest.x<p.x-45?'← LEFT':nearest.x>p.x+45?'RIGHT →':'HERE';
    return `INTERCEPT ${direction} · ${threats.length} NEAR TISSUE`;
}

export class PatrolScene extends Phaser.Scene {
    patrol!: Patrol;
    hooks!: GameHooks;
    held = false;
    medicineKeyHeld = false;
    dragX = 0;
    dragY = 0;
    dragStart = 0;
    dragStartY = 640;
    paused = true;
    finished = false;
    lastTeamworkCue = -Infinity;
    teamworkAnnounced = false;
    reducedMotion = false;
    views = new Map<number, EnemyView>();
    gateViews = new Map<number, GateView>();
    cells: CellView[] = [];
    zone!: Phaser.GameObjects.Graphics;
    molecules!: Phaser.GameObjects.Graphics;
    breachMarkers!: Phaser.GameObjects.Graphics;
    tissueLabel!: Phaser.GameObjects.Text;
    showReach = false;
    ground!: Phaser.GameObjects.Graphics;
    bg!: Phaser.GameObjects.Image;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    lastSquad = 0;
    scroll = 0;
    constructor() { super('Patrol'); }
    startupFailed = false;
    preload() {
        this.load.on('loaderror', (file: Phaser.Loader.File) => { if (['defenders-v2','enemies-v2','microbes-v3','tissue-v2'].includes(file.key)) this.startupFailed = true; });
        this.load.spritesheet('defenders-v2', 'assets/defenders-simple-v1.svg', {frameWidth:128, frameHeight:128});
        this.load.image('enemies-v2', 'assets/enemies-v2.png');
        this.load.image('microbes-v3', 'assets/microbes-v3.png');
        this.load.image('tissue-v2', 'assets/tissue-perspective-v2.png');
    }
    create() {
        if(this.startupFailed)return;
        for (const [key, rows] of [['enemies-v2', 5], ['microbes-v3', 4]] as const) {
            const texture = this.textures.get(key), source = texture.getSourceImage();
            for (let row = 0; row < rows; row++) for (let col = 0; col < 4; col++) {
                const x = Math.round(col * source.width / 4), y = Math.round(row * source.height / rows);
                texture.add(row * 4 + col, 0, x, y, Math.round((col + 1) * source.width / 4) - x, Math.round((row + 1) * source.height / rows) - y);
            }
        }
        this.bg = this.add.image(210, 390, 'tissue-v2').setDisplaySize(420, 780);
        this.add.rectangle(210, 390, 420, 780, 0x071e29, .1);
        this.ground = this.add.graphics();
        this.zone = this.add.graphics().setDepth(2);
        this.molecules = this.add.graphics().setDepth(860);
        this.breachMarkers = this.add.graphics().setDepth(865);
        const line = this.add.graphics().setDepth(3);
        const a = project(20, BALANCE.breachY), b = project(400, BALANCE.breachY);
        line.lineStyle(2, 0xedb19d, .7).lineBetween(a.x, a.y, b.x, b.y);
        this.tissueLabel = this.add.text(210, a.y + 14, 'TISSUE LINE · BREACH COSTS 1 CELL', { fontFamily: 'Arial', fontSize: '10px', color: '#e2b8ad', letterSpacing: .5, stroke:'#09232c', strokeThickness:3 }).setOrigin(.5).setDepth(866);
        for (let i = 0; i < BALANCE.maxSquad; i++) {
            const shadow = this.add.ellipse(0, 13, 30, 13, 0x00151b, .38);
            const body = this.add.image(0, -4, 'defenders-v2', 0).setDisplaySize(40, 40);
            const vesicle=this.add.graphics(), membrane=this.add.graphics();
            const digest=this.add.image(0,0,'enemies-v2',3).setDisplaySize(18,18).setVisible(false);
            const node = this.add.container(210, 660, [shadow, body, vesicle, digest]).setVisible(false);
            this.cells.push({ node, body, shadow, digest, vesicle, membrane, birth: -1000 });
        }
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.hooks?.gesture();
            this.held = true; this.dragX = p.x; this.dragY = p.y;
            this.dragStart = this.patrol?.x ?? 210; this.dragStartY = this.patrol?.y ?? 640;
        });
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.held || this.paused || !this.patrol) return;
            const scale = project(this.dragStart, this.dragStartY).scale;
            this.patrol.move(this.dragStart + (p.x - this.dragX) / scale, this.dragStartY + (p.y - this.dragY) / .84);
        });
        for (const name of ['pointerup', 'pointerupoutside', 'gameout']) this.input.on(name, this.cancelDrag);
        this.keys = this.input.keyboard!.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,ESC') as typeof this.keys;
        this.input.keyboard!.on('keydown-ESC', () => this.hooks?.pause());
        this.input.keyboard!.on('keydown-SPACE', (event: KeyboardEvent) => { if (!this.paused && !(event.target as HTMLElement)?.closest('button,input,select')) {event.preventDefault();if(!event.repeat)this.medicineKeyHeld=this.patrol?.beginMedicineCharge()??false;} });
        this.input.keyboard!.on('keyup-SPACE', () => { if(this.medicineKeyHeld && !this.paused)this.patrol?.releaseMedicineCharge();this.medicineKeyHeld=false; });
        this.game.canvas.addEventListener('pointercancel', this.cancelDrag);
        this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur);
        const cleanup = () => { this.game.canvas?.removeEventListener('pointercancel', this.cancelDrag); this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur); };
        this.events.once('shutdown', cleanup); this.events.once('destroy', cleanup);
    }
    cancelControls = () => {bioAudio.stop();this.medicineKeyHeld=false;this.patrol?.cancelMedicineCharge();this.cancelDrag();};
    onBlur = () => { this.cancelControls(); if (!this.paused) this.hooks?.pause(); };
    cancelDrag = () => { this.held = false; this.input.keyboard?.resetKeys(); };
    startPatrol(p: Patrol, hooks: GameHooks) {
        this.patrol = p; this.hooks = hooks; this.finished = false; bioAudio.stop();bioAudio.unlock(); this.lastTeamworkCue=-Infinity;this.teamworkAnnounced=false; this.paused = false; this.cancelControls();
        for (const v of this.views.values()) v.node.destroy();
        for (const v of this.gateViews.values()) v.node.destroy();
        this.views.clear(); this.gateViews.clear(); this.lastSquad = 0;
    }
    reaction(event: PatrolEvent) {
        bioAudio.event(event,this.patrol.cells.find(c=>c.id===event.cellId)?.role==='macrophage');
        if (event.type === 'medicine') this.careBurst(event);

        if (event.type === 'hit' && event.enemyId !== undefined) {
            const v = this.views.get(event.enemyId);
            if (v) { v.hitUntil = this.time.now + 170; v.body.setTint(0xf5d6c5); }
        }
        if (event.type === 'engulf') {
            if(event.assistance)this.teamworkCue(event);
        }
        if (event.type === 'death' && event.enemyId !== undefined) {
            const v = this.views.get(event.enemyId);
            if (v) {
                if(event.cause==='phagocytosis'){v.node.destroy();this.views.delete(event.enemyId);}
                else {this.floatFeedback(event.cause==='defensin'?'Membrane disrupted':event.cause==='micafungin'?'Fungal wall disrupted':'Cell wall disrupted',v.node.x,v.node.y-30,0xf4dfbd);this.dismissEnemy(event.enemyId,v,true);}
            }
        }
        if(event.type==='retire' && this.patrol.level===1){const q=project(event.x!,event.y!);this.floatFeedback('Hug complete!',q.x,q.y-75,0xc7ffe4);}
        if (event.type === 'loss') {
            if (!this.reducedMotion) this.cameras.main.shake(90, .0018);
        }
        if (event.type === 'gate' || event.type === 'summon') {
            const p=this.patrol, q=project(p.x,p.y);
            const message=event.label ?? event.text;
            this.floatFeedback(message,q.x,q.y-85,0xd8fff0);
            if (!this.reducedMotion && event.type === 'gate') {
                const wave = this.add.graphics().setDepth(q.y + 10);
                wave.lineStyle(3, 0x8df8cf, .85).strokeEllipse(q.x, q.y, 85, 42);
                this.tweens.add({ targets: wave, scaleX: 1.7, scaleY: 1.7, alpha: 0, duration: 420, onComplete: () => wave.destroy() });
            }
        }
        if (event.type === 'loss' && event.amount) {
            const q=project(this.patrol.x,this.patrol.y);
            this.floatFeedback((event.amount! > 0 ? '+' : '') + event.amount + ' cells',q.x,q.y-50,event.amount! > 0 ? 0xb5ffe0 : 0xffb6aa);
        }
        if (!['hit', 'death', 'engulf', 'tag', 'contact'].includes(event.type)) this.hooks.event(event.text);
    }
    teamworkCue(event: PatrolEvent) {
        const actor=this.patrol.cells.find(c=>c.id===event.cellId);
        if(!actor)return;
        if(!this.teamworkAnnounced){
            this.teamworkAnnounced=true;
            this.hooks.event('Tag + catch! Finish the patrol for a 10-Coin teamwork bonus.');
        }
        // Keep crowded fights readable: at most one local celebration per two seconds.
        if(this.time.now-this.lastTeamworkCue<2000)return;
        this.lastTeamworkCue=this.time.now;
        const q=project(actor.x,actor.y);
        const label=event.assistance==='complement'?'Grip + catch!':'Tag + catch!';
        const badge=this.add.container(Phaser.Math.Clamp(q.x,80,340),q.y-39).setDepth(q.y+80).setName('teamwork-cue');
        const plate=this.add.rectangle(0,0,140,27,0x224941,.96).setStrokeStyle(1,0xc7efb5);
        const text=this.add.text(0,0,'♥ '+label,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#e4ffd9'}).setOrigin(.5);
        badge.add([plate,text]);
        if(!this.reducedMotion){
            badge.setScale(.85);this.tweens.add({targets:badge,scale:1,duration:200,ease:'Back.Out'});
            for(let i=0;i<3;i++){
                const heart=this.add.text(q.x+(i-1)*12,q.y-5,'♥',{fontFamily:'Arial',fontSize:'12px',color:'#c6f3ca'}).setOrigin(.5).setDepth(q.y+79);
                this.tweens.add({targets:heart,y:q.y-30-i*6,x:heart.x+(i-1)*7,alpha:0,duration:650,delay:i*65,onComplete:()=>heart.destroy()});
            }
        }
        this.tweens.add({targets:badge,alpha:0,delay:900,duration:this.reducedMotion?0:250,onComplete:()=>badge.destroy()});
    }
    careBurst(event: PatrolEvent) {
        const med=medicineStyle(event.cause && event.cause!=='phagocytosis' && event.cause!=='defensin'?event.cause:this.patrol.medicine);
        const reduced=this.reducedMotion;
        const charge=event.charge??0;
        // An external care-package emblem is a UI metaphor, not a literal drug route or cell weapon.
        const banner=this.add.container(210,182).setDepth(1800);
        const ribbon=this.add.graphics().fillStyle(0x092b39,.96).fillRoundedRect(-150,-35,300,70,22).lineStyle(2,med.color,.95).strokeRoundedRect(-150,-35,300,70,22);
        const pod=this.add.graphics().fillStyle(med.color).fillRoundedRect(-134,-25,47,50,17).fillStyle(0xffffff,.75).fillRoundedRect(-130,-22,39,18,12);
        pod.fillStyle(0x173945).fillCircle(-121,3,2.5).fillCircle(-102,3,2.5).lineStyle(2,0x173945).beginPath().arc(-111,7,5,0,Math.PI).strokePath();
        pod.fillStyle(0xf197ae,.8).fillEllipse(-126,9,6,3).fillEllipse(-97,9,6,3);
        const title=this.add.text(-73,-22,med.nickname,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#f0fff7'});
        const label=this.add.text(-73,7,Math.round(3+charge*3)+'s · '+(med.effect==='inhibit'?'GROWTH PAUSE':'WALL BREAK'),{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#'+med.color.toString(16)});
        banner.add([ribbon,pod,title,label]);
        if(!reduced){banner.setScale(.82);this.tweens.add({targets:banner,scale:1,duration:260,ease:'Back.Out'});}
        this.tweens.add({targets:banner,alpha:0,delay:1400,duration:reduced?0:280,onComplete:()=>banner.destroy()});
        const wave=this.add.graphics().setPosition(210,390).setDepth(850).lineStyle(3+charge*3,med.color,.7).strokeEllipse(0,0,120+charge*180,80+charge*120);
        this.tweens.add({targets:wave,scaleX:reduced?1:1.6,scaleY:reduced?1:1.6,alpha:0,duration:reduced?350:650,onComplete:()=>wave.destroy()});
        for(const enemy of this.patrol.enemies){
            const reaction=enemy.medicineReaction;
            if(!reaction || reaction.id!==med.id)continue;
            const q=project(enemy.x,enemy.y);
            const stamp=this.add.container(q.x,q.y).setDepth(q.y+40);
            const ink=this.add.graphics();
            if(reaction.effective){
                ink.lineStyle(3,med.color,.95);
                if(med.effect==='inhibit'){
                    ink.fillStyle(0x253a49,.92).fillRoundedRect(-13,-15,26,30,9);
                    ink.lineBetween(-5,-7,-5,7).lineBetween(5,-7,5,7);
                }else{
                    // Broken contour represents cell-wall stress; no arbitrary blast damage.
                    ink.beginPath().arc(0,0,27,.15,1.2).strokePath().beginPath().arc(0,0,27,1.8,3).strokePath().beginPath().arc(0,0,27,3.6,5.4).strokePath();
                    ink.lineBetween(4,-29,-2,-18).lineBetween(-2,-18,5,-12);
                }
                if(!reduced)for(let i=0;i<4;i++){
                    const angle=i*Math.PI/2+enemy.id;
                    const spark=this.add.star(0,0,4,2,5,med.color).setDepth(q.y+41).setPosition(q.x,q.y);
                    this.tweens.add({targets:spark,x:q.x+Math.cos(angle)*43,y:q.y+Math.sin(angle)*43,alpha:0,scale:.4,duration:600,onComplete:()=>spark.destroy()});
                }
            }else{
                // Incompatible medication gets a quiet deflection mark, not an invincibility shield.
                ink.lineStyle(2,0xb2bbc3,.9).lineBetween(-9,-9,9,9).lineBetween(9,-9,-9,9);
            }
            stamp.add(ink);
            this.tweens.add({targets:stamp,alpha:0,scale:reduced?1:1.25,delay:reduced?700:250,duration:reduced?0:600,onComplete:()=>stamp.destroy()});
        }
    }
    floatFeedback(message: string, x: number, y: number, color: number) {
        const text=this.add.text(Phaser.Math.Clamp(x,95,325),y,message,{fontFamily:'Arial',fontSize:message.length>18?'11px':'20px',fontStyle:'bold',color:'#'+color.toString(16),stroke:'#09242c',strokeThickness:4,align:'center',wordWrap:{width:180}}).setOrigin(.5).setDepth(1000);
        this.tweens.add({targets:text,y:y-(this.reducedMotion?0:28),alpha:0,delay:600,duration:this.reducedMotion?1:500,onComplete:()=>text.destroy()});
    }
    dismissEnemy(id: number, v: EnemyView, defeated: boolean) {
        this.views.delete(id); v.health.setVisible(false); v.tag.setVisible(false);
        v.body.clearTint().setFrame(v.row * 4 + 3);
        if (this.reducedMotion) { v.node.destroy(); return; }
        this.tweens.add({ targets: v.node, alpha: 0, scaleX: defeated ? .5 : 1, scaleY: defeated ? .18 : 1, y: v.node.y + (defeated ? 8 : 30), duration: defeated ? 340 : 160, onComplete: () => v.node.destroy() });
    }
    update(time: number, delta: number) {
        if (!this.patrol) return;
        if (this.finished) return;
        const p = this.patrol, dt = Math.min(delta / 1000, .05);
        if (!this.paused && !this.finished) {
            let dx = 0, dy = 0;
            if (this.keys.LEFT.isDown || this.keys.A.isDown) dx--;
            if (this.keys.RIGHT.isDown || this.keys.D.isDown) dx++;
            if (this.keys.UP.isDown || this.keys.W.isDown) dy--;
            if (this.keys.DOWN.isDown || this.keys.S.isDown) dy++;
            if (dx || dy) { const k = dx && dy ? Math.SQRT1_2 : 1; p.move(p.x + dx * dt * 255 * k, p.y + dy * dt * 210 * k); }
            p.step(dt);
            for (const event of p.drainEvents()) this.reaction(event);
            bioAudio.update(p.chargingMedicine,p.medicineCharge);
            this.hooks.tick(p);
            if (p.phase !== 'playing') {
                this.drawGround(); this.drawSquad(time); this.drawEnemies(time); this.drawGates(); this.drawBreachWarnings();
                this.endPatrol(); return;
            }
        }
        if (!this.paused && !this.reducedMotion) this.scroll = (this.scroll + dt * 25) % 70;
        this.drawGround(); this.drawSquad(time); this.drawEnemies(time); this.drawGates(); this.drawBreachWarnings();
    }
    drawBreachWarnings() {
        const p=this.patrol;
        this.breachMarkers.clear();
        // Travel-time horizon is a visual cue, not a prediction of combat outcomes.
        const threats=breachThreats(p);
        const nearest=threats[0];
        if(!nearest){
            if(this.tissueLabel.text!=='TISSUE LINE · BREACH COSTS 1 CELL')this.tissueLabel.setText('TISSUE LINE · BREACH COSTS 1 CELL').setFontSize(10).setColor('#e2b8ad');
            return;
        }
        const warning=breachWarning(p,threats);
        if(this.tissueLabel.text!==warning)this.tissueLabel.setText(warning).setFontSize(13).setColor('#ffe0b5');
        // No blinking, pulsing or extra audio; the same marks work with reduced motion.
        for(const e of threats.slice(0,3)){
            const q=project(e.x,e.y),radius=(e.boss?51:33)*q.scale;
            this.breachMarkers.lineStyle(2,0xffd3a1,.95).beginPath().arc(q.x,q.y,radius,.15,Math.PI-.15).strokePath();
            const y=project(e.x,BALANCE.breachY).y;
            this.breachMarkers.lineStyle(3,0xffd3a1,1).lineBetween(q.x-5,y-8,q.x,y-3).lineBetween(q.x,y-3,q.x+5,y-8);
        }
    }
    endPatrol() {
        if (this.finished) return;
        this.finished = true; this.cancelControls();
        const won = this.patrol.phase === 'victory';
        bioAudio.stop();bioAudio.cue(won?'victory':'heal');
        document.querySelector('.care-kit')?.classList.add('patrol-ended');
        document.querySelectorAll<HTMLButtonElement>('.care-kit button').forEach(b=>b.disabled=true);
        const shade=this.add.rectangle(210,390,420,780,0x052632,.55).setDepth(1900);
        const title=this.add.text(210,305,won?'HOST PROTECTED!':'TIME TO REGROUP', {fontFamily:'Arial',fontSize:'27px',fontStyle:'bold',color:won?'#c7ffe2':'#f2dfdc',align:'center'}).setOrigin(.5).setDepth(2001);
        const subtitle=this.add.text(210,349,won?'Tiny team. Mighty teamwork.':'Every hero gets another try.',{fontFamily:'Arial',fontSize:'15px',color:'#e1f4ee'}).setOrigin(.5).setDepth(2001);
        const seal=this.add.text(210,225,won?'✦':'♡',{fontFamily:'Arial',fontSize:'68px',color:won?'#ffe2a0':'#d5dcf2'}).setOrigin(.5).setDepth(2001);
        if (!this.reducedMotion) {
            for (const object of [title,subtitle,seal]) { object.setAlpha(0); this.tweens.add({targets:object,alpha:1,y:object.y-8,duration:350,ease:'Cubic.Out'}); }
            if (won) for(let i=0;i<22;i++) {
                const fleck=this.add.rectangle(35+(i*67)%350,195,4,7,i%2?0xb9f2d3:0xffdda1).setDepth(2000);
                this.tweens.add({targets:fleck,x:fleck.x+Math.sin(i)*40,y:440+(i*19)%170,angle:i*47,alpha:0,duration:1100+(i%4)*130,delay:i*18,onComplete:()=>fleck.destroy()});
            }
        }
        // Scene-owned timing cancels automatically on restart/navigation; no duplicate result awards.
        this.time.delayedCall(won?1900:1100,()=>{shade.destroy();title.destroy();subtitle.destroy();seal.destroy();this.hooks.finish(this.patrol);});
    }
    drawGround() {
        this.ground.clear().lineStyle(1, 0x84c7c2, .12);
        for (let i = 0; i < 18; i++) {
            const q = project(38 + ((i * 137.5) % 345), (i * 83.7 + this.scroll) % 710);
            this.ground.fillStyle(0x84c7c2, .12).fillEllipse(q.x, q.y, (3 + i % 4) * q.scale, 2 * q.scale);
        }
        this.zone.clear();
        if (this.showReach) for (const c of this.patrol.cells.filter(c=>c.role!=='plasma' && c.phase==='idle').slice(0,3)) {
            const q=project(c.x,c.y),radius=this.patrol.reach*q.scale;
            for(let a=0;a<Math.PI*2;a+=.24)this.zone.fillStyle(0xc0dbd4,.18).fillCircle(q.x+Math.cos(a)*radius,q.y+Math.sin(a)*radius*.84,1);
        }
    }
    drawSquad(time: number) {
        const p = this.patrol, count = p.squad;
        this.molecules.clear();
        if(p.chargingMedicine && p.phase==='playing'){
            const c=p.medicineCharge,color=p.level<1?0xb8f4d8:medicineStyle(p.medicine).color;
            this.molecules.lineStyle(4,color,.9).beginPath().arc(210,260,24+c*18,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.04,c)).strokePath();
            if(p.level<1){
                const gathered=Math.min(30-p.squad,1+Math.floor(c*3));
                for(let i=0;i<gathered;i++){
                    const x=210+(i-(gathered-1)/2)*17;
                    this.molecules.fillStyle(color,.95).fillCircle(x,260,8);
                    this.molecules.fillStyle(0x427b75,1).fillCircle(x-2,259,3);
                }
            }else this.molecules.fillStyle(color,.25+c*.35).fillCircle(210,260,9+c*13);
        }
        const bound=new Set(this.cells.map(v=>v.boundId).filter(id=>p.cells.some(c=>c.id===id)));
        this.cells.forEach((cell, i) => {
            let actor=p.cells.find(c=>c.id===cell.boundId);
            if(!actor && cell.boundId!==undefined){
                if(cell.node.visible){
                    const ghost=this.add.image(cell.node.x,cell.node.y,'defenders-v2',Number(cell.body.frame.name)).setDisplaySize(p.level===1?110:43,p.level===1?110:43).setDepth(900);
                    this.tweens.add({targets:ghost,alpha:0,scaleX:ghost.scaleX*.6,scaleY:ghost.scaleY*.6,duration:this.reducedMotion?150:400,onComplete:()=>ghost.destroy()});
                }
                cell.node.setVisible(false);cell.boundId=undefined;
            }
            if(!actor){actor=p.cells.find(c=>!bound.has(c.id));if(actor){cell.boundId=actor.id;bound.add(actor.id);cell.birth=time;}}

            cell.membrane.clear();
            if (!actor) {
                if (cell.node.visible && i < this.lastSquad) {
                    const ghost=this.add.image(cell.node.x,cell.node.y,'defenders-v2',Math.floor(Number(cell.body.frame.name)/4)*4+3).setDisplaySize(38,38).setDepth(900);
                    this.tweens.add({targets:ghost,alpha:0,y:ghost.y+12,duration:this.reducedMotion?1:320,onComplete:()=>ghost.destroy()});
                }
                cell.node.setVisible(false); return;
            }
            const q=project(actor.x,actor.y), rank=actor.role==='plasma'?2:actor.role==='macrophage'?1:0;
            const target=p.enemies.find(e=>e.id===actor.targetId);
            if(!cell.node.visible){cell.node.setVisible(true);cell.birth=time;}
            const dx=q.x-cell.node.x;
            const heading=target ? target.x<actor.x-5?1:target.x>actor.x+5?2:0 : Math.abs(dx)>.12?dx<0?1:2:0;
            cell.body.setFrame(rank*4+heading);
            const size=(rank===1?76:rank===2?50:actor.variant==='zip'?42:actor.variant==='scout'?48:45)*(p.level===1?2.68:1);
            const wrap=actor.phase==='wrap', active=actor.phase==='approach'||wrap;
            const flutterRate = rank === 1 ? 8 : rank === 2 ? 11 : 14;
            const deform=this.reducedMotion?0:wrap?Math.sin(actor.progress*Math.PI)*.14:active?Math.sin(p.time*flutterRate+i)*.045:Math.sin(p.time*4+i)*.025;
            const chubbyX = rank === 1 ? 1.08 : 1.0;
            cell.body.setDisplaySize(size*(1+deform)*chubbyX,size*(1-deform*.55));
            const bank = !target && Math.abs(dx) > 0.2 ? Math.max(-7, Math.min(7, dx * 1.2)) : 0;
            cell.body.setAngle(this.reducedMotion?0:active?Math.max(-12,Math.min(12,(target?.x??actor.x)-actor.x))*.5:bank);
            const bob = (this.reducedMotion||this.paused?0:Math.sin(p.time*(active?12:3)+i*1.8)*(active?1.3:.4));
            cell.body.y=-4+bob;
            const shadowScale = Math.max(0.6, 1 - bob * 0.08);
            cell.shadow.setDisplaySize(size * chubbyX * 0.72 * shadowScale, size * 0.26 * shadowScale);
            cell.shadow.setAlpha(0.24 + (active ? 0.08 : 0));
            cell.shadow.y = size * 0.35;
            // Scene uses the same actor positions that decide contact; never a separate visual chase.
            const arrival=this.lastSquad>0?Math.max(0,1-(time-cell.birth)/430):0;
            cell.node.setPosition(q.x,q.y).setScale(q.scale).setDepth(q.y+8).setAlpha(1);
            cell.body.clearTint();
            // White bodies stay white; small symbols distinguish gameplay variants.
            let mark=cell.node.getByName('variant-mark') as Phaser.GameObjects.Text;
            if(!mark){mark=this.add.text(0,-18,'',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#fff8df',stroke:'#203849',strokeThickness:3}).setOrigin(.5).setName('variant-mark');cell.node.add(mark);}
            mark.setText(actor.variant==='neutro'&&(p.upgrades.neutro??0)>0?String(1+(p.upgrades.neutro??0)-(actor.captures??0)):actor.variant==='zip'?'»':actor.variant==='scout'?'◇':'');
            if(arrival>0)cell.body.setTint(0xc7ffe4);
            cell.digest.setVisible(actor.phase==='digest' && !!actor.digestKind);
            cell.vesicle.clear();
            if(actor.phase==='digest' && actor.digestKind){
                const art=PATHOGENS.find(k=>k.id===actor.digestKind)!.art;
                cell.digest.setTexture(art.texture,art.row*4+3).setPosition(0,0).setDisplaySize(18*(1-actor.progress*.75),18*(1-actor.progress*.75)).setAlpha(1-actor.progress);
                cell.vesicle.fillStyle(0xdffdf3,.5).fillCircle(0,0,11).lineStyle(1,0xeafff7,.9).strokeCircle(0,0,11);
                for(let j=0;j<3;j++){const a=j*2.1+(this.reducedMotion?0:actor.progress*2);cell.vesicle.fillStyle(0xa5e3bf,.9).fillCircle(Math.cos(a)*8,Math.sin(a)*8,1.8);}
            }
            if(wrap && target){
                const t=project(target.x,target.y), vx=t.x-q.x,vy=t.y-q.y,d=Math.max(1,Math.hypot(vx,vy)),nx=-vy/d,ny=vx/d;
                const progress=actor.progress, radius=(target.boss?24:16)*q.scale*(p.level===1?2.8:1);
                const contactX=vx-vx/d*radius,contactY=vy-vy/d*radius;
                const color=rank===1?0x65c4bd:0xbadfee;
                cell.membrane.setDepth(Math.max(q.y,t.y)+7);
                // Two connected membrane lobes extend from this cell and curl around this target.
                for(const side of [-1,1]){
                    const points=[];
                    for(let j=0;j<=12;j++){
                        const u=j/12, curl=Math.sin(u*Math.PI)*radius*(rank===1?1.2:1);
                        const end=Math.min(1,progress*2.7);
                        points.push(new Phaser.Math.Vector2(q.x+contactX*u*end+nx*side*curl*end,q.y-4*(1-u*end)+contactY*u*end+ny*side*curl*end));
                    }
                    cell.membrane.lineStyle((rank===1?13:10)*q.scale,color,.92).strokePoints(points,false);
                    cell.membrane.lineStyle(1.3*q.scale,0xf6fff9,.45).strokePoints(points,false);
                }
                if(progress>.3){
                    const nearAngle=Math.atan2(vy,vx)+Math.PI;
                    const closure=Math.min(1,(progress-.3)/.65)*Math.PI;
                    for(const side of [-1,1]){
                        cell.membrane.lineStyle((rank===1?6:4)*q.scale,color,.92).beginPath().arc(t.x,t.y,radius,nearAngle,nearAngle+side*closure,side<0).strokePath();
                    }
                }
            }
        });
        for(const shot of p.defensins){
            const q=project(shot.x,shot.y);
            this.molecules.fillStyle(0x94ffcf,.2).fillCircle(q.x,q.y,11).fillStyle(0xbaffdf,.95).fillCircle(q.x,q.y,4);
        }
        for(const a of p.antibodies){
            const q=project(a.x,a.y), alpha=a.phase==='miss'?Math.max(0,1-a.age/.65):.8;
            this.drawAntibody(q.x,q.y,4.8*q.scale,this.reducedMotion?0:Math.sin(a.age*3+a.id)*.6,alpha,a.phase==='miss'?0xb5a7b8:ANTIBODY_NAMES[a.profile.epitope].color);
        }
        this.lastSquad=count;
    }
    drawAntibody(x:number,y:number,size:number,angle:number,alpha:number,color=0xebc7ff){
        const point=(a:number,b:number)=>({x:x+(a*Math.cos(angle)-b*Math.sin(angle))*size,y:y+(a*Math.sin(angle)+b*Math.cos(angle))*size});
        const p=point(0,0), a=point(-.65,-.8),b=point(.65,-.8),c=point(0,1);
        this.molecules.lineStyle(2,color,alpha).lineBetween(a.x,a.y,p.x,p.y).lineBetween(b.x,b.y,p.x,p.y).lineBetween(p.x,p.y,c.x,c.y);
    }
    drawEnemies(time: number) {
        const nameRects:{x:number;y:number;w:number;h:number}[]=[];
        const p = this.patrol;
        for (const e of p.enemies) {
            let v = this.views.get(e.id);
            const organism = PATHOGENS.find(k => k.id === e.kind)!, idx = organism.art.row, q = project(e.x, e.y), size = (e.boss ? 96 : organism.kind === 'fungus' ? 64 : 57)*(p.level===1?1.7:1);
            if (!v) {
                const shadow = this.add.ellipse(0, size * .25, size * .75, size * .24, 0x001018, .4);
                const body = this.add.image(0, 0, organism.art.texture, idx * 4).setDisplaySize(size, size);
                const label = this.add.text(0, -size * .57, organism.nickname + (e.boss ? ' COLONY' : ''), { fontFamily: 'Arial', fontSize: e.boss ? '12px' : '11px', color: '#e9fff4', fontStyle: 'bold', stroke: '#09232c', strokeThickness: 3 }).setOrigin(.5);
                const health = this.add.rectangle(-22, size * .48, 44, 3, 0xb1f1cc).setOrigin(0, .5);
                const tag = this.add.text(size * .35, -size * .2, '', { fontFamily: 'Arial', fontSize: '10px', color: '#e4c4ff', fontStyle: 'bold', stroke: '#472965', strokeThickness: 2 });
                const status=this.add.text(0,size*.68,'',{fontFamily:'Arial',fontSize:'9px',color:'#f7e2b7',stroke:'#09232c',strokeThickness:3,align:'center'}).setOrigin(.5);
                const preview=this.add.graphics().setName('support-preview-'+e.id);
                const node = this.add.container(q.x, q.y, [shadow, body, preview, label, health, tag,status]);
                v = { preview, node, body, health, tag, label, status, row: idx, hitUntil: 0, lastX: e.x, heading: 0 }; this.views.set(e.id, v);
            }
            v.heading = e.x < v.lastX - .025 ? 1 : e.x > v.lastX + .025 ? 2 : 0;
            const pose = time < v.hitUntil ? 3 : v.heading;
            const actor=p.cells.find(c=>c.targetId===e.id && c.phase==='wrap');
            v.body.setFrame(v.row * 4 + (actor ? 3 : pose));
            const swallow=actor && !e.boss?Math.max(0,(actor.progress-.4)/.6):0;
            const localX=actor?(project(actor.x,actor.y).x-q.x)/q.scale:0;
            const localY=actor?(project(actor.x,actor.y).y-q.y)/q.scale:0;
            v.body.setDisplaySize(size*(1-swallow*.86),size*(1-swallow*.86)).setX(localX*swallow).setAlpha(1-swallow*.65);
            if(actor)v.body.y=localY*swallow;
            v.preview.clear().setVisible(p.phase==='playing' && p.chargingMedicine && e.hp>0 && !swallow);
            if(v.preview.visible){
                const effect=medicineEffect(p.medicine,e.kind),radius=size*.49;
                v.preview.setData('effect',effect.effective?effect.effect:'unaffected');
                if(effect.effective){
                    const color=medicineStyle(p.medicine).color;
                    v.preview.lineStyle(2+p.medicineCharge*2,color,.85);
                    // Brackets anticipate wall stress; pause bars anticipate growth suppression.
                    for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
                        v.preview.lineBetween(sx*radius,sy*(radius-9),sx*radius,sy*radius);
                        v.preview.lineBetween(sx*radius,sy*radius,sx*(radius-9),sy*radius);
                    }
                    if(effect.effect==='inhibit')v.preview.lineBetween(-4,radius-6,-4,radius+4).lineBetween(4,radius-6,4,radius+4);
                }else{
                    v.preview.lineStyle(2,0xa8bbc0,.8).strokeCircle(0,radius,6).lineBetween(-4,radius+4,4,radius-4);
                }
            }
            const reaction=e.medicineReaction;
            const showReaction=reaction && reaction.until>p.time;
            v.status.setText(showReaction ? !reaction.effective ? (organism.kind==='fungus' && reaction.id!=='micafungin' || organism.kind==='bacterium' && reaction.id==='micafungin'?'No target':'Resistant') : reaction.effect==='inhibit'?'Growth paused':'Wall stress' : e.inhibited?'Growth paused':'');
            if(showReaction && reaction.effective && reaction.effect==='kill' && !actor && !this.reducedMotion){
                v.body.setDisplaySize(size*(.95+Math.sin((reaction.until-p.time)*15)*.025),size*.96);
            }
            if (time >= v.hitUntil) v.body.clearTint();
            if(!actor) v.body.y = this.reducedMotion || this.paused ? 0 : Math.sin(time / (180 + idx * 35) + e.id) * 1.4;
            v.node.setPosition(q.x, q.y).setScale(q.scale).setDepth(q.y + 5);
            v.health.width = 44 * Math.min(1, Math.max(0, e.hp / e.maxHp));
            v.health.setFillStyle(e.inhibited ? 0xc8b0ed : 0xb1f1cc);
            v.tag.setText((p.level >= 5 ? ANTIBODY_NAMES[organism.epitope].glyph : '') + (e.complementTagged ? ' C3' : '')).setColor('#e4d7f4');
            v.tag.setVisible(p.level >= 5 || !!e.complementTagged); v.lastX = e.x;
            if(e.tagged && !swallow)for(let j=0;j<3;j++){const a=j*2.1+.3;this.drawAntibody(q.x+Math.cos(a)*size*.35*q.scale,q.y+Math.sin(a)*size*.28*q.scale,4*q.scale,a+Math.PI/2,1);}
            v.health.setVisible(!e.boss && e.hp<e.maxHp && !swallow);
            if(showReaction && reaction.effective && reaction.effect==='kill'){
                // A tiny broken wall contour denotes medication stress; no beam from cells.
                this.molecules.lineStyle(2,0xf4d5b2,.8).beginPath().arc(q.x,q.y,size*.35*q.scale,.2,1.4).strokePath().beginPath().arc(q.x,q.y,size*.35*q.scale,2,3.6).strokePath();
            }
            if (e.inhibited && !swallow) {
                // Persistent pause badge means suppressed growth, never a projectile or a kill.
                const bx=q.x-size*.38*q.scale, by=q.y-size*.35*q.scale;
                this.molecules.fillStyle(0x302945,.95).fillRoundedRect(bx-8,by-8,16,16,5);
                this.molecules.lineStyle(2,0xdcc5f5,1).lineBetween(bx-3,by-4,bx-3,by+4).lineBetween(bx+3,by-4,bx+3,by+4);
            }
            // One name per nearby same-species clump keeps labels legible without hiding identity.
            v.label.setScale(1/q.scale);
            v.status.setScale(1/q.scale);
            const representative=!p.enemies.some(other => other.id < e.id && other.kind === e.kind && Math.abs(other.x - e.x) < 95 && Math.abs(other.y - e.y) < 85);
            // The dedicated colony bar already provides its identity and health.
            v.label.setVisible(false);
            if(!e.boss && representative && q.y>160 && !swallow){
                const w=v.label.width+5,h=v.label.height+3,cx=Phaser.Math.Clamp(q.x,w/2+7,413-w/2);
                for(const offset of [0,-16,16,-32]){
                    const cy=q.y-size*.57*q.scale+offset,rect={x:cx-w/2,y:cy-h/2,w,h};
                    if(cy<160 || nameRects.some(r=>rect.x<r.x+r.w&&rect.x+rect.w>r.x&&rect.y<r.y+r.h&&rect.y+rect.h>r.y))continue;
                    v.label.setPosition((cx-q.x)/q.scale,(cy-q.y)/q.scale).setVisible(true);nameRects.push(rect);break;
                }
            }
        }
        for (const [id, v] of this.views) if (!p.enemies.some(e => e.id === id)) this.dismissEnemy(id, v, false);
    }
    drawGates() {
        const p = this.patrol;
        for (const gate of p.gates) {
            let v = this.gateViews.get(gate.id);
            const q = project(210, gate.y);
            const isThreeLane = gate.layout === 'triple' || (gate.layout === 'staggered' && !!gate.center);
            if (!v) {
                const choices = p.gateOptions(gate), panels: Phaser.GameObjects.Container[] = [];
                const optionList: Array<{ option: GateOption; lane: GateLane; xOffset: number }> = isThreeLane
                    ? [
                        { option: choices.left, lane: 'left', xOffset: -95 },
                        { option: choices.right, lane: 'right', xOffset: 95 },
                        { option: choices.center ?? choices.left, lane: 'center', xOffset: 0 },
                    ]
                    : [
                        { option: choices.left, lane: 'left', xOffset: -88 },
                        { option: choices.right, lane: 'right', xOffset: 88 },
                    ];

                const panelWidth = isThreeLane ? 102 : 166;
                const panelHeight = 80;

                for (const item of optionList) {
                    const option = item.option;
                    const danger = (option.cost ?? 0) > 0 || option.value < 0;
                    const color = danger ? 0x804c52 : option.kind === 'recruit' ? 0x246b60 : option.kind === 'tempo' ? 0x6e562c : 0x474972;
                    const edge = danger ? 0xf2a6a0 : option.kind === 'recruit' ? 0xb4f9df : 0xe1d1ff;
                    const shadow = this.add.ellipse(0, panelHeight / 2 - 2, panelWidth - 4, 22, 0x001720, .22);
                    const face = this.add.rectangle(0, 0, panelWidth, panelHeight, color, .52).setStrokeStyle(2.5, edge, .88);
                    const top = this.add.rectangle(0, -panelHeight / 2, panelWidth, 6, edge, .82);
                    const title = this.add.text(0, -12, option.label, {
                        fontFamily: 'Arial',
                        fontSize: isThreeLane ? (option.label.length > 10 ? '13px' : '17px') : (option.label.length > 12 ? '15px' : '20px'),
                        color: '#f0fff7',
                        fontStyle: 'bold',
                        stroke: '#071f28',
                        strokeThickness: 3
                    }).setOrigin(.5);
                    const subText = ({ recruit: 'New teammates', coverage: 'Reach farther', tempo: 'Quick catches · 12s', shield: 'Loss shield · 8s', risk: 'Reassign 3' }[option.kind] ?? option.detail);
                    const sub = this.add.text(0, 16, subText, {
                        fontFamily: 'Arial',
                        fontSize: isThreeLane ? '10px' : '11px',
                        color: danger ? '#ffdcda' : '#daefe9',
                        stroke: '#071f28',
                        strokeThickness: 2
                    }).setOrigin(.5);
                    const shimmer = this.add.rectangle(0, -panelHeight * 0.22, panelWidth - 8, 1.5, 0xffffff, 0.25);
                    const base = this.add.rectangle(0, panelHeight / 2, panelWidth, 3, edge, .65);
                    panels.push(this.add.container(item.xOffset, 0, [shadow, face, top, title, sub, shimmer, base]));
                }
                v = { node: this.add.container(210, q.y, panels), panels };
                this.gateViews.set(gate.id, v);
            }
            const options = p.gateOptions(gate);
            const activeOptions = [options.left, options.right, options.center ?? options.left];

            v.panels.forEach((panel, i) => {
                const lane: GateLane = i === 0 ? 'left' : i === 1 ? 'right' : 'center';
                const isVisible = !gate.layout || gate.layout === 'pair' || gate.layout === 'triple' || gate.layout === 'staggered' || gate.layout === lane;
                panel.setVisible(isVisible);

                // Vertical stagger positioning
                const staggerY = (gate.stagger?.[lane] ?? 0) * q.scale;
                panel.setY(staggerY);

                // Update title for recruit capacity
                const option = activeOptions[i];
                if (option) {
                    const title = panel.list[3] as Phaser.GameObjects.Text;
                    if (!gate.used && option.kind === 'recruit') {
                        const actual = Math.min(option.value, BALANCE.maxSquad - p.squad);
                        title.setText(actual > 0 ? '+' + actual + ' cells' : 'Squad full · 30').setFontSize(isThreeLane ? (actual > 0 ? 16 : 12) : (actual > 0 ? 19 : 14));
                    }
                }

                // Contact reaction pulse (projectile or defender reach)
                const face = panel.list[1] as Phaser.GameObjects.Rectangle;
                const top = panel.list[2] as Phaser.GameObjects.Rectangle;
                const isReacting = gate.hitReaction && gate.hitReaction.lane === lane && (p.time - gate.hitReaction.time) < 0.38;
                if (isReacting) {
                    const isProj = gate.hitReaction?.kind === 'projectile';
                    face.setFillStyle(face.fillColor, isProj ? 0.84 : 0.92);
                    top.setFillStyle(top.fillColor, 1.0);
                    panel.setScale(isProj ? 1.03 : 1.06);
                } else {
                    face.setFillStyle(face.fillColor, 0.52);
                    top.setFillStyle(top.fillColor, 0.80);
                    panel.setScale(1.0);
                }
            });

            v.node.setPosition(210, q.y).setScale(q.scale).setDepth(q.y - 10).setAlpha(gate.used || gate.passed ? .18 : 1);
        }
        for (const [id, v] of this.gateViews) if (!p.gates.some(g => g.id === id)) { v.node.destroy(); this.gateViews.delete(id); }
    }
}
export function createGame() {
    return new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#082d38', width: 420, height: 780, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [PatrolScene], audio: { disableWebAudio: false, context: bioAudio.unlock() }, render: { antialias: true }, input: { activePointers: 2 } });
}
