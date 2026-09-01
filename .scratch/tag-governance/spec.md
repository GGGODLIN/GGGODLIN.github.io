## Problem Statement

搜尋與 tag filter 上線後，文章 tag 已從附帶 metadata 變成讀者可點擊的導覽入口。現有 40 篇文章共有 62 種 raw tag，包含大小寫、空白／連字號、單複數與語意邊界不一致；首頁六個寬主題也有少數 label 過窄或 alias 過寬的情況。

目前 raw tag 點擊會把字串放進一般搜尋框，再搜尋標題、摘要與 tags。這讓 15／62 種 tag 的點擊結果混入沒有該 tag、只是在其他文字出現相同字串的文章，不符合「點 tag 是沿同主題文章繼續讀」的產品定義。

未來發布新文章時也沒有單一詞彙來源可以確認標準 ID、顯示名稱、近義詞、維度、意思與邊界。新 tag 若只靠當下判斷，既有變體與模糊邊界會繼續累積。

## Solution

建立專案內的活詞彙表，將 tag 的穩定資料 ID 與讀者看見的顯示名稱分離，並記錄 aliases、維度、意思與邊界。文章 frontmatter 改用標準 ID；介面透過詞彙表顯示可讀 label。

依已完成的全量稽核，遷移 19 篇文章的 tag，窄修首頁寬主題的名稱與 tag 對應，不重設整套分類。raw tag 點擊改為依標準 ID 與明列 alias 建立精確關係；一般文字搜尋保留原本搜尋標題、摘要與 tag 的能力。

文章使用未登記 tag 時，內容檢查必須失敗並指出該 tag 尚未確認。新增 tag 仍被允許，但必須先把標準 ID、顯示名稱、維度、意思與邊界登記進活詞彙表，不能無聲進入發布內容。

## User Stories

1. As a reader, I want clicking a tag to show articles that explicitly share that tag relationship, so that I can continue reading the same subject without unrelated substring matches. [user: "a是一定的"]
2. As a reader, I want general search to remain independent from tag navigation and preserve its current title, description, and visible-tag coverage, so that exact tag filtering does not reduce existing search behavior. [evidence: article discovery spec — search covers title, description, and current tag text]
3. As a reader, I want product and acronym tags to use readable display names such as `Claude Code` and `MCP`, so that internal IDs do not leak into the interface. [evidence: approved tag governance audit — current raw tag text is rendered directly]
4. As a reader, I want the seven audited format-variant groups to resolve to one relationship, so that related articles are not split across duplicate labels. [evidence: approved tag governance audit — seven explicit high-confidence variant groups]
5. As a reader, I want broad topic filters to remain stable unless the audit identifies a clear mismatch, so that navigation does not change gratuitously. [user: "確實要一起檢查"]
6. As a reader, I want the current `Review` group renamed to `品質與驗證`, so that its label matches the retained review, testing, fact-checking, and verification contents. [user: "看起來可以"]
7. As an author, I want a living tag vocabulary, so that I can reuse existing terms instead of inventing near-duplicates for each article. [user: "b"]
8. As an author, I want each tag to state its meaning and boundary, so that topic, article-angle, and proper-name tags can coexist without becoming ambiguous. [user: "不錯的原則"]
9. As an author, I want unregistered tags to pause publication for an explicit decision, so that new vocabulary cannot bypass review. [user: "可以"]
10. As an author, I want adding a legitimate new tag to be a normal registry update rather than a forbidden operation, so that the vocabulary is governed but not closed. [user: "可以"]
11. As an author, I want `claude-code` reserved for articles where Claude Code is an actual subject, so that it stops acting as a nearly universal site-identity tag. [user: "看起來可以"]
12. As a maintainer, I want article tags and broad-topic mappings validated together, so that the final migration cannot silently remove an article from its intended topic. [user: "確實要一起檢查"]
13. As a maintainer, I want the approved 19-article audit manifest applied and verified, so that implementation matches the reviewed corpus instead of re-deriving tag changes. [evidence: approved tag governance audit — 19 affected articles, independently verified]
14. As a maintainer, I want singleton tags preserved when they represent a coherent future reading path, so that frequency alone never deletes a useful series seed. [user: "b不是很重要，但也不用刻意把孤獨的tag拿掉，也許未來能形成系列文"]
15. As a maintainer, I want the final result countable against the 40-article source corpus, approved audit manifest, canonical registry, and six broad topics, so that completion cannot be claimed from a self-generated subset. [evidence: approved tag governance audit — external denominators are 40 articles, 62 raw tags, 54 candidate canonical tags, and six broad topics]

## Implementation Decisions

- Create one canonical tag registry owned by the project. Each entry contains a stable ID, display label, aliases, dimension, meaning, and boundary. [user: "b"]
- Use the canonical IDs listed by the approved audit manifest for this migration. Future entries MUST use a unique stable ID, but this change does not establish a universal singular or kebab-case naming law beyond the approved mappings. [evidence: approved tag governance audit — explicit canonical mapping for the current corpus]
- Store canonical IDs in article frontmatter and render labels from the registry on the homepage and article pages. [user: "看起來可以"]
- Keep the registry open: a new entry may be added at any time, but every frontmatter tag MUST resolve to a registered canonical ID before content checks pass. [user: "可以"]
- Reject duplicate IDs and aliases that resolve to more than one tag. Alias resolution MUST be deterministic. [inferred]
- Keep tag dimensions descriptive rather than exclusive. Supported dimensions include subject, article angle, and proper name; a dimension does not change matching behavior. [user: "不錯的原則"]
- Do not impose a minimum usage count or fixed tag count per article. Singleton status MUST NOT trigger deletion or validation failure. [user: "b不是很重要，但也不用刻意把孤獨的tag拿掉，也許未來能形成系列文"]
- Apply the seven explicit high-confidence format mappings from the approved audit manifest: `Claude Code`／`claude-code`, `MCP`／`mcp`, `hooks`／`hook`, `skills`／`skill`, `subagents`／`subagent`, `AI-agents`／`ai-agent`, and `AI-testing`／`ai-testing`. [evidence: approved tag governance audit — full before／after manifest]
- Apply the 19 article-level before／after rows from the approved audit manifest, including the independently corrected `retire-vector-memory` addition of `tool-adoption`. [evidence: approved tag governance audit — 19 affected articles, 151 valid evidence links, independent verification PASS]
- Preserve existing singleton product, concept, and article-angle tags unless the approved audit explicitly changes them. [user: "b不是很重要，但也不用刻意把孤獨的tag拿掉，也許未來能形成系列文"]
- Keep the six broad-topic structure and apply the approved audit manifest: rename `Review` to `品質與驗證`; remove `security` and `supply-chain` from that topic; remove `token-optimization` from `工具`; add canonical `ai-agent` and `workflow-resume` references to `工作流`. [evidence: approved tag governance audit — three topic／alias change rows and four independently verified decisions]
- Preserve `security`, `supply-chain`, and `token-optimization` as raw tags while changing their broad-topic mappings. Topic membership changes MUST NOT erase valid raw-tag relationships. [evidence: approved tag governance audit — raw tag meaning and topic alias meaning were reviewed separately]
- Keep `claude-code` on currently approved product-specific articles, remove it from `test-theater`, and stop treating it as a default for future articles. [user: "看起來可以"]
- Render tag buttons with the canonical tag ID as machine-readable data and the registry label as visible text. [user: "看起來可以"]
- Change raw-tag clicking to filter by exact canonical tag membership. Explicit aliases MAY resolve to the same canonical ID, but title or description substrings MUST NOT add articles to a tag result. [user: "a是一定的"]
- Keep general text search as case-insensitive substring search over title, description, and visible tag labels. Search MUST remain separate from exact tag filtering; canonical-ID-only and alias-only search are not required in v1. [evidence: article discovery spec — existing search covers title, description, and current visible tag text]
- Clicking a tag MUST activate an exact canonical-tag filter and clear the broad-topic selection without turning the interaction into a general text query. Whether the search panel opens is not part of the v1 contract. [evidence: current homepage click handler clears the active topic before filtering]
- Keep broad topics non-exclusive; one article MAY continue to belong to multiple topics. [evidence: topic mapping audit — 19 multi-topic articles are mostly valid]
- Keep content validation inside the repo rather than modifying the global writing skill. Every publishing path already reaches the project content check or production build, making the repo the enforceable boundary. [inferred]
- Make tag validation part of the existing content-check path so local checks and GitHub Pages builds reject unregistered or ambiguous tags. [user: "可以"]
- Validation errors MUST name the unknown tag and direct the maintainer to either reuse an existing ID or register a new entry. [inferred]
- The living vocabulary MUST remain human-readable and reviewable in the repo; generated lookup structures MAY be derived from it but MUST NOT become the only source of truth. [inferred]
- Do not redesign the page, topic controls, typography, animations, or visual theme as part of this change. [evidence: tag governance audit — narrow repair is supported; full redesign is not]

## Testing Decisions

- Use the highest existing static seam for data governance: run the project content/type check against the canonical registry, all article frontmatter, and all broad-topic references.
- Add deterministic tests or probes that fail when an article uses an unregistered ID, when two entries claim the same alias, when a topic references an unknown ID, or when a required registry field is missing.
- Verify the migrated corpus against external denominators: 40 source articles, all expected article IDs, the approved 19-article recommendation set, the final canonical tag set, and six broad topics.
- Verify that all 19 approved article changes match the audit report exactly; unchanged articles must remain unchanged except for mechanical canonicalization explicitly listed by the audit.
- Use the rendered homepage in a real browser as the primary interaction seam.
- Verify that clicking representative tags with former substring collisions, including `hook`, `skill`, `subagent`, and `workflow`, shows exactly the articles with the canonical tag relationship.
- Verify that general search still finds title-, description-, and visible-label matches after exact tag filtering is separated; ID-only and alias-only search are not required in v1.
- Verify that clicking a tag clears any selected broad topic, updates result count and empty state, and keeps keyboard and assistive-technology behavior intact.
- Verify all six broad topics after migration, including the renamed `品質與驗證` group and the removal of the two safety aliases and `token-optimization` tool alias.
- Verify article pages render readable labels rather than canonical IDs.
- Run the existing project check and production build after focused validation.
- Do not introduce a full frontend test framework solely for this feature; browser probes and deterministic registry validation are the preferred seams.

## Out of Scope

- Deleting tags solely because they currently appear once.
- Replacing the six broad topics with a new taxonomy.
- Adding every product or proper name to a broad-topic alias list.
- Adding tag analytics or deciding future removals from click frequency.
- Adding tag landing pages, URL persistence, multi-select tag filters, ranking, fuzzy search, or autocomplete.
- Redesigning the homepage, article cards, search controls, theme, typography, or animations.
- Modifying the global `material-first-writing` skill or other global Claude Code configuration.
- Rewriting article bodies, titles, descriptions, publication dates, or prose.
- Publishing a new article as part of this change.
- Maintaining a runtime or multi-commit legacy-alias compatibility layer solely for this migration.

## Further Notes

The approved audit remains the migration authority. The concise report defines the final decisions; the vocabulary and topic reports provide the full 62-tag, 40-article, and six-topic evidence.

The implementation should land as one complete final state: establish the registry and final topic references, migrate article IDs, switch rendering and click behavior, then run all static and browser checks before deployment. No runtime legacy-alias compatibility layer is required.

The chosen test seams are the existing project check/build for static governance and the rendered homepage for user-visible behavior. The user explicitly requested continuous execution, so intermediate audit, spec, ticket, and implementation boundaries are not separate stopping points unless a new major scope or risk decision appears.

## Implementation Findings

- Final corpus: 40 articles, 19 approved changed articles, 54 canonical registry entries, and no obsolete canonical IDs.
- Final topic counts: 工作流 13、模型 12、工具 16、記憶 4、品質與驗證 12、Hook 9；all 40 articles belong to at least one topic.
- Exact tag browser results: hook 9、skill 3、subagent 3、workflow 7; all result sets match canonical frontmatter membership.
- General search still matches title, description, and visible tag labels; the `Claude Code` label finds 37 product-specific articles.
- Browser verification at 360px found no horizontal overflow, tag buttons remained inside the viewport, keyboard Enter／Escape focus behavior passed, and the page retained one polite live region.
- Article pages render readable labels such as `Claude Code` and `MCP` rather than canonical IDs.
- The final implementation uses no runtime legacy-alias compatibility layer, no frontend test framework, no global skill modification, and no visual redesign.
- The corpus contract currently parses the repo's single-line JSON `tags: [...]` convention; all 40 articles match it. A future multiline YAML migration would require replacing that parser, but this is not needed for the current corpus.
