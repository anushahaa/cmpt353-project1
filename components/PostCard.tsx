import ReplyForm from "./ReplyForm";
import ReplyThread from "./ReplyThread";
import VoteButtons from "./VoteButtons";

type CurrentUser =
  | {
      id: number;
      email: string;
      displayName: string;
      role: string;
    }
  | null;

type ReplyNode = {
  id: number;
  postId: number;
  parentReplyId: number | null;
  body: string;
  createdAt: Date | string;
  authorId: number;
  author: {
    displayName: string;
  };
  attachments: {
    id: number;
    mimeType: string;
  }[];
  voteSummary: {
    score: number;
    upvotes: number;
    downvotes: number;
    currentUserVote: number;
  };
  children: ReplyNode[];
};

type Post = {
  id: number;
  title: string;
  body: string;
  createdAt: Date | string;
  authorId: number;
  author: {
    displayName: string;
  };
  attachments: {
    id: number;
    mimeType: string;
  }[];
  voteSummary: {
    score: number;
    upvotes: number;
    downvotes: number;
    currentUserVote: number;
  };
  replies: ReplyNode[];
};

export default function PostCard({
  post,
  currentUser
}: {
  post: Post;
  currentUser: CurrentUser;
}) {
  return (
    <article className="post-card">
      <h3 className="post-title">{post.title}</h3>
      <p>{post.body}</p>
      <p className="meta">
        By {post.author.displayName} · {new Date(post.createdAt).toLocaleString()}
      </p>

      {post.attachments.map((attachment) => (
        <img
          key={attachment.id}
          src={`/api/attachments/${attachment.id}`}
          alt="Post screenshot attachment"
          className="attachment-img"
        />
      ))}

      <VoteButtons
        targetType="post"
        targetId={post.id}
        initialScore={post.voteSummary.score}
        initialUpvotes={post.voteSummary.upvotes}
        initialDownvotes={post.voteSummary.downvotes}
        initialUserVote={post.voteSummary.currentUserVote}
        currentUser={currentUser}
        isOwnContent={currentUser?.id === post.authorId}
      />

      <section className="replies">
        <h4>Replies</h4>
        {post.replies.length === 0 ? (
          <div className="empty-state">No replies yet.</div>
        ) : (
          <ReplyThread replies={post.replies} currentUser={currentUser} />
        )}

        <div style={{ marginTop: "1rem" }}>
          <ReplyForm postId={post.id} currentUser={currentUser} />
        </div>
      </section>
    </article>
  );
}