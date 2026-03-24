import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const fiction = await prisma.category.upsert({
    where: { slug: "fiction" },
    update: {},
    create: { name: "Fiction", slug: "fiction" },
  });

  const memoir = await prisma.category.upsert({
    where: { slug: "memoir" },
    update: {},
    create: { name: "Memoir", slug: "memoir" },
  });

  const poetry = await prisma.category.upsert({
    where: { slug: "poetry" },
    update: {},
    create: { name: "Poetry", slug: "poetry" },
  });

  // Create tags
  const love = await prisma.tag.upsert({
    where: { slug: "love" },
    update: {},
    create: { name: "Love", slug: "love" },
  });

  const loss = await prisma.tag.upsert({
    where: { slug: "loss" },
    update: {},
    create: { name: "Loss", slug: "loss" },
  });

  const nature = await prisma.tag.upsert({
    where: { slug: "nature" },
    update: {},
    create: { name: "Nature", slug: "nature" },
  });

  const childhood = await prisma.tag.upsert({
    where: { slug: "childhood" },
    update: {},
    create: { name: "Childhood", slug: "childhood" },
  });

  const mystery = await prisma.tag.upsert({
    where: { slug: "mystery" },
    update: {},
    create: { name: "Mystery", slug: "mystery" },
  });

  // Story 1
  await prisma.story.upsert({
    where: { slug: "the-last-library" },
    update: {},
    create: {
      title: "The Last Library",
      slug: "the-last-library",
      excerpt:
        "In the city where screens had replaced every page, one woman still kept the old flame burning between walls of forgotten words.",
      coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      published: true,
      featured: true,
      content: `<h2>The Last Library</h2>
<p>The smell hit her first — that ancient perfume of dust, vanilla, and slowly exhaling paper that she had loved since she was seven years old. Mara pushed open the door to the Wren Street Library with her shoulder, both arms wrapped around a stack of returns that had been living under her bed for three months.</p>
<p>"You're the only person I've seen all week," said the librarian, not looking up from her cataloguing. Her name was Elodie, and she had been saying some version of this sentence every time Mara came in for the past two years.</p>
<p>"You say that every time," Mara said, setting the books on the counter with a thud that sent a small cloud of dust into the afternoon light.</p>
<p>"It's true every time." Elodie finally looked up, silver-haired and small, her reading glasses perched at the very tip of her nose. "They're going to close us, you know. November. Official."</p>
<p>Mara felt something drop inside her chest, like a book falling from the top shelf. She had been expecting it. Everyone had been expecting it. The city had been making noise about the building's lease for years, and screens had replaced the need for paper in most people's minds, if not their hearts.</p>
<p>But knowing a thing is coming and feeling it arrive are entirely different experiences.</p>
<blockquote><p>"Some books," Elodie said, running a hand along a row of spines the way another woman might stroke a sleeping cat, "were not written to be read on screens. They were written to be <em>held</em>."</p></blockquote>
<p>Mara walked the aisles slowly, trailing her fingers along the shelves, reading the titles like lines of a poem. <em>The Sea, The Sea. Housekeeping. Beloved. A Room with a View.</em> Each spine a door. Each book a country she could enter and exit at will, richer for the journey.</p>
<p>She pulled one down at random — a thin collection of Neruda poems — and opened it to the middle. The previous reader had underlined a line in pencil, the lightest possible pressure, as though afraid of hurting the page: <em>I want to do with you what spring does with the cherry trees.</em></p>
<p>She stood there for a long moment, holding the book, holding the line, thinking about what it means to make something bloom.</p>
<p>When she finally left, two hours later, she had checked out eleven books. Her bag strained and her arms ached. Elodie stamped each one with a small, deliberate satisfaction.</p>
<p>"I'll be back next week," Mara said.</p>
<p>"I know." Elodie smiled. "You always come back."</p>
<p>Mara walked home through the blue autumn evening, the weight of the books against her hip like the hand of an old friend.</p>`,
      categories: {
        create: [{ categoryId: fiction.id }],
      },
      tags: {
        create: [{ tagId: loss.id }, { tagId: mystery.id }],
      },
      comments: {
        create: [
          {
            authorName: "Elara",
            body: "This story made me want to go find my nearest library immediately. The line about knowing a thing is coming and feeling it arrive — I felt that deeply.",
            approved: true,
          },
          {
            authorName: "Tom R.",
            body: "Beautiful writing. The Neruda quote woven in was perfect.",
            approved: true,
          },
        ],
      },
    },
  });

  // Story 2
  await prisma.story.upsert({
    where: { slug: "the-color-of-grandmother" },
    update: {},
    create: {
      title: "The Color of Grandmother",
      slug: "the-color-of-grandmother",
      excerpt:
        "She wore the same shade of amber all her life — in her scarves, her teacups, her eyes. Only after she was gone did I understand why.",
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      published: true,
      featured: true,
      content: `<h2>The Color of Grandmother</h2>
<p>My grandmother never explained herself. This was not rudeness — it was, I think, a form of dignity. She simply was what she was, and if you were patient enough, paying enough attention, you eventually began to understand.</p>
<p>What I understood first was her color. It sounds strange to say that a person has a color, but she did. It was amber — that warm, trapped-light gold that you find in old honey jars and autumn afternoons and the eyes of certain cats. It ran through everything she chose.</p>
<p>Her favorite scarf was amber silk, worn so often the edges had gone soft as skin. Her teacups — she had dozens, collected from markets and relatives and countries she'd left behind — were the color of strong tea with milk: that amber-adjacent warmth. Even her reading lamp cast amber light, and she would sit beneath it for hours, her hands moving through yarn or photographs or the pages of books I was not yet old enough to appreciate.</p>
<h3>What I Didn't Know</h3>
<p>It was only after she died — after I had inherited the scarf, the teacups, the lamp, the boxes of photographs — that I found the letter. It was written in a language I don't speak, to a person whose name I didn't recognize, dated six months before my mother was born.</p>
<p>I had it translated by a university student who worked in the café near my apartment. He read it quickly, then slowly, then handed it back to me with an expression I couldn't quite read.</p>
<p>"It's a love letter," he said. "She's describing a man she met on a train. She says his eyes were the color of amber. She says she will never see him again."</p>
<blockquote><p>She spent her whole life carrying the color of someone she let go. Or maybe the color carried her. Maybe that is what love does — it dyes you all the way through, and even when the person is gone, you remain that particular shade forever.</p></blockquote>
<p>I sat with this for a long time. I thought about all the things I had assumed about my grandmother — her silence, her self-containment, her amber world — and how completely wrong I had been. I thought she had been a woman who kept things simple. Instead she had been a woman who kept things.</p>
<p>I poured tea into one of her cups and sat beneath her lamp and held the letter, which I could not read but did not need to. Some things you understand not through translation but through the body, through the slow warming of your hands around old porcelain.</p>
<p>My grandmother never explained herself. But she left, in amber light, the shape of everything that mattered.</p>`,
      categories: {
        create: [{ categoryId: memoir.id }],
      },
      tags: {
        create: [{ tagId: love.id }, { tagId: loss.id }, { tagId: childhood.id }],
      },
      comments: {
        create: [
          {
            authorName: "Priya",
            body: "I read this three times. The idea that grief can live inside a color — that's something I've felt but never had words for until now.",
            approved: true,
          },
        ],
      },
    },
  });

  // Story 3
  await prisma.story.upsert({
    where: { slug: "a-field-in-october" },
    update: {},
    create: {
      title: "A Field in October",
      slug: "a-field-in-october",
      excerpt:
        "The meadow at the edge of town asked nothing of me. In a season of too many questions, that silence became the most generous gift.",
      coverImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
      published: true,
      featured: false,
      content: `<h2>A Field in October</h2>
<p>There is a meadow at the edge of my town that nobody seems to know about, or if they know about it, they have decided to leave it alone. I found it three Octobers ago, taking a wrong turn on a walk I had meant to be shorter, and I have been going back ever since.</p>
<p>It is not a beautiful field in any conventional sense. The grass grows unevenly, in tufts and patches. There's a rusted metal post near the center whose original purpose is unguessable. A line of scrubby trees marks one edge, and beyond them, the town continues — streets and cars and the noise of ordinary life — but inside the field, these things seem very far away.</p>
<p>I started going there during the year when everything felt like a question I couldn't answer. My father had been ill. My relationship had ended, not badly but painfully — the way a clean break is still a break. I had moved to a new apartment that I kept referring to, out of some fierce optimism, as "mine," even though the word felt strange in my mouth.</p>
<h3>What the Field Gave Me</h3>
<p>The field asked nothing of me. This sounds simple, but in a season of too many demands — too many check-ins, too many decisions, too many versions of <em>how are you doing?</em> that required a considered answer — the field's indifference was the most generous gift I had ever received.</p>
<p>I would sit on the ground, usually on an old jacket I kept specifically for this purpose, and I would watch the grass move. Starlings would arrive in murmurations, those startling collective shapes that are like a single mind moving through air. The sky in October is a particular blue — deeper, more serious than summer blue, a blue that is already thinking about winter.</p>
<blockquote><p>The field did not require me to be well. It did not require me to be anything at all. I could be sad there, or peaceful, or both at once, and the field simply continued being a field, which was, it turned out, exactly what I needed to witness.</p></blockquote>
<p>I think about why we go to wild places when we are struggling, and I think it is this: nature is the only thing that continues regardless. The starlings do not pause their murmurations for human grief. The October sky does not delay its deepening. And in the presence of things that simply continue, we are somehow given permission to continue too.</p>
<p>My father recovered. The apartment became mine in the way I'd hoped it would. The field is still there, still asking nothing, still offering everything it has: grass, sky, the occasional fox at dusk, the starlings writing their brief messages in the air.</p>
<p>I go every October. I bring the jacket. I sit on the ground and watch, and I am reminded that presence — just being somewhere, just attending to what is — is itself a kind of answer.</p>`,
      categories: {
        create: [{ categoryId: memoir.id }, { categoryId: poetry.id }],
      },
      tags: {
        create: [{ tagId: nature.id }, { tagId: loss.id }],
      },
      comments: {
        create: [
          {
            authorName: "Daniel M.",
            body: "The way you describe the October sky — deeper, more serious — I felt it immediately. This essay is a gift.",
            approved: true,
          },
          {
            authorName: "Jess",
            body: "I needed to read this today. Thank you.",
            approved: true,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded with 3 stories, categories, tags, and comments.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
