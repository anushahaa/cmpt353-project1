import SearchPanel from "@/components/SearchPanel";

export default function SearchPage() {
  return (
    <div className="stack">
      <section className="hero">
        <h1>Search</h1>
        <p className="meta">
          Search posts and replies, filter by author, find users with most or least
          posts, and find highest- or lowest-ranked content.
        </p>
      </section>

      <SearchPanel />
    </div>
  );
}