const { authJwt } = require("../middlewares");
const controller = require("../controllers/products.controller");
// const controllerBooking = require("../controllers/booking.controller");

module.exports = function (app) {
  // app.use(function (req, res, next) {
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "x-access-token, Origin, Content-Type, Accept"
  //   );
  //   next();
  // });

  app.get(
    "/api/admin/products",
    //[authJwt.verifyToken, authJwt.isAdmin],
    controller.products
  );

  app.get(
    "/api/admin/charts",
    //[authJwt.verifyToken, authJwt.isAdmin],
    controller.charts
  );

  // booking
  // app.get(app.get("/api/admin/getbookings", controllerBooking.getbooking));
  // app.get(app.get("/api/admin/updateBooking", controllerBooking.updateBooking));
};
