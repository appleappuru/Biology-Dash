/** Pointer capture keeps release reliable when a thumb slips off the button. */
export function bindChargeControl(button: HTMLButtonElement, hooks: {
    begin: () => boolean; release: () => void; cancel: () => void; tap: () => void;
}) {
    let pointer: number | null=null, key: string | null=null;
    const cancel=()=>{pointer=null;key=null;hooks.cancel();};
    button.addEventListener('pointerdown',event=>{
        if(event.button!==0 || pointer!==null || key!==null || !hooks.begin())return;
        event.preventDefault();pointer=event.pointerId;button.setPointerCapture(pointer);
    });
    button.addEventListener('pointerup',event=>{
        if(event.pointerId!==pointer)return;
        pointer=null;hooks.release();
    });
    button.addEventListener('pointercancel',cancel);
    button.addEventListener('lostpointercapture',()=>{if(pointer!==null)cancel();});
    button.addEventListener('keydown',event=>{
        if(![' ','Enter'].includes(event.key))return;
        event.preventDefault();
        if(!event.repeat && key===null && pointer===null && hooks.begin())key=event.key;
    });
    button.addEventListener('keyup',event=>{
        if(![' ','Enter'].includes(event.key))return;
        event.preventDefault();if(event.key!==key)return;key=null;hooks.release();
    });
    button.addEventListener('blur',cancel);
    // Assistive technology can activate a button without pointer/key events.
    button.addEventListener('click',event=>{if(event.detail===0 && pointer===null && key===null)hooks.tap();});
}
