# LINE 群語料 raw

## Source

`bruce-frontend-2026-05-17.txt` — LINE 群「布魯斯前端-前端技術交流&問答&尬聊隨便都行」匯出，user 在群裡暱稱 `NlGGGER_Lv2🐒`。

- 規模：1,174,030 行 / 59MB UTF-8
- 時間跨度：2021.11.15 → 2026.05.17（4.5 年）
- 全群 user 訊息：63,973 條（占第 2 名講者）

## 切片邏輯

整檔 + 切片三檔都在 `.gitignore`（檔案太大不進 git）。

| 檔案 | 範圍 | 規模 | 用途 |
|---|---|---|---|
| `bruce-frontend-2026-05-17.txt` | 全群 4.5 年 | 1.17M 行 / 59MB | source of truth |
| `all-user-messages-with-date.txt` | user 全 4.5 年訊息 | 63,973 行 / 4.95MB | intermediate（每行加 YYYY.MM.DD prefix） |
| `user-recent-1y.txt` | user 2025.05.01 → 2026.05.17 | 14,642 行 / 1.14MB | **蒸 voice-profile-line.md 用** |
| `user-archive-pre-2025-05.txt` | user 2021.11 → 2025.04 | 49,331 行 / 3.82MB | 暫存，未蒸 |

切法：awk 維護 current date state（LINE 訊息行只有 HH:MM，date 在 separator 行）→ filter user 訊息 → 加 date prefix → 用字串比較切兩段。

## Voice 屬性 caveat（蒸 + 採用要記住）

1. **暱稱 `NlGGGER_Lv2🐒` 是群內梗（n-word 諧音）**——蒸出的 voice profile 不要把暱稱嵌進去當識別符。敏感。
2. **LINE = 短句連發 reply**，跟 threads 思考成篇貼文性質不同。`voice-profile-line.md` 用途是 **register catalog**（語感參考），不是 writing template。直接套到 blog 會變短句堆疊垃圾。
3. **4.5 年 voice drift 不能 blend**——早期 2021-22 教學 register / 中段 2023-24 群內閒聊 / 近期 2025-26 觀點論述，性質差很大，混蒸會被平均化失真。
4. **內含同溫層髒話 + 群內梗**（D 女 VT、麥當勞可樂等），蒸時要分技術論述 + 生活閒聊兩 sub-register 並標清楚。

## 蒸餾狀態

- `style/voice-profile-line.md` — 最近 1 年蒸出的 9-axis voice profile（基於 `user-recent-1y.txt`）
- archive 部分（2021.11 → 2025.04）保留 raw 未蒸，有空再說

## 對應 threads voice

`style/voice-profile.md` 是 threads 17 main + 695 unique replies 蒸的 v1，**public-writing register** 為主。LINE voice 是 **private-chat register**，兩個分開不合併。

寫 blog draft 時：
- threads voice = 主用（公開技術寫作 baseline）
- LINE voice = 情境用（寫群聊感段落 / 對話拆解 / 反差 hook 時參考；正式論述段不該染 LINE 味）
