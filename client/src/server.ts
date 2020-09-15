import koa from 'koa'
import serve from 'koa-static'

const app = new koa();

app.use(serve(`${__dirname}/../dist`));

app.listen(process.env.PORT || 8081);