const FOLDER_NAME = "黑妞團購訂單";
const SPREADSHEET_NAME = "訂單總表";
const SHEET_NAME = "訂單";
const DEFAULT_HEADER = [
  "訂單編號",
  "建立時間",
  "訂購人",
  "電話",
  "取貨方式",
  "收件位置",
  "出貨日",
  "常溫小計",
  "冷凍小計",
  "總金額",
  "常溫運費狀態",
  "商品明細",
  "備註",
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const header = Array.isArray(payload.headerCells) ? payload.headerCells : DEFAULT_HEADER;
    const row = Array.isArray(payload.cells) ? payload.cells : [];

    if (!payload.orderId || row.length === 0) {
      throw new Error("缺少訂單資料");
    }

    const spreadsheet = getOrderSpreadsheet();
    const sheet = getOrderSheet(spreadsheet, header);

    sheet.appendRow(row);
    sheet.autoResizeColumns(1, header.length);

    return jsonOutput({
      ok: true,
      orderId: payload.orderId,
      spreadsheetUrl: spreadsheet.getUrl(),
      message: `成功新增訂單編號：${payload.orderId}`,
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      message: error.message,
    });
  }
}

function getOrderSpreadsheet() {
  const folder = getOrCreateFolder(FOLDER_NAME);
  const files = folder.getFilesByName(SPREADSHEET_NAME);

  if (files.hasNext()) {
    return SpreadsheetApp.openById(files.next().getId());
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  return spreadsheet;
}

function getOrderSheet(spreadsheet, header) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0].setName(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
