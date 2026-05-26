# 黑妞原味小舖團購訂購單

React + Vite 製作的團購訂購單，可部署到 GitHub Pages。

## 本機開發

```bash
npm install
npm run dev
```

## 上架到 GitHub Pages

1. 在 GitHub 建立一個新 repository。
2. 將本機 repository push 到 GitHub。
3. 到 GitHub repository 的 Settings > Pages。
4. Source 選擇 GitHub Actions。
5. 推送到 `main` 後，Actions 會自動部署。

## 自動寫入 Google Drive

GitHub Pages 是純靜態網站，不能安全地在前端放 Google Drive API key。這個專案使用 Google Apps Script Web App 當中介，訂單送出後會自動寫入你的 Google Drive。

Apps Script 會自動建立：

- Google Drive 資料夾：`黑妞團購訂單`
- Google 試算表：`訂單總表`
- 工作表：`訂單`

### 1. 建立 Google Apps Script

1. 開啟 [Google Apps Script](https://script.google.com/)。
2. 建立新專案。
3. 將 [google-apps-script/Code.gs](google-apps-script/Code.gs) 的內容貼到 Apps Script 的 `Code.gs`。
4. 按下部署 > 新增部署作業。
5. 類型選擇「網頁應用程式」。
6. 執行身分選擇「我」。
7. 存取權選擇「任何人」。
8. 部署後複製 Web App URL。

### 2. 本機測試

建立 `.env.local`：

```bash
VITE_ORDER_UPLOAD_ENDPOINT=https://script.google.com/macros/s/你的部署ID/exec
```

然後重新啟動：

```bash
npm run dev
```

### 3. GitHub Pages 設定

將 Web App URL 存到 GitHub Actions secret：

```bash
gh secret set VITE_ORDER_UPLOAD_ENDPOINT --body "https://script.google.com/macros/s/你的部署ID/exec"
```

再推送到 GitHub，GitHub Pages 會重新部署：

```bash
git add .
git commit -m "Add Google Drive order upload"
git push
```

未設定 endpoint 時，系統會下載一筆 CSV 訂單資料，方便人工匯入訂單總表。
