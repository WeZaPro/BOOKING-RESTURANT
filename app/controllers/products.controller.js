require("dotenv").config();
const { google } = require("googleapis");
const config = require("../config/auth.config");
const db = require("../models");
// const { user: User, role: Role, refreshToken: RefreshToken } = db;

// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");

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

exports.products = async (req, res, next) => {
  // public ไม่ต้องดึง sheet id จาก DB User
  //const _spreadsheetId = "1lIIQvSlAom2te5TjG5Xl-aJAlIDPvR8elvIX_1fflkg";
  const sheet_id_public = process.env.spreadsheetId;
  //
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
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
  // console.log("bodyArr ---> ", bodyArr);
  if (bodyArr) {
    let bodyValues = [];
    bodyArr.forEach((e, i) => {
      bodyValues.push(e);
    });

    // console.log("headKey ---> ", headKey);

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
    //console.log(" objArr >>>>", objArr);
    //
    // random---> array start
    let currentIndex = objArr.length;

    // 1.find max arr count
    // 2. เอา ข้อ 1 ออกจาก arr
    // 3.เอา arr ที่เหลือมา sort random
    // 4. เอาข้อ 3 มาเรียงต่อข้อ 1

    // let arr = [
    //   { name: "wee1", count: 2 },
    //   { name: "wee2", count: 3 },
    //   { name: "wee3", count: 1 },
    //   { name: "wee4", count: 5 },
    //   { name: "wee5", count: 4 },
    // ];
    // Find Max Value Object
    var xValues = objArr.map(function (o) {
      return o.count;
    });
    xValues = Array.from(objArr, (o) => o.count);
    var xMax = Math.max.apply(null, xValues);
    //console.log("xMax---->", xMax); // object max count
    var maxXObjects = objArr.filter(function (o) {
      return o.count === xMax;
    });
    // console.log("maxXObjects---->", maxXObjects); // array max count
    //==============
    // delete max value on array
    let maxArray = objArr.filter(function (obj) {
      return obj.count !== xMax;
    });
    //console.log("maxArray---->", maxArray); // array ที่เอา max count ออกแล้ว รอส่งไป random
    //
    random(maxArray);
    // console.log("random---->", maxArray); // array ที่เอา max count ออกแล้ว =>random
    let newMaxArr = [];
    newMaxArr.push(maxArray);
    //console.log("newMaxArr---->", newMaxArr);
    //
    //รวม Object array ==> maxXObjects +random(maxArray);
    let newSetArray = maxXObjects.concat(newMaxArr[0]);
    //console.log("newSetArray---->", newSetArray);

    // random---> array end
    //
    // res.send({ status: "OK", data: objArr });
    res.send({ status: "OK", data: newSetArray });
  } else {
    res.send({ status: "NO", data: "No Data" });
  }
};

// random function
const random = function (array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};

exports.charts = async (req, res, next) => {
  const _SheetChart = "Sheet01";
  const _SheetBarData = `${_SheetChart}!A2:Z`;
  const _SheetBarHeader = `${_SheetChart}!A1:Z1`;

  const sheet_id_public = process.env.spreadsheetId;
  //
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets(
    sheet_id_public
  );
  //
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetBarData,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const getHeader = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: _SheetBarHeader,
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
      console.log("bodyArr e ---> ", e);
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
        DataF: e[7],
      });
    });
    // console.log("objArr--> ", objArr);
    res.send({ status: "OK", data: objArr });
  } else {
    res.send({ status: "NO", data: "No Data" });
  }
};
