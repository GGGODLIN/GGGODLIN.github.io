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

export interface ArticleDiscoveryParamOptions {
  readonly validTopics?: ReadonlySet<string>;
  readonly validTags?: ReadonlySet<string>;
}

export function parseArticleDiscoverySearchParams(
  search: string,
  options: ArticleDiscoveryParamOptions = {},
): ArticleDiscoveryState {
  const params = new URLSearchParams(search);
  const rawTag = (params.get("tag") ?? "").trim();
  if (
    rawTag !== "" &&
    (!options.validTags || options.validTags.has(rawTag))
  ) {
    return createArticleDiscoveryState({ tagId: rawTag });
  }

  const rawTopic = (params.get("topic") ?? "").trim();
  const topicId =
    rawTopic !== "" &&
    (!options.validTopics || options.validTopics.has(rawTopic))
      ? rawTopic
      : "";
  const rawQuery = params.get("q") ?? "";
  const query = rawQuery.trim() === "" ? "" : rawQuery;

  return createArticleDiscoveryState({ query, topicId });
}

export function writeArticleDiscoverySearchParams(
  currentSearch: string,
  state: ArticleDiscoveryState,
): string {
  const params = new URLSearchParams(currentSearch);
  const trimmedQuery = state.query.trim();

  if (trimmedQuery !== "") {
    params.set("q", trimmedQuery);
  } else {
    params.delete("q");
  }

  if (state.topicId !== "") {
    params.set("topic", state.topicId);
  } else {
    params.delete("topic");
  }

  if (state.tagId !== "") {
    params.set("tag", state.tagId);
  } else {
    params.delete("tag");
  }

  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
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
