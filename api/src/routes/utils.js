function isLoggedIn(req, res, next) {
    if (res.locals.isAuthenticated) {
        next();
        return;
    }

    res.status(401).json({ error: 'Unauthorized user' });
}

function validCSRF(req, res, next) {
    const { csrf } = res.locals;
    const {
        headers: { 'x-csrf-token': csrfToken },
        user: { csrfSecret },
    } = req;
    console.log('utils.js');
    console.log(csrfToken);
    console.log(csrfSecret);
    console.log(!csrf.verify(csrfSecret, csrfToken));
    if (typeof csrfToken !== 'string' || !csrf.verify(csrfSecret, csrfToken)) {
        res.status(403).json({ error: 'Invalid CSRF token' });
        return;
    }

    next();
}

exports.isLoggedIn = isLoggedIn;
exports.validCSRF = validCSRF;
