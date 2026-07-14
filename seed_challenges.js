const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');

const casesDir = 'C:\\Users\\saisr\\OneDrive\\Desktop\\Shreya\\Shreya\\backend\\data\\cases';

const conceptToChapterMap = {
  'print() — Output & What is Code?': { num: 1, name: 'Jungle of Prints!' },
  'print() — Output & What is Code?': { num: 1, name: 'Jungle of Prints!' }, // matching different dash forms
  'print() - Output & What is Code?': { num: 1, name: 'Jungle of Prints!' },
  'Variables & Data Storage': { num: 2, name: 'Forest Signposts' },
  'Data Types (str, int, float, bool)': { num: 3, name: 'Potion Alchemy Tiers' },
  'String Operations & Indexing': { num: 4, name: 'Rune Slices & Matrices' },
  'Arithmetic & Operators': { num: 5, name: 'Market Calculation Grids' },
  'Comparisons — ==, !=, <, >, <=, >=': { num: 6, name: 'Hero Stat Gates' },
  'Comparisons — ==, !=, <, >, <=, >= ': { num: 6, name: 'Hero Stat Gates' },
  'Comparisons - ==, !=, <, >, <=, >=': { num: 6, name: 'Hero Stat Gates' },
  
  'if Statements — The First Decision': { num: 7, name: 'Pathways of Decisions' },
  'if Statements - The First Decision': { num: 7, name: 'Pathways of Decisions' },
  'if / elif / else — Multi-Choice Decisions': { num: 7, name: 'Pathways of Decisions' },
  'if / elif / else - Multi-Choice Decisions': { num: 7, name: 'Pathways of Decisions' },
  'Nested Conditionals': { num: 7, name: 'Pathways of Decisions' },
  
  'Logical Operators — and, or, not': { num: 8, name: 'Spells of Logic Gates' },
  'Logical Operators - and, or, not': { num: 8, name: 'Spells of Logic Gates' },
  
  'for loops + range()': { num: 9, name: 'Infinite Mana Loops' },
  'while loops': { num: 9, name: 'Infinite Mana Loops' },
  'break and continue': { num: 9, name: 'Infinite Mana Loops' },
  'Nested loops': { num: 9, name: 'Infinite Mana Loops' },
  'Accumulator pattern': { num: 9, name: 'Infinite Mana Loops' },
  
  'Creating & accessing lists': { num: 10, name: 'Party Member Rosters' },
  'Creating & accessing lists ': { num: 10, name: 'Party Member Rosters' },
  'List methods — append, insert, remove, pop': { num: 10, name: 'Party Member Rosters' },
  'List iteration with for loops': { num: 10, name: 'Party Member Rosters' },
  'List slicing': { num: 10, name: 'Party Member Rosters' },
  '2D lists (nested lists)': { num: 10, name: 'Party Member Rosters' },
  
  'Defining & calling functions': { num: 11, name: 'Summoner Parameters' },
  'Parameters & arguments': { num: 11, name: 'Summoner Parameters' },
  'Return values': { num: 11, name: 'Summoner Parameters' },
  'Default parameters & scope': { num: 11, name: 'Summoner Parameters' },
  '*args and **kwargs': { num: 11, name: 'Summoner Parameters' },
  
  'Creating & accessing dictionaries': { num: 12, name: 'Guild Registry Vaults' },
  'Dictionary methods — keys, values, items': { num: 12, name: 'Guild Registry Vaults' },
  'Adding, updating, and deleting entries': { num: 12, name: 'Guild Registry Vaults' },
  'Nested dictionaries': { num: 12, name: 'Guild Registry Vaults' },
  'Dictionary membership and counting': { num: 12, name: 'Guild Registry Vaults' },
  
  'Reading from files': { num: 13, name: 'Chronicle Librarians' },
  'Writing to files': { num: 13, name: 'Chronicle Librarians' },
  'String methods — strip, split, replace, upper, lower': { num: 13, name: 'Chronicle Librarians' },
  'f-strings and string formatting': { num: 13, name: 'Chronicle Librarians' },
  'Processing text files and CSV parsing': { num: 13, name: 'Chronicle Librarians' },
  'Reading files — open, read, close': { num: 13, name: 'Chronicle Librarians' },
  'Writing files — creating and overwriting': { num: 13, name: 'Chronicle Librarians' },
  
  'List comprehensions': { num: 14, name: 'Weavers of Comprehensions' },
  'Dict comprehensions': { num: 14, name: 'Weavers of Comprehensions' },
  'Filtering with comprehensions': { num: 14, name: 'Weavers of Comprehensions' },
  'Nested comprehensions': { num: 14, name: 'Weavers of Comprehensions' },
  'Comprehensions with zip and enumerate': { num: 14, name: 'Weavers of Comprehensions' },
  
  'Import and from import': { num: 15, name: 'Allied Kingdom Libraries' },
  'Standard library — math and random': { num: 15, name: 'Allied Kingdom Libraries' },
  'pip and external packages': { num: 15, name: 'Allied Kingdom Libraries' },
  'Module aliases and import variants': { num: 15, name: 'Allied Kingdom Libraries' },
  'Writing and importing custom modules': { num: 15, name: 'Allied Kingdom Libraries' },
  
  'try and except blocks': { num: 16, name: 'Sanctum Shield Handlers' },
  'Multiple except and else': { num: 16, name: 'Sanctum Shield Handlers' },
  'Raising exceptions — raise': { num: 16, name: 'Sanctum Shield Handlers' },
  'Reading and understanding tracebacks': { num: 16, name: 'Sanctum Shield Handlers' },
  'Debugging strategies — print, assert, pdb': { num: 16, name: 'Sanctum Shield Handlers' },
  
  'Defining and instantiating classes': { num: 17, name: 'Castles & Blueprint Objects' },
  'Instance methods': { num: 17, name: 'Castles & Blueprint Objects' },
  'Class vs instance variables': { num: 17, name: 'Castles & Blueprint Objects' },
  'String representation — __str__ and __repr__': { num: 17, name: 'Castles & Blueprint Objects' },
  'Encapsulation — private attributes': { num: 17, name: 'Castles & Blueprint Objects' },
  
  'Single inheritance — parent and child classes': { num: 18, name: 'Lineage of Blueprints' },
  'Method overriding and super()': { num: 18, name: 'Lineage of Blueprints' },
  'Multiple inheritance and MRO': { num: 18, name: 'Lineage of Blueprints' },
  'isinstance and issubclass': { num: 18, name: 'Lineage of Blueprints' },
  'Composition vs inheritance': { num: 18, name: 'Lineage of Blueprints' },
  
  '@property — managed attributes': { num: 19, name: 'Grand Architects' },
  '@classmethod — alternative constructors': { num: 19, name: 'Grand Architects' },
  '@staticmethod — utility functions in a class': { num: 19, name: 'Grand Architects' },
  'Property setters and deleters': { num: 19, name: 'Grand Architects' },
  'Combining everything — real class design': { num: 19, name: 'Grand Architects' },
  
  'Recursive functions — base case and recursive case': { num: 20, name: 'Labyrinth of Divides' },
  'Recursive data structures — linked lists and binary trees': { num: 20, name: 'Labyrinth of Divides' },
  'Merge sort — divide and conquer': { num: 20, name: 'Labyrinth of Divides' },
  'Quick sort — partition and conquer': { num: 20, name: 'Labyrinth of Divides' },
  'Big-O intuition — comparing algorithm complexity': { num: 20, name: 'Labyrinth of Divides' },
  
  'File paths — pathlib and os.path': { num: 21, name: 'Gateways of Path Finder' },
  'Working with directories and os module': { num: 21, name: 'Gateways of Path Finder' },
  'Reading and writing structured files — CSV and JSON': { num: 21, name: 'Gateways of Path Finder' }
};

// 6 Original preseeded challenges
const originalChallenges = [
  {
    chapter: 1,
    title: "Say Hello to the Jungle",
    concept: "print() — Output & What is Code?",
    conceptName: "Jungle of Prints!",
    instructions: `Use the <code>print()</code> function to output exactly the string <code>"Hello, world"</code> to the console.`,
    whyThisMatters: "The <code>print()</code> statement is the fundamental way a programmer inspects values and communicates with user dashboards. Every major software journey starts with standard console output.",
    template: `print("replace me")`,
    targetOutput: "Hello, world",
    errorTips: "Make sure you type exactly <code>print(\"Hello, world\")</code>. Double check quotes and capitalization!",
    quizQuestions: [],
    promptChallenge: {}
  },
  {
    chapter: 1,
    title: "Printing Numbers & Math",
    concept: "print() — Output & What is Code?",
    conceptName: "Jungle of Prints!",
    instructions: `Output the mathematical product of multiplying <code>5</code> by <code>10</code> directly inside a print statement. e.g. <code>print(5 * 10)</code>.`,
    whyThisMatters: "Python evaluates math expressions inside arguments before executing functions. This inline computation is extremely fast and saves storing redundant variables.",
    template: `print()`,
    targetOutput: "50",
    errorTips: "Provide the multiplication formula inside the print parenthesis, e.g. <code>5 * 10</code>. Do not write quotes, otherwise it will print the formula text instead of the math result!",
    quizQuestions: [],
    promptChallenge: {}
  },
  {
    chapter: 2,
    title: "Storing Jungle Fruits",
    concept: "Variables & Data Storage",
    conceptName: "Forest Signposts",
    instructions: `Create a variable named <code>fruits</code> and set its value to <code>25</code>. On the next line, print the variable's value: <code>print(fruits)</code>.`,
    whyThisMatters: "Variables store data in temporary memory blocks so they can be easily manipulated or referenced repeatedly in long scripts.",
    template: `# Create fruits variable below\n`,
    targetOutput: "25",
    errorTips: "Ensure you assign it exactly: <code>fruits = 25</code>, and then run <code>print(fruits)</code> without wrapping the variable name in quotes.",
    quizQuestions: [],
    promptChallenge: {}
  },
  {
    chapter: 2,
    title: "Simple Fruit Adder",
    concept: "Variables & Data Storage",
    conceptName: "Forest Signposts",
    instructions: `Add two variables: <code>apples = 10</code> and <code>oranges = 15</code>. Store the sum in a variable named <code>total</code>, then print <code>total</code>.`,
    whyThisMatters: "Mathematical addition across memory cells is the mechanical basis of web checkouts, inventory updates, and database calculations.",
    template: `apples = 10\noranges = 15\n# Compute total and print it below\n`,
    targetOutput: "25",
    errorTips: "Write <code>total = apples + oranges</code> and then <code>print(total)</code>. Double check variable spelling!",
    quizQuestions: [],
    promptChallenge: {}
  },
  {
    chapter: 4,
    title: "String Length Check",
    concept: "String Operations & Indexing",
    conceptName: "Rune Slices & Matrices",
    instructions: `Count the number of characters in the string <code>"Supercalifragilistic"</code> using the built-in <code>len()</code> function, and output the length using a print statement.`,
    whyThisMatters: "Checking length enables validation parameters, string truncation safeguards, and size indexing boundaries on servers.",
    template: `word = "Supercalifragilistic"\n# Print length here\n`,
    targetOutput: "20",
    errorTips: "Pass the variable or literal string into <code>len()</code> inside your print, like: <code>print(len(word))</code>.",
    quizQuestions: [],
    promptChallenge: {}
  },
  {
    chapter: 10,
    title: "Jungle Pack Lists",
    concept: "Creating & accessing lists",
    conceptName: "Party Member Rosters",
    instructions: `Initialize a Python list named <code>pack</code> containing standard string items <code>"rope"</code>, <code>"map"</code>, and <code>"canteen"</code>. Print the list to inspect it.`,
    whyThisMatters: "Arrays and list collections group multiple related elements into a single variable index, laying the track for dynamic loop runs.",
    template: `# Create list and print it below\n`,
    targetOutput: "['rope', 'map', 'canteen']",
    errorTips: "Declare list with square brackets: <code>pack = [\"rope\", \"map\", \"canteen\"]</code> and then <code>print(pack)</code>.",
    quizQuestions: [],
    promptChallenge: {}
  }
];

// Load and parse all 150 JSON files
const parsedChallenges = [];
const files = fs.readdirSync(casesDir);

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const raw = fs.readFileSync(path.join(casesDir, file), 'utf8');
  const c = JSON.parse(raw);

  const conceptClean = c.pythonConcept ? c.pythonConcept.trim() : '';
  const chapInfo = conceptToChapterMap[conceptClean] || { num: 22, name: 'General Practice' };

  parsedChallenges.push({
    chapter: chapInfo.num,
    title: c.title,
    concept: conceptClean,
    conceptName: chapInfo.name,
    instructions: c.description || '',
    whyThisMatters: c.theoryNote || '',
    template: c.starterCode || '',
    targetOutput: c.expectedOutput || 'Hello, world',
    errorTips: Array.isArray(c.hints) ? c.hints.join('<br>') : '',
    quizQuestions: c.caseStudyQuestions || [],
    promptChallenge: {
      description: c.promptChallenge || '',
      rubric: c.promptScoringRubric || ''
    }
  });
});

// Sort parsed challenges by chapter number
parsedChallenges.sort((a, b) => a.chapter - b.chapter);

// Merge: original mock challenges first, then the 150 real parsed ones
const allChallenges = [...originalChallenges, ...parsedChallenges];

// Assign sequential IDs starting from 1
allChallenges.forEach((c, idx) => {
  c.id = idx + 1;
});

const mongoURI = 'mongodb://127.0.0.1:27017/pybe';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB. Saving merged challenges...');
    await Challenge.deleteMany({});
    await Challenge.insertMany(allChallenges);
    console.log(`Seeded ${allChallenges.length} challenges successfully from Shreya folder.`);
    
    // Save to local backup
    fs.writeFileSync('./parsed_challenges.json', JSON.stringify(allChallenges, null, 2));
    console.log('Saved parsed_challenges.json locally.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  });
