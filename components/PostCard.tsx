import ReplyForm from "./ReplyForm";

type Attachment = {
  id: number;
  mimeType: string;
};

type Reply = {
  id: number;
  body: string;
  createdAt: Date;
  author: {
    displayName: string;
  };
  attachments: Attachment[];
};

type Post = {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  author: {
    displayName: string;
  };
  attachments: Attachment[];
  replies: Reply[];
};

type User = {
  id: number;
  displayName: string;
};

export default function PostCard({
  post,
  users
}: {
  post: Post;
  users: User[];
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

      <section className="replies">
        <h4>Replies</h4>
        {post.replies.length === 0 ? (
          <div className="empty-state">No replies yet.</div>
        ) : (
          <div className="stack">
            {post.replies.map((reply) => (
              <div key={reply.id} className="reply-card">
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
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <ReplyForm postId={post.id} users={users} />
        </div>
      </section>
    </article>
  );
}