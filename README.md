<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Requirements
- NodeJS from v16: `node>=16.x` [install now](https://nodejs.org/en/download)
- PNPM package manager: `pnpm>=8.x` [install now](https://pnpm.io/installation)

## How to run ?

#### Installation
```bash
pnpm install
```

#### Build all applications
<sup>Include 3 server: member, sale/shipper, admin</sup>
```bash
NODE_ENV=production pnpm build-all
```

#### Run each application
```bash
# Member app
NODE_ENV=production pnpm start:prod:client

# Sale/Shipper app
NODE_ENV=production pnpm start:prod:sale

# Admin app
NODE_ENV=production pnpm start:prod:admin
```
*This running is without Socket connection and Momo IPN api. Continue next section to setup those features*
## How to run and test SocketIO + Momo IPN in local ?
#### Setup Ngrok
- Create a Ngrok account: https://ngrok.com
- Install `ngrok` command: https://ngrok.com/download
- Configure Ngrok: https://dashboard.ngrok.com/get-started/your-authtoken
```bash
ngrok config add-authtoken <your_authtoken>
```
- Create a domain: https://dashboard.ngrok.com/cloud-edge/domains
- Copy your domain and add new environment variable to `.env` file:
```javascript
SALE_URL=your_custom_domain.ngrok-free.app
```

#### Run Ngrok with your custom domain
```bash
pnpm ngrok:sale
# or
ngrok http 80 --domain=your_custom_domain.ngrok-free.app
# 80 is SALE_PORT in .env
```

#### Re-run related applications
```bash
# Member app
NODE_ENV=production pnpm start:prod:client

# Sale/Shipper app
NODE_ENV=production pnpm start:prod:sale
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
