export const passportError = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, (error, user, info) => {
            if (error) {
                return next(error);
            }

            if (!user) {
                return res.status(401).send(`No active session found`);
            }
            req.session.user = user;
            next();
        })(req, res, next);
    };
};