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
interface CellView { node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse; birth: number }
interface EnemyView { node: Phaser.GameObjects.Container; body: Phaser.GameObjects.Image; health: Phaser.GameObjects.Rectangle; tag: Phaser.GameObjects.Text; row: number; hitUntil: number; lastX: number; heading: number }
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
    ground!: Phaser.GameObjects.Graphics;
    bg!: Phaser.GameObjects.Image;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    lastSound = 0;
    lastSquad = 0;
    lastX = 210;
    heading = 0;
    turnUntil = 0;
    squadHitUntil = 0;
    scroll = 0;
    constructor() { super('Patrol'); }
    preload() {
        this.load.spritesheet('defenders-v2', 'assets/defenders-v2.png', {frameWidth:362, frameHeight:362});
        this.load.image('enemies-v2', 'assets/enemies-v2.png');
        this.load.image('tissue-v2', 'assets/tissue-perspective-v2.png');
        for (const s of ['soft', 'recruit', 'finish']) this.load.audio(s, `assets/${s}.wav`);
    }
    create() {
        const texture = this.textures.get('enemies-v2');
        for (let row=0;row<5;row++) for (let col=0;col<4;col++) {
            const x=Math.round(col*1122/4), y=Math.round(row*1402/5);
            texture.add(row*4+col,0,x,y,Math.round((col+1)*1122/4)-x,Math.round((row+1)*1402/5)-y);
        }
        this.bg = this.add.image(210, 390, 'tissue-v2').setDisplaySize(420, 780);
        this.add.rectangle(210, 390, 420, 780, 0x071e29, .1);
        this.ground = this.add.graphics();
        this.zone = this.add.graphics().setDepth(2);
        const line = this.add.graphics().setDepth(3);
        const a = project(20, BALANCE.breachY), b = project(400, BALANCE.breachY);
        line.lineStyle(2, 0xedb19d, .7).lineBetween(a.x, a.y, b.x, b.y);
        this.add.text(210, a.y + 14, 'TISSUE LINE · BREACH COSTS 1 CELL', { fontFamily: 'Arial', fontSize: '10px', color: '#e2b8ad', letterSpacing: .5 }).setOrigin(.5).setDepth(4);
        for (let i = 0; i < BALANCE.maxSquad; i++) {
            const shadow = this.add.ellipse(0, 13, 30, 13, 0x00151b, .38);
            const body = this.add.image(0, -4, 'defenders-v2', 0).setDisplaySize(40, 40);
            const node = this.add.container(210, 660, [shadow, body]).setVisible(false);
            this.cells.push({ node, body, shadow, birth: -1000 });
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
        this.views.clear(); this.gateViews.clear(); this.lastSquad = 0; this.lastX = p.x;
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
        if (event.type === 'engulf') {
            this.soundCue('soft');
            if (!this.reducedMotion && event.x !== undefined && event.y !== undefined) {
                const q = project(event.x, event.y);
                const arc = this.add.ellipse(q.x, q.y, 44 * q.scale, 26 * q.scale, 0xa8fff0, .15).setStrokeStyle(2, 0xbcfff2, .65).setDepth(q.y + 3);
                this.tweens.add({ targets: arc, scaleX: 1.45, scaleY: 1.45, alpha: 0, duration: 210, onComplete: () => arc.destroy() });
            }
        }
        if (event.type === 'death' && event.enemyId !== undefined) {
            const v = this.views.get(event.enemyId);
            if (v) this.dismissEnemy(event.enemyId, v, true);
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
        if (event.type === 'medicine') {
            const ring = this.add.ellipse(210, 380, 220, 380).setStrokeStyle(3, 0xdac7ff, .6).setDepth(4);
            this.tweens.add({ targets: ring, scale: 1.5, alpha: 0, duration: 450, onComplete: () => ring.destroy() });
        }
        if (!['hit', 'death', 'engulf', 'tag'].includes(event.type)) this.hooks.event(event.text);
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
        this.drawGround(); this.drawSquad(time, delta); this.drawEnemies(time); this.drawGates();
    }
    drawGround() {
        this.ground.clear().lineStyle(1, 0x84c7c2, .12);
        for (const x of [70, 140, 210, 280, 350]) {
            const a = project(x, 30), b = project(x, 710);
            this.ground.lineBetween(a.x, a.y, b.x, b.y);
        }
        for (let y = this.scroll; y < 710; y += 70) {
            const a = project(30, y), b = project(390, y);
            this.ground.lineBetween(a.x, a.y, b.x, b.y);
        }
        const p = this.patrol;
        const corners = [project(p.x - p.coverage, p.y - 140), project(p.x + p.coverage, p.y - 140), project(p.x + p.coverage, p.y + 35), project(p.x - p.coverage, p.y + 35)];
        this.zone.clear().fillStyle(p.shieldRemaining > 0 ? 0xb6b5ff : 0x8bf1d5, .07).lineStyle(1, p.shieldRemaining > 0 ? 0xc6bfff : 0x91ffe0, .3);
        this.zone.beginPath().moveTo(corners[0].x, corners[0].y);
        for (const q of corners.slice(1)) this.zone.lineTo(q.x, q.y);
        this.zone.closePath().fillPath().strokePath();
    }
    drawSquad(time: number, delta: number) {
        const p = this.patrol, count = p.squad;
        if (Math.abs(p.x - this.lastX) > .1) { this.heading = p.x < this.lastX ? 1 : 2; this.turnUntil = time + 160; }
        if (time > this.turnUntil) this.heading = 0;
        const cols = Math.min(5, Math.ceil(Math.sqrt(count))), rows = Math.ceil(count / cols);
        const blend = this.reducedMotion ? 1 : 1 - Math.exp(-delta / 75);
        this.cells.forEach((cell, i) => {
            if (i >= count) {
                if (cell.node.visible && i < this.lastSquad) {
                    const ghost = this.add.image(cell.node.x, cell.node.y - 4, 'defenders-v2', (p.defender === 'macrophage' ? 4 : 0) + 3).setDisplaySize(38, 38).setDepth(cell.node.depth + 1);
                    this.tweens.add({ targets: ghost, alpha: 0, scaleX: ghost.scaleX * .3, scaleY: ghost.scaleY * .15, y: ghost.y + 12, duration: this.reducedMotion ? 1 : 350, onComplete: () => ghost.destroy() });
                }
                cell.node.setVisible(false); return;
            }
            const row = Math.floor(i / cols), rowCount = Math.min(cols, count - row * cols);
            const wx = p.x + (i % cols - (rowCount - 1) / 2) * 28;
            const wy = p.y + (row - (rows - 1) / 2) * 20;
            const q = project(wx, wy);
            if (!cell.node.visible) {
                cell.node.setVisible(true); cell.birth = time;
                cell.node.setPosition(this.lastSquad === 0 ? q.x : i % 2 ? 408 : 12, this.lastSquad === 0 ? q.y : q.y + 55);
            }
            const rank = p.plasma && i === count - 1 ? 2 : p.defender === 'macrophage' ? 1 : 0;
            cell.body.setFrame(rank * 4 + (time < this.squadHitUntil ? 3 : this.heading));
            cell.body.setDisplaySize(rank === 1 ? 43 : 38, rank === 1 ? 43 : 38);
            const moving = Math.abs(p.x - this.lastX) > .1 || this.held;
            cell.body.y = -4 + (this.reducedMotion || this.paused ? 0 : Math.sin(time / (moving ? 95 : 340) + i * 1.8) * (moving ? 2 : .7));
            cell.node.x = Phaser.Math.Linear(cell.node.x, q.x, blend);
            cell.node.y = Phaser.Math.Linear(cell.node.y, q.y, blend);
            cell.node.setScale(q.scale).setDepth(q.y + 8).setAlpha(time < this.squadHitUntil ? .65 : 1);
            const arriving = time - cell.birth < 600 && this.lastSquad !== 0;
            if (arriving) cell.body.setTint(0xb9ffdd); else cell.body.clearTint();
        });
        this.lastSquad = count; this.lastX = p.x;
    }
    drawEnemies(time: number) {
        const p = this.patrol;
        for (const e of p.enemies) {
            let v = this.views.get(e.id);
            const idx = PATHOGENS.findIndex(k => k.id === e.kind), q = project(e.x, e.y), size = e.boss ? 96 : 57;
            if (!v) {
                const shadow = this.add.ellipse(0, size * .25, size * .75, size * .24, 0x001018, .4);
                const body = this.add.image(0, 0, 'enemies-v2', idx * 4).setDisplaySize(size, size);
                const label = this.add.text(0, -size * .57, e.boss ? 'COLONY' : ['SUSCEPTIBLE', 'BETA-LACTAMASE', 'DOXY R', 'BOTH R', 'EPITOPE B'][idx], { fontFamily: 'Arial', fontSize: e.boss ? '12px' : '9px', color: '#e9fff4', fontStyle: 'bold', stroke: '#09232c', strokeThickness: 3 }).setOrigin(.5);
                const health = this.add.rectangle(-22, size * .48, 44, 3, 0xb1f1cc).setOrigin(0, .5);
                const tag = this.add.text(size * .35, -size * .2, 'Y', { fontFamily: 'Arial', fontSize: '20px', color: '#e4c4ff', fontStyle: 'bold', stroke: '#472965', strokeThickness: 2 });
                const node = this.add.container(q.x, q.y, [shadow, body, label, health, tag]);
                v = { node, body, health, tag, row: idx, hitUntil: 0, lastX: e.x, heading: 0 }; this.views.set(e.id, v);
            }
            v.heading = e.x < v.lastX - .025 ? 1 : e.x > v.lastX + .025 ? 2 : 0;
            const pose = time < v.hitUntil ? 3 : v.heading;
            v.body.setFrame(v.row * 4 + pose);
            if (time >= v.hitUntil) v.body.clearTint();
            v.body.y = this.reducedMotion || this.paused ? 0 : Math.sin(time / (180 + idx * 35) + e.id) * 1.4;
            v.node.setPosition(q.x, q.y).setScale(q.scale).setDepth(q.y + 5);
            v.health.width = 44 * Math.min(1, Math.max(0, e.hp / e.maxHp));
            v.health.setFillStyle(e.inhibited ? 0xc8b0ed : 0xb1f1cc);
            v.tag.setVisible(e.tagged); v.lastX = e.x;
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
