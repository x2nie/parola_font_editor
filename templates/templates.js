owl.App.registerTemplate("Greeter", function Greeter(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  
  let block1 = createBlock(`<div class="greeter" block-handler-0="click"><block-text-1/>, <block-text-2/></div>`);
  
  return function template(ctx, node, key = "") {
    let hdlr1 = [ctx['toggle'], ctx];
    let txt1 = ctx['state'].word;
    let txt2 = ctx['props'].name;
    return block1([hdlr1, txt1, txt2]);
  }
});

owl.App.registerTemplate("Root", function Root(app, bdom, helpers
) {
  let { text, createBlock, list, multi, html, toggler, comment } = bdom;
  const comp1 = app.createComponent(`Greeter`, true, false, false, false);
  
  return function template(ctx, node, key = "") {
    return comp1({name: ctx['state'].name}, key + `__1`, node, this, null);
  }
});
