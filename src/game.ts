import * as Phaser from 'phaser';
import { Patrol, BALANCE, type PatrolEvent } from './simulation';
import { PATHOGENS } from './content';



export interface GameHooks {
    tick: (p: Patrol) => void;
    event: (text: string) => void;
    finish: (p: Patrol) => void;
    pause: () => void;
    gesture: () => void;
}
interface CellView { node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse; digest: Phaser.GameObjects.Image; vesicle: Phaser.GameObjects.Graphics; membrane: Phaser.GameObjects.Graphics; birth: number }
interface EnemyView { node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; health: Phaser.GameObjects.Rectangle; tag: Phaser.GameObjects.Text; label: Phaser.GameObjects.Text; status: Phaser.GameObjects.Text; row: number; hitUntil: number; lastX: number; heading: number }
interface GateView { node: Phaser.GameObjects.Container; panels: Phaser.GameObjects.Container[] }
/** One orthographic-style perspective shared by sprites, gates, ground and input. */
export function project(x: number, y: number) {
    const scale = .56 + .44 * Phaser.Math.Clamp(y / 780, 0, 1);
    return { x: 210 + (x - 210) * scale, y: 76 + y * .84, scale };
}

export class PatrolScene extends Phaser.Scene {
    patrol!: Patrol;
    hooks!: GameHooks;
    held = false;
    dragX = 0;
    dragY = 0;
    dragStart = 0;
    dragStartY = 640;
    paused = true;
    finished = false;
    muted = false;
    volume = .25;
    reducedMotion = false;
    views = new Map<number, EnemyView>();
    gateViews = new Map<number, GateView>();
    cells: CellView[] = [];
    zone!: Phaser.GameObjects.Graphics;
    molecules!: Phaser.GameObjects.Graphics;
    showReach = false;
    ground!: Phaser.GameObjects.Graphics;
    bg!: Phaser.GameObjects.Image;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    lastSound = 0;
    lastSquad = 0;
    squadHitUntil = 0;
    scroll = 0;
    constructor() { super('Patrol'); }
    preload() {
        this.load.spritesheet('defenders-v2', 'assets/defenders-v2.png', {frameWidth:362, frameHeight:362});
        this.load.image('enemies-v2', 'assets/enemies-v2.png');
        this.load.image('microbes-v3', 'assets/microbes-v3.png');
        this.load.image('tissue-v2', 'assets/tissue-perspective-v2.png');
        for (const s of ['soft', 'recruit', 'finish']) this.load.audio(s, `assets/${s}.wav`);
    }
    create() {
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
        const line = this.add.graphics().setDepth(3);
        const a = project(20, BALANCE.breachY), b = project(400, BALANCE.breachY);
        line.lineStyle(2, 0xedb19d, .7).lineBetween(a.x, a.y, b.x, b.y);
        this.add.text(210, a.y + 14, 'TISSUE LINE · BREACH COSTS 1 CELL', { fontFamily: 'Arial', fontSize: '10px', color: '#e2b8ad', letterSpacing: .5 }).setOrigin(.5).setDepth(4);
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
        this.input.keyboard!.on('keydown-SPACE', () => { if (!this.paused) this.patrol?.useMedicine(); });
        this.game.canvas.addEventListener('pointercancel', this.cancelDrag);
        this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur);
        const cleanup = () => { this.game.canvas?.removeEventListener('pointercancel', this.cancelDrag); this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur); };
        this.events.once('shutdown', cleanup); this.events.once('destroy', cleanup);
    }
    onBlur = () => { this.cancelDrag(); if (!this.paused) this.hooks?.pause(); };
    cancelDrag = () => { this.held = false; this.input.keyboard?.resetKeys(); };
    startPatrol(p: Patrol, hooks: GameHooks) {
        this.patrol = p; this.hooks = hooks; this.finished = false; this.paused = false; this.cancelDrag();
        for (const v of this.views.values()) v.node.destroy();
        for (const v of this.gateViews.values()) v.node.destroy();
        this.views.clear(); this.gateViews.clear(); this.lastSquad = 0;
    }
    soundCue(key: string) {
        if (this.muted || this.time.now - this.lastSound < 150) return;
        this.lastSound = this.time.now; this.sound.play(key, { volume: this.volume * .5 });
    }
    reaction(event: PatrolEvent) {
        if (event.type === 'hit' && event.enemyId !== undefined) {
            const v = this.views.get(event.enemyId);
            if (v) { v.hitUntil = this.time.now + 170; v.body.setTint(0xf5d6c5); }
        }
        if (event.type === 'engulf') this.soundCue('soft');
        if (event.type === 'death' && event.enemyId !== undefined) {
            const v = this.views.get(event.enemyId);
            if (v) {
                if(event.cause==='phagocytosis'){v.node.destroy();this.views.delete(event.enemyId);}
                else {this.floatFeedback(event.cause==='micafungin'?'Fungal wall disrupted':'Cell wall disrupted',v.node.x,v.node.y-30,0xf4dfbd);this.dismissEnemy(event.enemyId,v,true);}
            }
        }
        if (event.type === 'loss') {
            this.squadHitUntil = this.time.now + 220;
            if (!this.reducedMotion) this.cameras.main.shake(90, .0018);
        }
        if (event.type === 'gate') {
            this.soundCue('recruit');
            const p=this.patrol, q=project(p.x,p.y);
            const message=event.label ?? 'Gate activated';
            this.floatFeedback(message,q.x,q.y-85,0xd8fff0);
        }
        if (event.type === 'recruit' || (event.type === 'loss' && event.amount)) {
            const q=project(this.patrol.x,this.patrol.y);
            this.floatFeedback((event.amount! > 0 ? '+' : '') + event.amount + ' cells',q.x,q.y-50,event.amount! > 0 ? 0xb5ffe0 : 0xffb6aa);
        }
        if (!['hit', 'death', 'engulf', 'tag', 'contact'].includes(event.type)) this.hooks.event(event.text);
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
            this.hooks.tick(p);
            if (p.phase !== 'playing') { this.finished = true; this.soundCue('finish'); this.hooks.finish(p); }
        }
        if (!this.paused && !this.reducedMotion) this.scroll = (this.scroll + dt * 25) % 70;
        this.drawGround(); this.drawSquad(time); this.drawEnemies(time); this.drawGates();
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
        this.cells.forEach((cell, i) => {
            const actor = p.cells[i];
            cell.membrane.clear();
            if (!actor || i >= count) {
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
            cell.body.setFrame(rank*4+(time<this.squadHitUntil?3:heading));
            const size=rank===1?53:rank===2?43:43;
            const wrap=actor.phase==='wrap', active=actor.phase==='approach'||wrap;
            const deform=this.reducedMotion?0:wrap?Math.sin(actor.progress*Math.PI)*.13:active?Math.sin(p.time*13+i)*.045:0;
            cell.body.setDisplaySize(size*(1+deform),size*(1-deform*.55));
            cell.body.setAngle(this.reducedMotion?0:active?Math.max(-12,Math.min(12,(target?.x??actor.x)-actor.x))*.5:0);
            cell.body.y=-4+(this.reducedMotion||this.paused?0:Math.sin(p.time*(active?12:3)+i*1.8)*(active?1.3:.4));
            // Scene uses the same actor positions that decide contact; never a separate visual chase.
            const arrival=this.lastSquad>0?Math.max(0,1-(time-cell.birth)/430):0;
            cell.node.setPosition(q.x,q.y).setScale(q.scale).setDepth(q.y+8).setAlpha(time<this.squadHitUntil?.7:1);
            cell.body.clearTint();
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
                const progress=actor.progress, radius=(target.boss?24:16)*q.scale;
                const color=rank===1?0x65c4bd:0xbadfee;
                cell.membrane.setDepth(Math.max(q.y,t.y)+7);
                // Two connected membrane lobes extend from this cell and curl around this target.
                for(const side of [-1,1]){
                    const points=[];
                    for(let j=0;j<=12;j++){
                        const u=j/12, curl=Math.sin(u*Math.PI)*radius*(rank===1?1.2:1);
                        const end=Math.min(1,progress*2.7);
                        points.push(new Phaser.Math.Vector2(q.x+vx*u*end+nx*side*curl*end,q.y-4+vy*u*end+ny*side*curl*end));
                    }
                    cell.membrane.lineStyle((rank===1?13:10)*q.scale,color,.92).strokePoints(points,false);
                    cell.membrane.lineStyle(1.3*q.scale,0xf6fff9,.45).strokePoints(points,false);
                }
                if(progress>.3){
                    cell.membrane.lineStyle(3*q.scale,color,.9).beginPath().arc(t.x,t.y,radius,Math.PI*.15,Math.PI*(.15+Math.min(1,(progress-.3)/.55)*1.8),false).strokePath();
                }
            }
        });
        for(const a of p.antibodies){
            const q=project(a.x,a.y), alpha=a.phase==='miss'?Math.max(0,1-a.age/.65):.8;
            this.drawAntibody(q.x,q.y,4.8*q.scale,this.reducedMotion?0:Math.sin(a.age*3+a.id)*.6,alpha,a.phase==='miss'?0xb5a7b8:0xebc7ff);
        }
        this.lastSquad=count;
    }
    drawAntibody(x:number,y:number,size:number,angle:number,alpha:number,color=0xebc7ff){
        const point=(a:number,b:number)=>({x:x+(a*Math.cos(angle)-b*Math.sin(angle))*size,y:y+(a*Math.sin(angle)+b*Math.cos(angle))*size});
        const p=point(0,0), a=point(-.65,-.8),b=point(.65,-.8),c=point(0,1);
        this.molecules.lineStyle(2,color,alpha).lineBetween(a.x,a.y,p.x,p.y).lineBetween(b.x,b.y,p.x,p.y).lineBetween(p.x,p.y,c.x,c.y);
    }
    drawEnemies(time: number) {
        const p = this.patrol;
        for (const e of p.enemies) {
            let v = this.views.get(e.id);
            const organism = PATHOGENS.find(k => k.id === e.kind)!, idx = organism.art.row, q = project(e.x, e.y), size = e.boss ? 96 : organism.kind === 'fungus' ? 64 : 57;
            if (!v) {
                const shadow = this.add.ellipse(0, size * .25, size * .75, size * .24, 0x001018, .4);
                const body = this.add.image(0, 0, organism.art.texture, idx * 4).setDisplaySize(size, size);
                const label = this.add.text(0, -size * .57, organism.shortName + (e.boss ? ' COLONY' : ''), { fontFamily: 'Arial', fontSize: e.boss ? '12px' : '11px', color: '#e9fff4', fontStyle: 'bold', stroke: '#09232c', strokeThickness: 3 }).setOrigin(.5);
                const health = this.add.rectangle(-22, size * .48, 44, 3, 0xb1f1cc).setOrigin(0, .5);
                const tag = this.add.text(size * .35, -size * .2, '', { fontFamily: 'Arial', fontSize: '10px', color: '#e4c4ff', fontStyle: 'bold', stroke: '#472965', strokeThickness: 2 });
                const status=this.add.text(0,size*.68,'',{fontFamily:'Arial',fontSize:'9px',color:'#f7e2b7',stroke:'#09232c',strokeThickness:3,align:'center'}).setOrigin(.5);
                const node = this.add.container(q.x, q.y, [shadow, body, label, health, tag,status]);
                v = { node, body, health, tag, label, status, row: idx, hitUntil: 0, lastX: e.x, heading: 0 }; this.views.set(e.id, v);
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
            v.tag.setText(e.tagged ? '' : 'C3').setColor(e.tagged ? '#e4c4ff' : '#adebff');
            v.tag.setVisible(!!e.complementTagged); v.lastX = e.x;
            if(e.tagged && !swallow)for(let j=0;j<3;j++){const a=j*2.1+.3;this.drawAntibody(q.x+Math.cos(a)*size*.35*q.scale,q.y+Math.sin(a)*size*.28*q.scale,4*q.scale,a+Math.PI/2,1);}
            v.health.setVisible(e.hp<e.maxHp && !swallow);
            if(showReaction && reaction.effective && reaction.effect==='kill'){
                // A tiny broken wall contour denotes medication stress; no beam from cells.
                this.molecules.lineStyle(2,0xf4d5b2,.8).beginPath().arc(q.x,q.y,size*.35*q.scale,.2,1.4).strokePath().beginPath().arc(q.x,q.y,size*.35*q.scale,2,3.6).strokePath();
            }
            // One name per nearby same-species clump keeps labels legible without hiding identity.
            v.label.setScale(1/q.scale);
            v.status.setScale(1/q.scale);
            v.label.setVisible(e.boss || !p.enemies.some(other => other.id < e.id && other.kind === e.kind && Math.abs(other.x - e.x) < 95 && Math.abs(other.y - e.y) < 85));
        }
        for (const [id, v] of this.views) if (!p.enemies.some(e => e.id === id)) this.dismissEnemy(id, v, false);
    }
    drawGates() {
        const p = this.patrol;
        for (const gate of p.gates) {
            let v = this.gateViews.get(gate.id);
            const q = project(210, gate.y);
            if (!v) {
                const choices = p.gateOptions(gate), panels: Phaser.GameObjects.Container[] = [];
                for (const [i, option] of [choices.left, choices.right].entries()) {
                    const danger = (option.cost ?? 0) > 0 || option.value < 0;
                    const color = danger ? 0x804c52 : option.kind === 'recruit' ? 0x2c776c : option.kind === 'tempo' ? 0x786138 : 0x535787;
                    const edge = danger ? 0xf2a6a0 : option.kind === 'recruit' ? 0xb4f9df : 0xe1d1ff;
                    const shadow = this.add.ellipse(0, 29, 153, 23, 0x001f29, .3);
                    const face = this.add.rectangle(0, 0, 156, 61, color, .94).setStrokeStyle(2, edge, .85);
                    const top = this.add.rectangle(0, -32, 156, 5, edge, .45);
                    const title = this.add.text(0, -10, option.label, { fontFamily: 'Arial', fontSize: option.label.length > 12 ? '14px' : '19px', color: '#f0fff7', fontStyle: 'bold' }).setOrigin(.5);
                    const sub = this.add.text(0, 14, ({recruit:'Arriving defenders',coverage:'Wider contact zone',tempo:'Faster engulfment · 12s',shield:'Loss protection · 8s',risk:'Reassign 3 defenders'}[option.kind]), { fontFamily: 'Arial', fontSize: '11px', color: danger ? '#ffdcda' : '#daefe9' }).setOrigin(.5);
                    panels.push(this.add.container(i === 0 ? -88 : 88, 0, [shadow, face, top, title, sub]));
                }
                v = { node: this.add.container(210, q.y, panels), panels }; this.gateViews.set(gate.id, v);
            }
            const options = p.gateOptions(gate);
            [options.left, options.right].forEach((option, i) => {
                const title = v!.panels[i].list[3] as Phaser.GameObjects.Text;
                if (!gate.used && option.kind === 'recruit') {
                    const actual = Math.min(option.value, BALANCE.maxSquad - p.squad);
                    title.setText(actual > 0 ? '+' + actual + ' cells' : 'Squad full · 30').setFontSize(actual > 0 ? 19 : 14);
                }
            });
            v.node.setPosition(210, q.y).setScale(q.scale).setDepth(q.y - 10).setAlpha(gate.used ? .15 : 1);
        }
        for (const [id, v] of this.gateViews) if (!p.gates.some(g => g.id === id)) { v.node.destroy(); this.gateViews.delete(id); }
    }
}
export function createGame() {
    return new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#082d38', width: 420, height: 780, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [PatrolScene], audio: { disableWebAudio: false }, render: { antialias: true }, input: { activePointers: 2 } });
}
