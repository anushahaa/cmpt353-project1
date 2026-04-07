import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await hashPassword("admin123");
  const aliceHash = await hashPassword("alice123");
  const bobHash = await hashPassword("bob123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      displayName: "Admin",
      passwordHash: adminHash,
      role: "admin"
    }
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      displayName: "Alice",
      passwordHash: aliceHash,
      role: "user"
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      displayName: "Bob",
      passwordHash: bobHash,
      role: "user"
    }
  });

  const channelCount = await prisma.channel.count();

  if (channelCount === 0) {
    const jsChannel = await prisma.channel.create({
      data: {
        name: "javascript",
        description: "Questions about JavaScript, Node.js, and frontend issues.",
        createdBy: alice.id
      }
    });

    const dockerChannel = await prisma.channel.create({
      data: {
        name: "docker",
        description: "Containers, Dockerfiles, Compose, and deployment basics.",
        createdBy: bob.id
      }
    });

    const post1 = await prisma.post.create({
      data: {
        channelId: jsChannel.id,
        authorId: alice.id,
        title: "Why is my fetch request returning 400?",
        body: "I am sending JSON from a form but my API keeps responding with status 400. What should I check first?"
      }
    });

    const reply1 = await prisma.reply.create({
      data: {
        postId: post1.id,
        authorId: bob.id,
        body: "Check that your Content-Type header is application/json and that the body fields match what the API expects."
      }
    });

    await prisma.reply.create({
      data: {
        postId: post1.id,
        parentReplyId: reply1.id,
        authorId: alice.id,
        body: "That helped. I had the wrong body field names."
      }
    });

    const post2 = await prisma.post.create({
      data: {
        channelId: dockerChannel.id,
        authorId: bob.id,
        title: "Docker container cannot connect to Postgres",
        body: "My app works locally but inside Docker it cannot reach the database service."
      }
    });

    await prisma.vote.create({
      data: {
        userId: bob.id,
        targetType: "post",
        targetId: post1.id,
        value: 1,
        postId: post1.id
      }
    });

    await prisma.vote.create({
      data: {
        userId: alice.id,
        targetType: "reply",
        targetId: reply1.id,
        value: 1,
        replyId: reply1.id
      }
    });

    await prisma.vote.create({
      data: {
        userId: admin.id,
        targetType: "post",
        targetId: post2.id,
        value: -1,
        postId: post2.id
      }
    });

    console.log("Seed complete.");
  } else {
    console.log("Seed skipped: channel data already exists.");
  }

  console.log("Admin credentials: admin@example.com / admin123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });