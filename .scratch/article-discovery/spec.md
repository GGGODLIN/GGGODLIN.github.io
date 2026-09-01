## Problem Statement

首頁目前一次顯示 39 篇文章。讀者若只記得文章談過的主題，必須逐篇掃過標題；若想探索同類內容，也缺少能縮小範圍的入口。

## Solution

在首頁文章列表前加入文字搜尋與單選主題篩選。所有文章維持預先渲染，瀏覽器只負責依條件顯示或隱藏既有項目。第一版不加入分頁、後端服務、模糊搜尋套件或全文索引。

## User Stories

1. As a reader, I want to search article titles, descriptions, and tags, so that I can find an article even when I do not remember its title. [user: "d"]
2. As a reader, I want to select one broad topic, so that I can explore related articles without knowing a search term. [user: "d"]
3. As a reader, I want text search and the selected topic to work together, so that I can narrow a broad topic further. [inferred]
4. As a reader, I want to see how many articles match, so that I understand whether the current conditions are active. [inferred]
5. As a reader, I want a clear empty state, so that zero visible articles do not look like a loading failure. [inferred]
6. As a keyboard or assistive-technology user, I want semantic controls and announced result changes, so that I can use the feature without relying on pointer interaction or visual inference. [inferred]
7. As a reader without JavaScript, I want the complete article list to remain available, so that the enhancement does not block access to content. [inferred]
8. As the site owner, I want a local preview through the existing development command, so that I can inspect the interaction before publishing. [user: "應該可以快速的做出來讓我在本地預覽對吧？"]
9. As the site owner, I want new articles to become searchable automatically, so that publishing does not require maintaining a separate search index. [inferred]
10. As the site owner, I want topic definitions maintained in one place, so that existing article frontmatter does not need a bulk migration. [inferred]

## Implementation Decisions

- Keep every article in the server-rendered homepage markup and progressively enhance the list in the browser. [evidence: the current homepage already renders the full collection with one list mapping]
- Use the platform search input and native buttons; do not add a component framework or search dependency. [evidence: package metadata currently contains Astro and publishing integrations only]
- Match normalized text against each article's title, description, and tags with case-insensitive substring comparison. [inferred]
- Use a single selected topic at a time; selecting the active topic again is not required because an explicit “全部” option resets it. [inferred]
- Combine text and topic conditions with logical AND. [inferred]
- Define a small set of editorial topic groups and their tag aliases in one source location. Do not expose every raw tag as a control. [evidence: 39 articles currently contain 62 raw tag spellings, including casing and singular/plural variants]
- Do not use “Claude Code” as a topic group because its normalized tag covers 31 of 39 articles and does not meaningfully narrow the list. [evidence: current article frontmatter tag count]
- Start with these topic groups: 工作流與 agent、模型與供應商、工具採用、記憶與知識、Review 與測試、Hook 與自動化. [inferred]
- Mark the active topic through visible styling and `aria-pressed`; expose result changes through a polite live status region. [evidence: modern-web-guidance forms and HTML guides recommend semantic controls and live announcements for dynamic updates]
- Hide non-matching article elements with the standard `hidden` state. Do not remove or refetch content. [inferred]
- Keep controls hidden until the enhancement script initializes, so a script failure does not leave non-functional controls above the complete list. [inferred]
- Preserve the existing theme variables, typography, spacing rhythm, article card markup, and responsive behavior. [evidence: the homepage already centralizes these visual conventions]
- Do not persist conditions in the URL or local storage in the first version. [inferred]

## Testing Decisions

- Use one highest-level seam: the rendered homepage in a real browser. Verify observable behavior rather than script internals.
- Verify the unfiltered initial state, title search, description/tag search, each topic control, combined text-plus-topic conditions, reset to all, zero-result state, result count, active-state semantics, keyboard operation, and narrow-screen layout.
- Verify progressive enhancement separately by inspecting the server-rendered output or disabling JavaScript and confirming that all 39 articles remain present.
- Run the existing Astro type/content check and production build before browser verification.
- The repo has no existing frontend test harness or equivalent homepage interaction tests; do not add one solely for this small feature. Browser probes provide the acceptance evidence.

## Out of Scope

- Pagination or load-more behavior.
- Server-side search, a hosted search service, or a dedicated search page.
- Full article-body search.
- Fuzzy matching, typo correction, ranking, highlighting, or autocomplete.
- Editing all article frontmatter to add a new category field.
- Multi-select topics.
- Search analytics or persisted query state.

## Further Notes

The feature should remain easy to remove in layers: topic controls and their mapping can be removed while retaining text search; the entire enhancement can be removed without changing article content or routing.
