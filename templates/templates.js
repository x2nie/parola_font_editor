owl.App.registerTemplate("Sprite", function Sprite(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  
  let block1 = createBlock(`<div class="sprite" block-handler-0="click"><canvas block-ref="1"/></div>`);
  
  return function template(ctx, node, key = "") {
    const refs = ctx.__owl__.refs;
    const ref1 = (el) => refs[`canvas`] = el;
    let hdlr1 = [ctx['selectme'], ctx];
    return block1([hdlr1, ref1]);
  }
});

owl.App.registerTemplate("SpriteEditor", function SpriteEditor(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  
  let block1 = createBlock(`<div class="sprite"><canvas block-handler-0="mousedown.prevent" block-ref="1"/></div>`);
  
  return function template(ctx, node, key = "") {
    const refs = ctx.__owl__.refs;
    const ref1 = (el) => refs[`canvas`] = el;
    let hdlr1 = ["prevent", ctx['startDrawing'], ctx];
    return block1([hdlr1, ref1]);
  }
});

owl.App.registerTemplate("Toolbox", function Toolbox(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  
  let block2 = createBlock(`<div class="toolbox"><span title="Pencil" block-attribute-0="class" block-handler-1="click">Pen</span><span title="Eraser" block-attribute-2="class" block-handler-3="click">Eraser</span></div>`);
  let block3 = createBlock(`<div class="toolbox"><span block-handler-0="click">Invert</span><span block-handler-1="click">Flip H</span><span block-handler-2="click">Flip V</span><span block-handler-3="click">Clear</span></div>`);
  let block4 = createBlock(`<div class="toolbox"><span block-handler-0="click">Duplicate</span><span block-handler-1="click">Swipe Before</span><span block-handler-2="click">Swipe After</span><span block-handler-3="click">Delete</span></div>`);
  
  return function template(ctx, node, key = "") {
    let attr1 = `pencil on ${ctx['state'].pencilOn?'active':''}`;
    let hdlr1 = [()=>this.state.pencilOn=true, ctx];
    let attr2 = `pencil off ${!ctx['state'].pencilOn?'active':''}`;
    let hdlr2 = [()=>this.state.pencilOn=false, ctx];
    const b2 = block2([attr1, hdlr1, attr2, hdlr2]);
    let hdlr3 = [ctx['invert'], ctx];
    let hdlr4 = [ctx['flipH'], ctx];
    let hdlr5 = [ctx['flipV'], ctx];
    let hdlr6 = [ctx['clear'], ctx];
    const b3 = block3([hdlr3, hdlr4, hdlr5, hdlr6]);
    let hdlr7 = [ctx['duplicate'], ctx];
    let hdlr8 = [ctx['swipeBefore'], ctx];
    let hdlr9 = [ctx['swipAfter'], ctx];
    let hdlr10 = [ctx['delete'], ctx];
    const b4 = block4([hdlr7, hdlr8, hdlr9, hdlr10]);
    return multi([b2, b3, b4]);
  }
});

owl.App.registerTemplate("Anim", function Anim(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Sprite`, true, false, false, false);
  
  let block1 = createBlock(`<div class="greeter"><block-text-0/><block-child-0/><div class="btn" block-handler-1="click">+</div><hr/></div>`);
  
  return function template(ctx, node, key = "") {
    let txt1 = ctx['anim'].name;
    ctx = Object.create(ctx);
    const [k_block2, v_block2, l_block2, c_block2] = prepareList(ctx['anim'].sprites);;
    for (let i1 = 0; i1 < l_block2; i1++) {
      ctx[`sprite`] = v_block2[i1];
      ctx[`sprite_index`] = i1;
      const key1 = ctx['sprite_index'];
      c_block2[i1] = withKey(comp1({line: ctx['sprite']}, key + `__1__${key1}`, node, this, null), key1);
    }
    ctx = ctx.__proto__;
    const b2 = list(c_block2);
    let hdlr1 = [ctx['add'], ctx];
    return block1([txt1, hdlr1], [b2]);
  }
});

owl.App.registerTemplate("Root", function Root(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Toolbox`, true, false, false, true);
  const comp2 = app.createComponent(`SpriteEditor`, true, false, false, false);
  const comp3 = app.createComponent(`Anim`, true, false, false, false);
  
  let block1 = createBlock(`<div class="app"><div class="editor-area"><block-child-0/><block-child-1/></div><div class="minimap-shadow"/><div class="anims"><block-child-2/></div></div>`);
  
  return function template(ctx, node, key = "") {
    const b2 = comp1({}, key + `__1`, node, this, null);
    const b3 = comp2({led: 'big',line: ctx['editorData']}, key + `__2`, node, this, null);
    ctx = Object.create(ctx);
    const [k_block4, v_block4, l_block4, c_block4] = prepareList(ctx['env'].anims);;
    for (let i1 = 0; i1 < l_block4; i1++) {
      ctx[`anim`] = v_block4[i1];
      const key1 = ctx['anim'].name;
      c_block4[i1] = withKey(comp3({anim: ctx['anim']}, key + `__3__${key1}`, node, this, null), key1);
    }
    const b4 = list(c_block4);
    return block1([], [b2, b3, b4]);
  }
});
