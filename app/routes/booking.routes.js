const controllerBooking = require('../controllers/booking.controller');

module.exports = function (app) {
  // booking

  app.get('/api/user/getbookings', controllerBooking.getbooking);

  app.post(
    '/api/user/getbookingFromDate',
    controllerBooking.getbookingFromDate // list Date Booking Select
  );

  // ใช้คู่กัน ==> 1
  app.post('/api/user/updateDateBooking', controllerBooking.updateDateBooking); // ลงเวลาในการจอง
  // ใช้คู่กัน ==> 2
  app.post('/api/user/queryHourBooking', controllerBooking.queryHourBooking); // list เวลาในการจอง

  app.post(
    '/api/user/testSendLineByUserId',
    controllerBooking.testSendLineByUserId // Send to line
  );

  //app.post('/api/user/testReadRowColumn', controllerBooking.testReadRowColumn); // test get data row,column
};
