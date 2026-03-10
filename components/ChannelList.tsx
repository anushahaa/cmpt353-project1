import Link from "next/link";

type Channel = {
  id: number;
  name: string;
  description: string | null;
  creator: {
    displayName: string;
  };
  _count: {
    posts: number;
  };
};

export default function ChannelList({ channels }: { channels: Channel[] }) {
  if (channels.length === 0) {
    return (
      <div className="empty-state">
        No channels yet. Create one to get started.
      </div>
    );
  }

  return (
    <ul className="channel-list">
      {channels.map((channel) => (
        <li key={channel.id}>
          <Link className="channel-link" href={`/channels/${channel.id}`}>
            <strong>#{channel.name}</strong>
            <div className="meta">{channel.description || "No description"}</div>
            <div className="meta">
              By {channel.creator.displayName} · {channel._count.posts} post(s)
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}