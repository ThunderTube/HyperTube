exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated) {
        console.log(req.signedCookies);
        return next();
    } else res.status(401).json({ error: 'Unauthorized user' });
};
