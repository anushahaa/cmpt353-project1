import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.log("Seed skipped: data already exists.");
    return;
  }

  const alice = await prisma.user.create({
    data: {
      displayName: "Alice",
      passwordHash: "part1-no-auth-yet",
      role: "user"
    }
  });

  const bob = await prisma.user.create({
    data: {
      displayName: "Bob",
      passwordHash: "part1-no-auth-yet",
      role: "user"
    }
  });

  const carol = await prisma.user.create({
    data: {
      displayName: "Carol",
      passwordHash: "part1-no-auth-yet",
      role: "admin"
    }
  });

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

  await prisma.reply.create({
    data: {
      postId: post1.id,
      authorId: bob.id,
      body: "Check that your Content-Type header is application/json and that the body fields match what the API expects."
    }
  });

  await prisma.post.create({
    data: {
      channelId: dockerChannel.id,
      authorId: bob.id,
      title: "Docker container cannot connect to Postgres",
      body: "My app works locally but inside Docker it cannot reach the database service."
    }
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });