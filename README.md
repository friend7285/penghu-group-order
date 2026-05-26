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

## 雲端訂單儲存

GitHub Pages 是純靜態網站，不能安全地在前端放 Anthropic 或 Google Drive API key。

若要直接寫入 Google Drive，請另外建立後端 API，並在 `.env.local` 設定：

```bash
VITE_ORDER_UPLOAD_ENDPOINT=https://your-api.example.com/orders
```

未設定 endpoint 時，系統會下載一筆 CSV 訂單資料，方便人工匯入訂單總表。
