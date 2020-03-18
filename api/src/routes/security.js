const { Router } = require('express');

const {
    contentSecurityPolicy,
    dnsPrefetchControl,
    frameguard,
    hidePoweredBy,
    hsts,
    ieNoOpen,
    noSniff,
    xssFilter,
} = require('helmet');

const router = Router();

router
    .use(
        contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
            },
        })
    )
    .use(dnsPrefetchControl())
    .use(frameguard())
    .use(hidePoweredBy({ setTo: 'PHP 7.4.3' }))
    .use(hsts())
    .use(ieNoOpen())
    .use(noSniff())
    .use(xssFilter());

module.exports = router;
