owl.App.registerTemplate("Sprite", function Sprite(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  
  let block1 = createBlock(`<div class="sprite"><!-- <t t-esc="props.line.line"/> --><!-- <canvas t-ref="canvas" t-attf-width="#{att.width}px" t-attf-height="#{att.height}px"/> --><canvas block-ref="0"/><!-- <t t-foreach="state.cols" t-as="col" t-key="col_index">
		<span t-raw="col" t-on-click="() => this.toggle(col_index)"/>
	</t> --></div>`);
  
  return function template(ctx, node, key = "") {
    const refs = ctx.__owl__.refs;
    const ref1 = (el) => refs[`canvas`] = el;
    return block1([ref1]);
  }
});

owl.App.registerTemplate("Anim", function Anim(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Sprite`, true, false, false, false);
  
  let block1 = createBlock(`<div class="greeter"><block-text-0/><block-child-0/><hr/></div>`);
  
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
    return block1([txt1], [b2]);
  }
});

owl.App.registerTemplate("Root", function Root(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  let { prepareList, withKey } = helpers;
  const comp1 = app.createComponent(`Sprite`, true, false, false, false);
  const comp2 = app.createComponent(`Anim`, true, false, false, false);
  
  let block1 = createBlock(`<div class="app"><div class="editor-area"><block-child-0/></div><div class="anims"><block-child-1/></div></div>`);
  
  return function template(ctx, node, key = "") {
    const b2 = comp1({led: 'big',line: ctx['state'].sample}, key + `__1`, node, this, null);
    ctx = Object.create(ctx);
    const [k_block3, v_block3, l_block3, c_block3] = prepareList(ctx['env'].anims);;
    for (let i1 = 0; i1 < l_block3; i1++) {
      ctx[`anim`] = v_block3[i1];
      const key1 = ctx['anim'].name;
      c_block3[i1] = withKey(comp2({anim: ctx['anim']}, key + `__2__${key1}`, node, this, null), key1);
    }
    const b3 = list(c_block3);
    return block1([], [b2, b3]);
  }
});
