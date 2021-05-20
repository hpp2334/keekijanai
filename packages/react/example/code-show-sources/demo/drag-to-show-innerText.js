export default () => {
  const nodeBoxes = document.querySelectorAll('.demo-dtsi-box');
  nodeBoxes.forEach(nd => {
    nd.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/plain', nd.innerText);
    });
  });
  const nodeTarget = document.getElementById('demo-dtsi-drag-dest');
  nodeTarget.addEventListener('dragenter', ev => ev.preventDefault());
  nodeTarget.addEventListener('dragover', ev => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
  });
  nodeTarget.addEventListener('drop', ev => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text/plain');
    nodeTarget.innerText = data;
  });
}
