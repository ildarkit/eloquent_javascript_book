<!doctype html>

<h1>Heading with a <span>span</span> element.</h1>
<p>A paragraph with <span>one</span>, <span>two</span>
  spans.</p>

<script>
  function byTagName(node, tagName) {
    // Your code here.
    let nodes = [];
    for (let child of node.children) {
    	if (tagName.toUpperCase() == child.nodeName) {
        	nodes.push(child);
        }
        nodes = nodes.concat(byTagName(child, tagName));
    }
    return nodes;
  }

  console.log(byTagName(document.body, "h1").length);
  // → 1
  console.log(byTagName(document.body, "span").length);
  // → 3
  let para = document.querySelector("p");
  console.log(byTagName(para, "span").length);
  // → 2
</script>
