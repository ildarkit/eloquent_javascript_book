specialForms.set = (args, scope) => {
    // Your code here.
    if (args.length != 2 || args[0].type != "word") {
      throw new SyntaxError("Incorrect use of set");
    }
  	let outerScope = scope;
    while (outerScope && !Object.hasOwnProperty.call(outerScope, args[0].name)) {
        outerScope = Object.getPrototypeOf(outerScope);
    }
    if (!outerScope) {
        throw new ReferenceError(`Undefined binding: ${args[0].name}`);
    }
    let value = evaluate(args[1], scope);
    outerScope[args[0].name] = value;
    return value;
  };