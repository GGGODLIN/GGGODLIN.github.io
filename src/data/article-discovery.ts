export interface ArticleDiscoveryItem {
  readonly id: string;
  readonly searchText: string;
  readonly topicIds: readonly string[];
  readonly tagIds: readonly string[];
}

export interface ArticleDiscoveryState {
  readonly query: string;
  readonly topicId: string;
  readonly tagId: string;
}

export type ArticleDiscoveryAction =
  | { readonly type: "search"; readonly query: string }
  | { readonly type: "topic"; readonly topicId: string }
  | { readonly type: "tag"; readonly tagId: string }
  | { readonly type: "reset" }
  | { readonly type: "close" };

export function createArticleDiscoveryState(
  state: Partial<ArticleDiscoveryState> = {},
): ArticleDiscoveryState {
  return {
    query: state.query ?? "",
    topicId: state.topicId ?? "",
    tagId: state.tagId ?? "",
  };
}

export function transitionArticleDiscovery(
  state: ArticleDiscoveryState,
  action: ArticleDiscoveryAction,
): ArticleDiscoveryState {
  if (action.type === "search") {
    return {
      ...state,
      query: action.query,
      tagId: "",
    };
  }

  if (action.type === "topic") {
    if (action.topicId === "") return createArticleDiscoveryState();
    return {
      ...state,
      topicId: action.topicId,
      tagId: "",
    };
  }

  if (action.type === "tag") {
    return createArticleDiscoveryState({
      tagId: state.tagId === action.tagId ? "" : action.tagId,
    });
  }

  return createArticleDiscoveryState();
}

export function hasArticleDiscoveryFilters(
  state: ArticleDiscoveryState,
): boolean {
  return (
    state.query.trim() !== "" || state.topicId !== "" || state.tagId !== ""
  );
}

export function filterArticleDiscovery<T extends ArticleDiscoveryItem>(
  articles: readonly T[],
  state: ArticleDiscoveryState,
): T[] {
  const query = state.query.trim().toLowerCase();

  return articles.filter((article) => {
    const matchesQuery =
      query === "" || article.searchText.toLowerCase().includes(query);
    const matchesTopic =
      state.topicId === "" || article.topicIds.includes(state.topicId);
    const matchesTag = state.tagId === "" || article.tagIds.includes(state.tagId);
    return matchesQuery && matchesTopic && matchesTag;
  });
}
