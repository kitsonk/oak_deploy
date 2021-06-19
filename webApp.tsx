/** @jsx h */
import {
  Component,
  h,
  Helmet,
  renderSSR,
} from "https://deno.land/x/nano_jsx@v0.0.18/mod.ts";

import { Application, Router } from "https://deno.land/x/oak@v7.6.2/mod.ts";

interface CommentsProps {
  comments: unknown[];
}

class Comments extends Component<CommentsProps> {
  render() {
    return (<ul>
      {this.props.comments.map((comment) => <li>{comment}</li>)}
    </ul>);
  }
}

const comments = ["Comment One", "Comment Two"];

const App = () => (
  <div>
    <Helmet>
      <title>Hello!</title>
      <meta name="description" content="Example application" />
    </Helmet>

    <Helmet footer>
      <script src="/bundle.js"></script>
    </Helmet>

    <h2>Comments</h2>
    <div id="comments">
      <Comments comments={comments} />
    </div>
  </div>
);

const ssr = renderSSR(<App />);
const { body, head, footer } = Helmet.SSR(ssr);

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head.join("\n")}
  </head>
  <body>
    ${body}
    ${footer.join("\n")}
  </body>
</html>`;

const router = new Router();

router.get("/", (context) => {
  context.response.body = html;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (evt) => {
  if ("stack" in evt.error) {
    console.log(evt.error.stack);
  } else if ("message" in evt.error) {
    console.log(evt.error.message);
  } else {
    console.log(`An undefined application error occurred.`);
  }
});

addEventListener("fetch", app.fetchEventHandler());
