const { google } = require("googleapis");
const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//google sheet
const _SheetName = "Sheet1";
const _SheetData = `${_SheetName}!A2:AB`;
const _SheetHeader = `${_SheetName}!A1:AB1`;
const _findValue = `${_SheetName}!A2:AB`; //“sheet1!A2:Z"
//const spreadsheetId = "1lIIQvSlAom2te5TjG5Xl-aJAlIDPvR8elvIX_1fflkg";
//
async function getAuthSheets(spreadsheetId) {
  const auth = new google.auth.GoogleAuth({
    // keyFile: "credentials.json",
    keyFile: "./app/credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

exports.getGoogleSheet = async (req, res, next) => {
  // 1. เอา token
  let token = req.headers["x-access-token"];
  //

  jwt.verify(token, config.secret, (err, decoded) => {
    // if (err) {
    //   return catchError(err, res);
    // }
    req.userId = decoded.id;

    // sheet nam data from user id
    // User.findOne({
    //   _id: req.userId,
    // }).exec((err, user) => {
    //   req.sheetName = user.sheetName;
    //   _sheetName == "1234";
    // });

    //next();
  });

  // User.findOne({
  //   _id: req.userId,
  // }).then((user) => {
  //   user.sheetName;
  // });
  const sheetId = await User.findOne({ _id: req.userId }).exec();

  //const _spreadsheetId = "1lIIQvSlAom2te5TjG5Xl-aJAlIDPvR8elvIX_1fflkg";
  //
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheetId.sheetName
  );
  //
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetData,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetHeader,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  //=======
  let headArr = getHeader.data.values;
  let headKey = [];
  headArr.forEach((e, i) => {
    headKey = e;
  });
  let bodyArr = getRows.data.values;

  if (bodyArr) {
    let bodyValues = [];
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });

    // console.log("headKey ---> ", headKey);
    // console.log("bodyValues ---> ", bodyValues);
    const obj = {};
    const objArr = [];
    const keys = headKey;
    const values = bodyValues;

    values.forEach((e, i) => {
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i]] = e[i];
        //console.log(" i ", i);
      }
      //console.log(" obj ", obj);
      objArr.push({
        id: e[0],
        Date: e[1],
        DataA: e[2],
        DataB: e[3],
        DataC: e[4],
        DataD: e[5],
        DataE: e[6],
        img: e[7],
        imgB: e[8],
        DesktopBanner: e[9],
        MobileBanner: e[10],
        ProductA: e[11],
        ProductB: e[12],
        ProductC: e[13],
        ProductD: e[14],
        ProductE: e[15],
        ProductF: e[16],
        ProductG: e[17],
        Promo: e[18],
        LineAdd: e[19],
        count: e[20],
        // MenuNameTitleA: e[21],
        // MenuNameTitleB: e[22],
        // MenuNameTitleC: e[23],
        // MenuNameTitleD: e[24],
        // MenuNameTitleE: e[25],
        // MenuNameTitleF: e[26],
      });
    });
    // console.log("objArr--> ", objArr);
    res.send({ status: "OK", data: objArr });
  } else {
    res.send({ status: "NO", data: "No Data" });
  }
};
