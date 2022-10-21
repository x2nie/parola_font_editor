owl.App.registerTemplate("Sprite", function Sprite(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, safeOutput, withKey } = helpers;
  
  let block1 = createBlock(`<div class="sprite"><block-text-0/><block-child-0/></div>`);
  let block3 = createBlock(`<span block-handler-0="click"><block-child-0/></span>`);
  
  return function template(ctx, node, key = "") {
    let txt1 = ctx['props'].line.line;
    ctx = Object.create(ctx);
    const [k_block2, v_block2, l_block2, c_block2] = prepareList(ctx['state'].cols);;
    for (let i1 = 0; i1 < l_block2; i1++) {
      ctx[`col`] = v_block2[i1];
      ctx[`col_index`] = i1;
      const key1 = ctx['col_index'];
      const v1 = ctx['col_index'];
      let hdlr1 = [()=>this.toggle(v1), ctx];
      const b4 = safeOutput(ctx['col']);
      c_block2[i1] = withKey(block3([hdlr1], [b4]), key1);
    }
    const b2 = list(c_block2);
    return block1([txt1], [b2]);
  }
});

owl.App.registerTemplate("Anim", function Anim(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Sprite`, true, false, false, false);
  
  let block1 = createBlock(`<div class="greeter"><block-text-0/><block-child-0/></div>`);
  
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
    const b2 = list(c_block2);
    return block1([txt1], [b2]);
  }
});

owl.App.registerTemplate("Root", function Root(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Anim`, true, false, false, false);
  
  return function template(ctx, node, key = "") {
    ctx = Object.create(ctx);
    const [k_block1, v_block1, l_block1, c_block1] = prepareList(ctx['env'].anims);;
    for (let i1 = 0; i1 < l_block1; i1++) {
      ctx[`anim`] = v_block1[i1];
      const key1 = ctx['anim'].name;
      c_block1[i1] = withKey(comp1({anim: ctx['anim']}, key + `__1__${key1}`, node, this, null), key1);
    }
    return list(c_block1);
  }
});
