const { driver, session } = require("./db");

const booksToSeed = [
  // Astronomy
  { title: "Cosmos", author: "Carl Sagan", category: "astronomy", description: "Exploring the mysteries of the universe." },
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "astronomy", description: "Understanding space, time and black holes." },
  { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", category: "astronomy", description: "A highly accessible introduction to astrophysics." },

  // Novels
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "novels", description: "A novel about the American dream." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "novels", description: "A novel about racial injustice." },
  { title: "1984", author: "George Orwell", category: "novels", description: "A dystopian social science fiction novel." },

  // Personality Development
  { title: "Atomic Habits", author: "James Clear", category: "personality", description: "An easy & proven way to build good habits & break bad ones." },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie", category: "personality", description: "Timeless advice for personal interactions." },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", category: "personality", description: "Powerful lessons in personal change." }
];

async function seedDatabase() {
  console.log("Seeding database...");
  try {
    // Clear out old nodes just in case to start fresh
    await session.run("MATCH (n:Book) DETACH DELETE n");

    // Seed default Admin User
    await session.run(
        "MERGE (u:User {username: 'meena'}) SET u.password = 'meena@123'"
    );
    console.log("Default admin user 'meena' seeded and password enforced!");

    // Insert new books
    for (const book of booksToSeed) {
      await session.run(
        `CREATE (b:Book {title: $title, author: $author, category: $category, description: $description})`,
        book
      );
      console.log(`Added: ${book.title}`);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();
