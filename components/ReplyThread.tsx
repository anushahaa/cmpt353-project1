import ReplyForm from "./ReplyForm";
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

export default function ReplyThread({
  replies,
  currentUser,
  depth = 0
}: {
  replies: ReplyNode[];
  currentUser: CurrentUser;
  depth?: number;
}) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="stack">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className="reply-card"
          style={{
            marginLeft: depth > 0 ? `${Math.min(depth * 20, 120)}px` : "0"
          }}
        >
          <p>{reply.body}</p>
          <p className="meta">
            By {reply.author.displayName} ·{" "}
            {new Date(reply.createdAt).toLocaleString()}
          </p>

          {reply.attachments.map((attachment) => (
            <img
              key={attachment.id}
              src={`/api/attachments/${attachment.id}`}
              alt="Reply screenshot attachment"
              className="attachment-img"
            />
          ))}

          <VoteButtons
            targetType="reply"
            targetId={reply.id}
            initialScore={reply.voteSummary.score}
            initialUpvotes={reply.voteSummary.upvotes}
            initialDownvotes={reply.voteSummary.downvotes}
            initialUserVote={reply.voteSummary.currentUserVote}
            currentUser={currentUser}
            isOwnContent={currentUser?.id === reply.authorId}
          />

          <div style={{ marginTop: "1rem" }}>
            <ReplyForm
              postId={reply.postId}
              parentReplyId={reply.id}
              currentUser={currentUser}
              compact
            />
          </div>

          {reply.children.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <ReplyThread
                replies={reply.children}
                currentUser={currentUser}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}