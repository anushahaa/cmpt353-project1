"use client";

import Link from "next/link";
import { useState } from "react";

type SearchMode =
  | "substring"
  | "author"
  | "most_posts"
  | "least_posts"
  | "highest_ranked"
  | "lowest_ranked";

type SearchResult =
  | {
      type: "content";
      targetType: "post" | "reply";
      id: number;
      title?: string | null;
      body: string;
      authorDisplayName: string;
      channelName: string;
      score: number;
      createdAt: string;
      link: string;
    }
  | {
      type: "user_summary";
      displayName: string;
      email: string;
      count: number;
    };

type ApiResponse = {
  mode: SearchMode;
  page: number;
  pageSize: number;
  hasMore: boolean;
  results: SearchResult[];
  searchedFields?: string[];
  rankingFormula?: string;
};

const PAGE_SIZE = 5;

export default function SearchPanel() {
  const [mode, setMode] = useState<SearchMode>("substring");
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchedFields, setSearchedFields] = useState<string[]>([]);
  const [rankingFormula, setRankingFormula] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSearch(nextPage = 1, append = false) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("page", String(nextPage));
      params.set("pageSize", String(PAGE_SIZE));

      if (query.trim()) {
        params.set("query", query.trim());
      }

      if (author.trim()) {
        params.set("author", author.trim());
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError((data as any).error || "Search failed.");
        return;
      }

      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page);
      setHasMore(data.hasMore);
      setSearchedFields(data.searchedFields || []);
      setRankingFormula(data.rankingFormula || "");
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(1, false);
  }

  function showQueryInput() {
    return mode === "substring";
  }

  function showAuthorInput() {
    return mode === "author";
  }

  return (
    <div className="stack">
      <section className="form-card">
        <h2>Search controls</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="search-mode">Query type</label>
            <select
              id="search-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as SearchMode)}
            >
              <option value="substring">Substring search across posts + replies</option>
              <option value="author">Content by a specific author</option>
              <option value="most_posts">User with most posts</option>
              <option value="least_posts">User with least posts</option>
              <option value="highest_ranked">Highest-ranked content</option>
              <option value="lowest_ranked">Lowest-ranked content</option>
            </select>
          </div>

          {showQueryInput() && (
            <div style={{ marginTop: "0.8rem" }}>
              <label htmlFor="search-query">Search text</label>
              <input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. docker postgres"
                required
              />
            </div>
          )}

          {showAuthorInput() && (
            <div style={{ marginTop: "0.8rem" }}>
              <label htmlFor="search-author">Author name</label>
              <input
                id="search-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Alice"
                required
              />
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Run search"}
            </button>
          </div>
        </form>

        {searchedFields.length > 0 && (
          <p className="meta" style={{ marginTop: "1rem" }}>
            Searched fields: {searchedFields.join(", ")}
          </p>
        )}

        {rankingFormula && (
          <p className="meta">Ranking formula: {rankingFormula}</p>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>Results</h2>

        {results.length === 0 ? (
          <div className="empty-state">
            No results yet. Run a search to see matches.
          </div>
        ) : (
          <div className="stack">
            {results.map((result, index) =>
              result.type === "content" ? (
                <article key={`${result.targetType}-${result.id}-${index}`} className="post-card">
                  <h3 className="post-title">
                    {result.targetType === "post"
                      ? result.title || "Untitled post"
                      : "Reply"}
                  </h3>

                  <p>{result.body}</p>

                  <p className="meta">
                    By {result.authorDisplayName} in #{result.channelName} · Score:{" "}
                    {result.score} · {new Date(result.createdAt).toLocaleString()}
                  </p>

                  <Link href={result.link}>Open content</Link>
                </article>
              ) : (
                <article key={`${result.displayName}-${index}`} className="post-card">
                  <h3 className="post-title">{result.displayName}</h3>
                  <p className="meta">{result.email}</p>
                  <p>Post count: {result.count}</p>
                </article>
              )
            )}
          </div>
        )}

        {hasMore && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => runSearch(page + 1, true)}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}