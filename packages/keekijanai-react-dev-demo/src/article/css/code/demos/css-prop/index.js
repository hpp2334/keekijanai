import "./main.css";
import html from "!raw-loader!./main.html";
import handlerFragment from "!raw-loader!./main.js";

const handler = new Function("handler", handlerFragment);

export { html, handler };
