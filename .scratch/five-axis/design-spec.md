# 設計 spec · 五軸交叉審示意動畫（三方向板共同輸入）

## Phase 2 顧問式重述
這不是一支宣傳片，是一篇技術部落格文章中段的「概念示意」。文章講的是：作者自己寫的 `/pr-review` 指令把同一份 PR diff 交給五個不同的 AI reviewer 看，每個 reviewer 拿到的 context 故意不一樣——主模型餵滿（spec、影響面、檢查表）、Codex 只給 diff、Codex 紅隊換成「假設它會炸」的人格、Gemini Pro 獨立視角（那場沒出勤）、Gemini Flash 模型小一號。結果四個都漏掉一顆死掉的 Save 按鈕（`<ShopifySaveBar>` 少傳 `handleSave`，build 全過、按下去沒反應），最小的 Gemini Flash 抓到了。作者的結論：換更強的模型，同一視角還是同一批盲點；要加的是視角數，而視角差是用不同 context 餵出來的。

讀者是台灣工程師，多半自己也在用 coding agent。他們讀純文字時卡的點是「五個 reviewer 到底差在哪」——文字要講五段，動畫可以讓五條線**同時**掃同一份 diff、只有一條亮起，一眼看懂「同輸入、不同 context、不同結果」。動畫無聲、自動循環、寬約 800px 嵌在文章中段，讀者不會點它、不會等它，所以前 3 秒就要看得出主體，15–20 秒內講完一件事，循環回頭不突兀。使用者沒說出口的期待：跟站台的 Anthropic warm editorial 氣質一致（暖米底、深墨字、單一 terracotta accent），不要像 SaaS 宣傳片，要像一張「會動的編輯圖解」。

基於這個理解，直接做 3 個不同方向的真實版本給使用者看。

## 產出形態與尺寸（三版統一）
- 方向板 = 動畫 hero 關鍵幀的**真實 HTML 靜幀** 1 張（畫面：五條線同時掃 diff、只有一條亮起的那一瞬），1280×720，另附色板條、一句氣質定位、參照作品名
- 單檔 HTML、純 HTML/CSS（可用 inline SVG），中文字型 Google Fonts；logo 用 `assets/logos/*.svg` 以 base64 或相對路徑內嵌
- 截圖指令（本機無 Playwright browser，用 Chrome headless）：
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=1280,720 --virtual-time-budget=3000 --screenshot=<out.png> "file://<abs>.html"`

## 內容要點（真實內容，不用假資料）
1. 輸入：一份 diff，`NewPage.tsx`，`<ShopifySaveBar isDirty isLoading handleDiscard />`，缺 `handleSave`，註記「build ✓ · type-check ✓ · 按下去沒反應」
2. 五條 reviewer 線與各自的 context 餵法：
   - 主模型 ×2 reviewer（Claude）— 餵滿：spec + sem 影響面 + 檢查表 → 漏
   - Codex 中性（OpenAI）— 餓著：只給 diff → 漏
   - Codex 紅隊（OpenAI）— 餓著 + 人格「假設它會炸，去找哪裡炸」→ 漏（另提一條誤報）
   - Gemini Pro — 第三家模型獨立視角 → 那場未出勤
   - Gemini Flash · Medium — 同上、模型小一號、橫向比對兩個相似元件 → 抓到 → 複查屬實 → Must Fix
3. 結語一句：「要加的是視角數，不是模型強弱」

## 視覺母題（form 從內容長出來）
「同一份輸入、五條分歧的視線」——diff 是光源／靶心，五條線是視線，四條擦過、一條命中。母題必須是**視線／掃描**而不是流程圖箭頭；命中的那條是畫面唯一的 accent。

## 情感基調
冷靜、編輯感、有一點「小咖抓到大咖沒抓到的」反差幽默；不興奮、不炫技。

## 約束
- 色板以 `brand-spec.md` 為底；三方向可在此之上做不同詮釋，但正文對比 ≥4.5:1、標籤 ≥12px（此為 1280 寬靜幀；實際 GIF 縮到 800px 時仍要可讀，所以字級寬鬆）
- 出現的產品名必配官方 logo（四個都已在 `assets/logos/`），不畫自製 icon
- 不加浮水印、無音訊
- 三版布局骨架必須互異（構圖／五線排列方式／diff 位置至少一項結構性不同），不許換皮
