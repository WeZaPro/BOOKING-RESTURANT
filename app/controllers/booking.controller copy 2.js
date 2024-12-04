require('dotenv').config();
const { google } = require('googleapis');
const config = require('../config/auth.config');
const db = require('../models');
require('dotenv').config();
var _ = require('lodash');
const axios = require('axios');

// google function ---> start
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheet_id_public = process.env.spreadsheetId;
// google function ---> end
//
const _SheetName = 'Booking';
const _SheetData = `${_SheetName}!A3:AB16`;
const _SheetHeader = `${_SheetName}!A2:AB2`;
//const _findValue = `${_SheetName}!A2:AB`; //“sheet1!A2:Z"
//const spreadsheetId = "1lIIQvSlAom2te5TjG5Xl-aJAlIDPvR8elvIX_1fflkg";
//
async function getAuthSheets(spreadsheetId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './app/credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: 'v4',
    auth: client,
  });

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

exports.getbooking = async (req, res, next) => {
  //const sheet_id_public = process.env.spreadsheetId;
  //
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
  );
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetData,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });
  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetHeader,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  let headArr = getHeader.data.values;
  let headKey = [];
  headArr.forEach((e, i) => {
    headKey = e;
  });
  let bodyArr = getRows.data.values;

  //
  let bodyValues = [];
  if (bodyArr) {
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });
  }
  const obj = {};
  const objArr = [];
  const keys = headKey;
  const values = bodyValues;

  values.forEach((e, i) => {
    objArr.push({
      id: e[0],
      date: e[1],
      table: e[2],
      start: e[4],
      duration: e[5],
      end: e[6],
      status: e[7],
      statusCheck: e[8],
    });
  });
  console.log('objArr >> ', objArr);

  res.send({ getDataBookingAll: objArr });
};

exports.getbookingFromDate = async (req, res, next) => {
  const getDate = req.body.date;
  const sepDateMonth = getDate.split('/');
  //
  const dateBooking = sepDateMonth[1];

  const _SheetDateName = sepDateMonth[0] + '_' + sepDateMonth[2]; //
  const _SheetDateData = `${_SheetDateName}!A2:AB`;
  const _SheetDateHeader = `${_SheetDateName}!A1:AB1`;

  //todo start new
  try {
    const googleSheetPage = _SheetDateName;
    // google sheet instance
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
      sheet_id_public
    );
    // read data in the range in a sheet
    const infoObjectFromSheet = await googleSheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: spreadsheetId,
      // range: `${_SheetDateName}!A2:AB16`,
      range: _SheetDateData,
    });

    const valuesFromSheet = infoObjectFromSheet.data.values;

    // filter
    const filterDataFromDate = [];
    valuesFromSheet.forEach((e, i) => {
      filterDataFromDate.push(e);
    });

    const filterDateSelecetion = [];
    Object.entries(filterDataFromDate).forEach(([key, value]) => {
      const filter_date = value[1];
      if (filter_date == dateBooking) filterDateSelecetion[key] = value;
    });

    const sendDateQuery = [];
    filterDateSelecetion.forEach((e, i) => {
      sendDateQuery.push({
        id: e[0],
        date: e[1],
        table: e[2],
        time_8: e[3],
        time_9: e[4],
        time_10: e[5],
        time_11: e[6],
        time_12: e[7],
        time_13: e[8],
        time_14: e[9],
        time_15: e[10],
        time_16: e[11],
        time_17: e[12],
        time_18: e[13],
        time_19: e[14],
        time_20: e[15],
        time_21: e[16],
        time_22: e[17],
      });
    });

    const queryDateBlank = [];
    Object.entries(sendDateQuery).forEach(([key, value]) => {
      if (value[3] == 0 || value[4] == 0) queryDateBlank[key] = value;
    });
    console.log('getbookingFromDate-> sendDateQuery ', sendDateQuery);
    // res.send(queryDateBlank);
    res.send(sendDateQuery);
  } catch (err) {
    console.log('readSheet func() error', err);
    res.send('not found');
  }
};

exports.updateBooking = async (req, res, next) => {
  const getDate = req.body.date;
  const sepDateMonth = getDate.split('/');
  let getTimeFromWeb = 7;
  if (req.body.time == '8:00 | 9:00') {
    getTimeFromWeb = getTimeFromWeb + 1;
  } else if (req.body.time == '9:00 | 10:00') {
    getTimeFromWeb = getTimeFromWeb + 2;
  } else if (req.body.time == '10:00 | 11:00') {
    getTimeFromWeb = getTimeFromWeb + 3;
  } else if (req.body.time == '11:00 | 12:00') {
    getTimeFromWeb = getTimeFromWeb + 4;
  } else if (req.body.time == '12:00 | 13:00') {
    getTimeFromWeb = getTimeFromWeb + 5;
  } else if (req.body.time == '13:00 | 14:00') {
    getTimeFromWeb = getTimeFromWeb + 6;
  } else if (req.body.time == '14:00 | 15:00') {
    getTimeFromWeb = getTimeFromWeb + 7;
  } else if (req.body.time == '15:00 | 16:00') {
    getTimeFromWeb = getTimeFromWeb + 8;
  } else if (req.body.time == '16:00 | 17:00') {
    getTimeFromWeb = getTimeFromWeb + 9;
  } else if (req.body.time == '17:00 | 18:00') {
    getTimeFromWeb = getTimeFromWeb + 10;
  } else if (req.body.time == '18:00 | 19:00') {
    getTimeFromWeb = getTimeFromWeb + 11;
  } else if (req.body.time == '19:00 | 20:00') {
    getTimeFromWeb = getTimeFromWeb + 12;
  } else if (req.body.time == '20:00 | 21:00') {
    getTimeFromWeb = getTimeFromWeb + 13;
  } else if (req.body.time == '21:00 | 22:00') {
    getTimeFromWeb = getTimeFromWeb + 14;
  } else {
    getTimeFromWeb = getTimeFromWeb + 15;
  }

  //
  const dateBooking = sepDateMonth[1];
  const timeBooking = getTimeFromWeb; //  ใช้อันนี้ ให้แปลงจาก (ตัวอย่างรับมา "8:00 | 9:00" แปลงเป็น = 8 )
  const username = req.body.name;
  const phone = req.body.phone;
  const time = getTimeFromWeb;
  const ID = req.body.ID;
  //
  const _SheetDateName = sepDateMonth[0] + '_' + sepDateMonth[2]; //
  // const _SheetDateData = `${_SheetDateName}!A2:AB16`;
  const _SheetDateData = `${_SheetDateName}!A2:R`;
  // const _SheetDateHeader = `${_SheetDateName}!A1:AB1`;
  const _SheetDateHeader = `${_SheetDateName}!A1:R1`;
  //
  // const sheet_id_public = process.env.spreadsheetId;

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
  );
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetDateData,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });
  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetDateHeader,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  let headArr = getHeader.data.values;
  let headKey = [];
  headArr.forEach((e, i) => {
    headKey = e;
  });
  let bodyArr = getRows.data.values;

  //
  let bodyValues = [];
  if (bodyArr) {
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });
  }
  const obj = {};
  const objArr = [];
  const keys = headKey;
  const googleSheetAllData = bodyValues;
  googleSheetAllData.forEach((e, i) => {
    objArr.push({
      id: e[0],
      date: e[1],
      table: e[2],
      time_8: e[3],
      time_9: e[4],
      time_10: e[5],
      time_11: e[6],
      time_12: e[7],
      time_13: e[8],
      time_14: e[9],
      time_15: e[10],
      time_16: e[11],
      time_17: e[12],
      time_18: e[13],
      time_19: e[14],
      time_20: e[15],
      time_21: e[16],
      time_22: e[17],
    });
  });

  // filter
  acc = [];

  Object.entries(objArr).forEach(([key, value]) => {
    if (value.date == dateBooking) acc[key] = value;
  });

  //console.log("acc---> ", acc);

  const timeArr = [];
  // ดึงเฉพาะเวลา
  acc.forEach((time, i) => {
    timeArr.push({
      id: time.id,
      time_8: time.time_8,
      time_9: time.time_9,
      time_10: time.time_10,
      time_11: time.time_11,
      time_12: time.time_12,
      time_13: time.time_13,
      time_14: time.time_14,
      time_15: time.time_15,
      time_16: time.time_16,
      time_17: time.time_17,
      time_18: time.time_18,
      time_19: time.time_19,
      time_20: time.time_20,
      time_21: time.time_21,
      time_22: time.time_22,
    });
  });

  // filter เวลาที่ว่าง
  Object.entries(timeArr).forEach(([key, value]) => {
    if (value.date == dateBooking) acc[key] = value;
  });
  //========

  const doc = new GoogleSpreadsheet(
    // "1sZCVvguajLrNJ8KNho0eVsoIBCfKkGHVobR-9cIlk9A",
    process.env.spreadsheetId,
    serviceAccountAuth
  );

  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByTitle[_SheetDateName];
  //const sheet = doc.sheetsById[3];
  const rows = await sheet.getRows();

  //Todo ตอน save booking ให้เช็คว่าเวลานั้น booking ไปหรือยัง ? condition => if booking != 0
  const idSelectFromUser = ID;
  let _time = timeBooking.toString();
  let _addTime = timeBooking + 1;

  let _nextTime = _addTime.toString();
  console.log('------> _time', _time);
  console.log('------> idSelectFromUser', idSelectFromUser);
  console.log('------> get rows data', rows[idSelectFromUser].get(_time));
  // check cell ว่า = 0 หรือไม่
  if (
    rows[idSelectFromUser].get(_time) == '0' &&
    rows[idSelectFromUser].get(_nextTime) == '0'
  ) {
    const booking = 'Booking';
    switch (timeBooking) {
      case 8:
        rows[idSelectFromUser].assign({ 8: booking, 9: booking });
        break;
      case 9:
        rows[idSelectFromUser].assign({ 9: booking, 10: booking });
        break;
      case 10:
        rows[idSelectFromUser].assign({ 10: booking, 11: booking });
        break;
      case 11:
        rows[idSelectFromUser].assign({ 11: booking, 12: booking });
        break;
      case 12:
        rows[idSelectFromUser].assign({ 12: booking, 13: booking });
        break;
      case 13:
        rows[idSelectFromUser].assign({ 13: booking, 14: booking });
        break;
      case 14:
        rows[idSelectFromUser].assign({ 14: booking, 15: booking });
        break;
      case 15:
        rows[idSelectFromUser].assign({ 15: booking, 16: booking });
        break;
      case 16:
        rows[idSelectFromUser].assign({ 16: booking, 17: booking });
        break;
      case 17:
        rows[idSelectFromUser].assign({ 17: booking, 18: booking });
        break;
      case 18:
        rows[idSelectFromUser].assign({ 18: booking, 19: booking });
        break;
      case 19:
        rows[idSelectFromUser].assign({ 19: booking, 20: booking });
        break;
      case 20:
        rows[idSelectFromUser].assign({ 20: booking, 21: booking });
        break;
      case 21:
        rows[idSelectFromUser].assign({ 21: booking, 22: booking });
        break;

      default:
      // code block
    }

    await rows[idSelectFromUser].save();

    //
    const updateDataSheetRow = [
      {
        id: rows[idSelectFromUser].get('ID'),
        date: rows[idSelectFromUser].get('DATE'),
        table: rows[idSelectFromUser].get('TABLE'),
        8: rows[idSelectFromUser].get('8'),
        9: rows[idSelectFromUser].get('9'),
        10: rows[idSelectFromUser].get('10'),
        11: rows[idSelectFromUser].get('11'),
        12: rows[idSelectFromUser].get('12'),
        13: rows[idSelectFromUser].get('13'),
        14: rows[idSelectFromUser].get('14'),
        15: rows[idSelectFromUser].get('15'),
        16: rows[idSelectFromUser].get('16'),
        17: rows[idSelectFromUser].get('17'),
        18: rows[idSelectFromUser].get('18'),
        19: rows[idSelectFromUser].get('19'),
        20: rows[idSelectFromUser].get('20'),
        21: rows[idSelectFromUser].get('21'),
        22: rows[idSelectFromUser].get('22'),
      },
    ];
    console.log('====> updateDataSheetRow', updateDataSheetRow);
    //
    const _id = idSelectFromUser;
    const _date = getDate;
    const _time = time;
    const _phone = phone;
    const _name = username;
    saveUserBooking(
      _id,
      _date,
      _time,
      _phone,
      _name,
      updateDataSheetRow[0].table
    );
    //
    res.send({ updateBooking: updateDataSheetRow });
  } else {
    //res.send('วัน-เวลานี้ เต็มแล้ว');
    res.status(400).send({ message: 'วัน-เวลานี้ เต็มแล้ว' });
  }
};

async function saveUserBooking(id, date, time, phone, name, table) {
  // console.log("id ", id);
  // console.log("date ", date);
  // console.log("time ", time);
  // console.log("phone ", phone);
  // console.log("name ", name);

  //const _SheetSaveName = process.env.saveDataCustomer; //
  const _SheetSaveName = 'Booking-Customer';
  const _SheetDateData = `${_SheetSaveName}!A2:R`;
  const _SheetDateHeader = `${_SheetSaveName}!A1:F1`;

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
  );
  //const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetDateData,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });
  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetDateHeader,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  const timeBooking = time + 1;
  // const phoneBooking = `0${phone}`;
  // console.log("phone ", phone);
  // console.log("phoneBooking ", phoneBooking);
  // save data
  await googleSheets.spreadsheets.values
    .append({
      auth,
      spreadsheetId,
      range: 'Booking-Customer',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [date, id, table, `${time}:00 - ${timeBooking}:00`, name, phone],
        ],
      },
    })
    .then((saveDB) => {
      console.log('saveDB  OK');
    });

  return 'yes';
}

exports.changeDateBooking = async (req, res, next) => {
  res.send('Change Date Booking');
};

exports.queryHourBooking = async (req, res, next) => {
  const _id = req.body.id;
  //const _bookingTime = req.body.time;

  const doc = new GoogleSpreadsheet(
    process.env.spreadsheetId,
    serviceAccountAuth
  );

  await doc.loadInfo(); // loads document properties and worksheets

  // get sheet name
  const sheetName = getSheetName(req);

  // let qryArr = [];
  _getGoogleSheetCRUD(sheetName, _id).then((data) => {
    const singleRowData = initRow(data[0]);

    // if (_bookingTime == 8) {
    //   _timeQry = [singleRowData.time_8, singleRowData.time_9];
    // } else if (_bookingTime == 9) {
    //   _timeQry = [singleRowData.time_9, singleRowData.time_10];
    // } else if (_bookingTime == 10) {
    //   _timeQry = [singleRowData.time_10, singleRowData.time_11];
    // } else if (_bookingTime == 11) {
    //   _timeQry = [singleRowData.time_11, singleRowData.time_12];
    // } else if (_bookingTime == 12) {
    //   _timeQry = [singleRowData.time_12, singleRowData.time_13];
    // } else if (_bookingTime == 13) {
    //   _timeQry = [singleRowData.time_13, singleRowData.time_14];
    // } else if (_bookingTime == 14) {
    //   _timeQry = [singleRowData.time_14, singleRowData.time_15];
    // } else if (_bookingTime == 15) {
    //   _timeQry = [singleRowData.time_15, singleRowData.time_16];
    // } else if (_bookingTime == 16) {
    //   _timeQry = [singleRowData.time_16, singleRowData.time_17];
    // } else if (_bookingTime == 17) {
    //   _timeQry = [singleRowData.time_17, singleRowData.time_18];
    // } else if (_bookingTime == 18) {
    //   _timeQry = [singleRowData.time_18, singleRowData.time_19];
    // } else if (_bookingTime == 19) {
    //   _timeQry = [singleRowData.time_19, singleRowData.time_20];
    // } else if (_bookingTime == 20) {
    //   _timeQry = [singleRowData.time_20, singleRowData.time_21];
    // } else {
    //   _timeQry = [singleRowData.time_21, singleRowData.time_22];
    // }

    let timBooking = [
      [singleRowData.time_8, singleRowData.time_9], //  key0 => 08:00 - 09:00
      [singleRowData.time_9, singleRowData.time_10], //  key1 => 089:00 - 10:00
      [singleRowData.time_10, singleRowData.time_11], //  key2 => 10:00 - 11:00
      [singleRowData.time_11, singleRowData.time_12], //  key3 => 11:00 - 12:00
      [singleRowData.time_12, singleRowData.time_13], //  key4 => 12:00 - 13:00
      [singleRowData.time_13, singleRowData.time_14], //  key5 => 13:00 - 14:00
      [singleRowData.time_14, singleRowData.time_15], //  key6 => 14:00 - 15:00
      [singleRowData.time_15, singleRowData.time_16], //  key7 => 15:00 - 16:00
      [singleRowData.time_16, singleRowData.time_17], //  key8 => 16:00 - 17:00
      [singleRowData.time_17, singleRowData.time_18], //  key9 => 17:00 - 18:00
      [singleRowData.time_18, singleRowData.time_19], //  key10 => 18:00 - 19:00
      [singleRowData.time_19, singleRowData.time_20], //  key11 => 19:00 - 20:00
      [singleRowData.time_20, singleRowData.time_21], //  key12 => 20:00 - 21:00
      [singleRowData.time_21, singleRowData.time_22], //  key13 => 21:00 - 22:00
    ];

    let timBookingB = [];
    timBooking.forEach((value, key) => {
      console.log('key ', key);
      console.log('value ', value);
      if (value[0] == 0 && value[1] == 0) timBookingB[key] = key;
    });
    console.log('timBookingB ', timBookingB);

    let timBookingC = [];
    timBookingB.forEach((value, key) => {
      console.log('value ', value);
      // if (value == 0) timBookingC[key] = '8:00 - 9:00';
      // if (value == 1) timBookingC[key] = '9:00 - 10:00';
      // if (value == 2) timBookingC[key] = '10:00 - 11:00';
      // if (value == 3) timBookingC[key] = '11:00 - 12:00';
      // if (value == 4) timBookingC[key] = '12:00 - 13:00';
      // if (value == 5) timBookingC[key] = '13:00 - 14:00';
      // if (value == 6) timBookingC[key] = '14:00 - 15:00';
      // if (value == 7) timBookingC[key] = '15:00 - 16:00';
      // if (value == 8) timBookingC[key] = '16:00 - 17:00';
      // if (value == 9) timBookingC[key] = '17:00 - 18:00';
      // if (value == 10) timBookingC[key] = '18:00 - 19:00';
      // if (value == 11) timBookingC[key] = '19:00 - 20:00';
      // if (value == 12) timBookingC[key] = '20:00 - 21:00';
      // if (value == 13) timBookingC[key] = '21:00 - 22:00';

      if (value == 0) timBookingC[key] = '8:00 | 9:00';
      if (value == 1) timBookingC[key] = '9:00 | 10:00';
      if (value == 2) timBookingC[key] = '10:00 | 11:00';
      if (value == 3) timBookingC[key] = '11:00 | 12:00';
      if (value == 4) timBookingC[key] = '12:00 | 13:00';
      if (value == 5) timBookingC[key] = '13:00 | 14:00';
      if (value == 6) timBookingC[key] = '14:00 | 15:00';
      if (value == 7) timBookingC[key] = '15:00 | 16:00';
      if (value == 8) timBookingC[key] = '16:00 | 17:00';
      if (value == 9) timBookingC[key] = '17:00 | 18:00';
      if (value == 10) timBookingC[key] = '18:00 | 19:00';
      if (value == 11) timBookingC[key] = '19:00 | 20:00';
      if (value == 12) timBookingC[key] = '20:00 | 21:00';
      if (value == 13) timBookingC[key] = '21:00 | 22:00';
    });

    let timBookingD = [];
    timBookingC.forEach((e, i) => {
      timBookingD.push(e);
    });
    console.log('timBookingD ', timBookingD);

    // const _objValue = Object.values(singleRowData);

    // _objValue.forEach((value, key) => {
    //   if (value == 0) qryArr[key] = value;
    // });

    //console.log('qryArr ', qryArr);

    // test
    // var db = [
    //   { key: 'a', value: 1 },
    //   { key: 'b', value: 2 },
    //   { key: 'c', value: 3 },
    // ];
    // let _key = 'b';
    // for (var i = 0; i < db.length; i++) {
    //   if (db[i].key === _key) {
    //     console.log('next value ', db[i + 1] && db[i + 1].value);
    //   }
    // }

    res.send({ timeBooking: timBookingD });
  });
};

// function ********
function getSheetName(req) {
  const getDate = req.body.date;
  const sepDateMonth = getDate.split('/');
  //
  const _SheetDateName = sepDateMonth[0] + '_' + sepDateMonth[2]; //

  return _SheetDateName;
}

// function ********
async function _getGoogleSheetCRUD(sheetName, id) {
  const _SheetDateData = `${sheetName}!A2:R`;

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
  );

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetDateData,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  const arrData = getRows.data.values;

  let arr = [];
  Object.entries(arrData).forEach(([key, value]) => {
    if (value[0] == id) arr[key] = value;
  });

  let sendSingleRow = [];
  arr.forEach((e, i) => {
    sendSingleRow.push(e);
  });

  return sendSingleRow;
}

// function ********
function initRow(rowsData) {
  const single_row_data = {
    id: rowsData[0],
    date: rowsData[1],
    table: rowsData[2],
    time_8: rowsData[3],
    time_9: rowsData[4],
    time_10: rowsData[5],
    time_11: rowsData[6],
    time_12: rowsData[7],
    time_13: rowsData[8],
    time_14: rowsData[9],
    time_15: rowsData[10],
    time_16: rowsData[11],
    time_17: rowsData[12],
    time_18: rowsData[13],
    time_19: rowsData[14],
    time_20: rowsData[15],
    time_21: rowsData[16],
    time_22: rowsData[17],
  };
  return single_row_data;
}
// sameple update
//   const sheets = google.sheets({auth, version: "v4"}); // This is from your showing script.

// const spreadsheetId = "###"; // Please set your Spreadsheet ID.
// const sheetName = "Sheet1"; // Please set your sheet name.
// const inputValues = ["30336551", "30336553"]; // This is a sample input value.

// const { data: { values }} = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetName });
// await sheets.spreadsheets.values.update({
//   spreadsheetId,
//   range: sheetName,
//   resource: {values: values.map((r) => inputValues.includes(r[0]) ? [r[0], r[1], "Present"] : r)},
//   valueInputOption: "USER_ENTERED",
// });

exports.testSendLineByUserId = async (req, res, next) => {
  //

  const lineUid = req.body.lineUid;
  //const lineUid = "U634375582d774e1c8ce69c31f6f1ba48";

  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    'Bearer tvb2bkJUvF5ZbSzAf9WDSmfwbwRDxI/2Nlw1TROa2XbaSAXdySiT1w4OvRQrTWPcZXSWvNn1cwlZtBkjly5fhhubxbIXzxZ5sAqnk0644k4l1ShKzP2MXJxZ50Wd1L0d1Yba6vX1JVDQYA/EBH2DbgdB04t89/1O/w1cDnyilFU='
  );
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    to: lineUid, //"U634375582d774e1c8ce69c31f6f1ba48",
    messages: [
      {
        type: 'text',
        text: 'Hello, world1',
      },
      {
        type: 'text',
        text: 'Hello, world2',
      },
    ],
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://api.line.me/v2/bot/message/push', requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      res.send('send message complete');
    })
    .catch((error) => console.error(error));
};
