// Helper functions to generate personalized book metadata

interface BookMetadata {
  author: string;
  publicationDate: string;
  description: string;
  reviews: Array<{
    name: string;
    rating: number;
    date: string;
    text: string;
  }>;
}

// Generate consistent data based on book title
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const authors = [
  'Jane Austen', 'Mark Twain', 'Ernest Hemingway', 'Virginia Woolf', 'F. Scott Fitzgerald',
  'Harper Lee', 'George Orwell', 'J.R.R. Tolkien', 'Agatha Christie', 'Charles Dickens',
  'Emily Brontë', 'Oscar Wilde', 'Leo Tolstoy', 'Gabriel García Márquez', 'Toni Morrison',
  'James Joyce', 'Margaret Atwood', 'Kurt Vonnegut', 'Ray Bradbury', 'Ursula K. Le Guin',
  'Alice Walker', 'Chinua Achebe', 'Maya Angelou', 'Haruki Murakami', 'Isabel Allende',
  'Kazuo Ishiguro', 'Salman Rushdie', 'Zadie Smith', 'Chimamanda Ngozi Adichie', 'Colson Whitehead'
];

const reviewerNames = [
  'Sarah M.', 'John D.', 'Emily R.', 'Michael T.', 'Jessica L.',
  'David K.', 'Amanda P.', 'Christopher B.', 'Rachel W.', 'Daniel S.',
  'Lauren H.', 'Kevin F.', 'Nicole C.', 'Robert J.', 'Michelle A.',
  'Brian G.', 'Stephanie N.', 'Andrew M.', 'Jennifer Y.', 'Thomas V.',
  'Ashley Q.', 'Matthew Z.', 'Samantha X.', 'Joshua I.', 'Elizabeth O.'
];

const reviewTemplates = [
  (title: string) => `Absolutely loved "${title}"! The writing is captivating and the story kept me hooked from start to finish. Highly recommend to anyone looking for a great read.`,
  (title: string) => `"${title}" exceeded all my expectations. The author's storytelling ability is remarkable and I found myself thinking about this book days after finishing it.`,
  (title: string) => `I couldn't put "${title}" down! One of the best books I've read this year. The characters are so well-developed and the plot is engaging throughout.`,
  (title: string) => `Really enjoyed this one. "${title}" is well-written and engaging. Lost one star only because I felt the ending was a bit rushed, but overall a solid read.`,
  (title: string) => `"${title}" is a masterpiece. The prose is beautiful and the themes explored are both timely and timeless. Can't recommend this enough!`,
  (title: string) => `A compelling read from start to finish. "${title}" tackles complex themes with grace and insight. The author's voice is unique and powerful.`,
  (title: string) => `I picked up "${title}" on a whim and was blown away. The narrative is gripping and the character development is exceptional. A must-read!`,
  (title: string) => `"${title}" is exactly what I needed. The pacing is perfect and the story resonates on multiple levels. Already looking forward to re-reading it.`,
  (title: string) => `Wonderful book! "${title}" has everything - great characters, engaging plot, and beautiful prose. One of those books that stays with you.`,
  (title: string) => `I appreciated the depth and nuance in "${title}". While it had some slower moments, the overall experience was rewarding and thought-provoking.`,
  (title: string) => `"${title}" is a fantastic addition to the genre. The world-building is immersive and the story is both entertaining and meaningful.`,
  (title: string) => `Loved every page of "${title}". The author has a gift for creating vivid imagery and memorable characters. Highly recommended!`,
  (title: string) => `"${title}" was a delightful read. The writing style is accessible yet sophisticated, and the story kept me engaged throughout.`,
  (title: string) => `I found "${title}" to be both entertaining and enlightening. The themes are handled with care and the narrative is compelling.`,
  (title: string) => `Great book! "${title}" delivered on all fronts. The plot is well-constructed and the characters feel authentic and relatable.`
];

const descriptionTemplates = [
  (title: string) => `"${title}" is a captivating exploration of human nature and relationships. Through vivid storytelling and complex characters, this book takes readers on an emotional journey that challenges perspectives and touches the heart. The narrative weaves together themes of love, loss, and redemption in ways that feel both fresh and timeless. Perfect for readers who appreciate literary fiction with depth and nuance.`,
  (title: string) => `In this remarkable work, "${title}" delivers a powerful story that resonates long after the final page. The author's masterful prose brings to life a world rich in detail and authenticity. Whether you're drawn to character-driven narratives or thought-provoking themes, this book offers something special for every reader. A compelling addition to contemporary literature.`,
  (title: string) => `"${title}" stands as a testament to the power of storytelling. With its intricate plot and deeply human characters, this book invites readers into a world that feels both familiar and extraordinary. The author skillfully balances entertainment with insight, creating a reading experience that is as enjoyable as it is meaningful. A must-read for book lovers everywhere.`,
  (title: string) => `Discover the magic within the pages of "${title}". This beautifully crafted narrative explores universal themes through a unique and engaging lens. The prose is elegant, the characters unforgettable, and the story itself is a journey worth taking. Whether you're a casual reader or a literary enthusiast, you'll find much to appreciate in this exceptional work.`,
  (title: string) => `"${title}" is a triumph of imagination and craft. The author weaves together multiple layers of meaning while never losing sight of the human story at its core. Rich with symbolism and emotional depth, this book rewards careful reading and reflection. An outstanding achievement that deserves a place on every bookshelf.`
];

const bioTemplates = [
  (bookTitle: string) => `The author of ${bookTitle} is a celebrated writer known for creating deeply affecting works that explore the human condition with sensitivity and insight. Their writing has garnered critical acclaim and a devoted readership across generations. With a distinctive voice and masterful command of language, they continue to be one of the most important voices in contemporary literature.`,
  (bookTitle: string) => `The author of ${bookTitle} has established themselves as a literary force through their compelling narratives and rich character development. Their work spans multiple genres while maintaining a consistent commitment to excellence and authenticity. Critics and readers alike praise their ability to craft stories that are both entertaining and profound.`,
  (bookTitle: string) => `An author of remarkable talent, the writer of ${bookTitle} brings a unique perspective to every page. Their books have earned numerous accolades and touched the lives of countless readers around the world. With each new work, they demonstrate why they remain one of the most respected names in literature today.`,
  (bookTitle: string) => `The author of ${bookTitle} writes with passion, precision, and deep humanity. Their storytelling prowess has made them a beloved figure in the literary community, and their books continue to find new audiences year after year. Their contribution to literature is both significant and enduring.`,
  (bookTitle: string) => `Known for their evocative prose and keen insight into human nature, the author of ${bookTitle} has created a body of work that stands the test of time. Their writing resonates with readers seeking both entertainment and enlightenment, making them a true master of the craft.`
];

export function generateBookMetadata(bookTitle: string, createdAt?: string): BookMetadata {
  const hash = hashString(bookTitle);
  
  // No longer assigning specific authors - just use "the author"
  const author = `${bookTitle}'s Author`;
  
  // Generate publication date (between 2000 and 2024)
  const yearOffset = hash % 25;
  const year = 2000 + yearOffset;
  const month = (hash % 12) + 1;
  const day = (hash % 28) + 1;
  const publicationDate = new Date(year, month - 1, day).toISOString();
  
  // Select description and bio templates
  const descTemplate = descriptionTemplates[hash % descriptionTemplates.length];
  const description = descTemplate(bookTitle);
  
  // Generate 3 unique reviews with different reviewers
  const reviews = [];
  const usedReviewers = new Set<number>();
  
  for (let i = 0; i < 3; i++) {
    // Ensure we get a unique reviewer for each review
    let reviewerIndex;
    do {
      const reviewHash = hash + i * 7919; // Use prime number for better distribution
      reviewerIndex = reviewHash % reviewerNames.length;
    } while (usedReviewers.has(reviewerIndex));
    
    usedReviewers.add(reviewerIndex);
    
    const templateIndex = (hash + i * 1000) % reviewTemplates.length;
    
    // Generate rating (mostly 4-5 stars)
    const ratingRand = (hash + i * 500) % 10;
    const rating = ratingRand < 6 ? 5 : ratingRand < 9 ? 4 : 3;
    
    // Generate review date (within last 6 months)
    const daysAgo = ((hash + i * 300) % 180) + 1;
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - daysAgo);
    
    reviews.push({
      name: reviewerNames[reviewerIndex],
      rating,
      date: reviewDate.toISOString(),
      text: reviewTemplates[templateIndex](bookTitle)
    });
  }
  
  return {
    author,
    publicationDate,
    description,
    reviews
  };
}

export function generateAuthorBio(bookTitle: string): string {
  const hash = hashString(bookTitle);
  const bioTemplate = bioTemplates[hash % bioTemplates.length];
  return bioTemplate(bookTitle);
}
