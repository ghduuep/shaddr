import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { Redis } from "ioredis";

const app = new Elysia()
  
const redis = new Redis()

app.use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET! 
  })
)

app.get('/', async({ request, set }) => {
  const clientIP = app.server?.requestIP(request)
  console.log('Novo acesso detectado! IP: ', clientIP?.address)

  const key = `rate-limit:${clientIP?.address}`  
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 60)
  }

  if (count > 10) {
    set.status = 503
    return { error: 'Muitas requisições! Tente novamente em 1 minuto.' }
  }
  
  return 'Gateway Operacional 🛡️'
})

app.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
