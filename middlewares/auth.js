const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        console.log('asdasdasd');
        const token = req.headers.authorization.split(" ")[1];
        console.log(jwt.verify(token, "longer-secret-is-better"));
        next();
    } catch (error) {
        res.status(401).json({ message: "No token provided" });
    }
};