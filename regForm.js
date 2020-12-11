function addMem() {
  var x = document.createElement("input");
  x.setAttribute("type", "text");
  x.setAttribute("class", "inpField teamMem");
  x.setAttribute("placeholder", "Member Name");

  var inputs = document.getElementById("mem");
  inputs.insertBefore(x, inputs.childNodes[inputs.childNodes.length - 2]);
  console.log(inputs.childNodes[0]);
}
