const fs = require('fs');
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');

const mdPath = 'C:\\Users\\saisr\\.gemini\\antigravity\\brain\\3810b318-fd39-4f18-8ba9-ada4b098f2d6\\all_questions.md';
const content = fs.readFileSync(mdPath, 'utf8');

const conceptToChapterMap = {
  'print() — Output & What is Code?': { num: 1, name: 'Jungle of Prints!' },
  'Variables & Data Storage': { num: 2, name: 'Forest Signposts' },
  'Data Types (str, int, float, bool)': { num: 3, name: 'Potion Alchemy Tiers' },
  'String Operations & Indexing': { num: 4, name: 'Rune Slices & Matrices' },
  'Arithmetic & Operators': { num: 5, name: 'Market Calculation Grids' },
  'Comparisons — ==, !=, <, >, <=, >=': { num: 6, name: 'Hero Stat Gates' },
  
  'if Statements — The First Decision': { num: 7, name: 'Pathways of Decisions' },
  'if / elif / else — Multi-Choice Decisions': { num: 7, name: 'Pathways of Decisions' },
  'Nested Conditionals': { num: 7, name: 'Pathways of Decisions' },
  
  'Logical Operators — and, or, not': { num: 8, name: 'Spells of Logic Gates' },
  
  'for loops + range()': { num: 9, name: 'Infinite Mana Loops' },
  'while loops': { num: 9, name: 'Infinite Mana Loops' },
  'break and continue': { num: 9, name: 'Infinite Mana Loops' },
  'Nested loops': { num: 9, name: 'Infinite Mana Loops' },
  'Accumulator pattern': { num: 9, name: 'Infinite Mana Loops' },
  
  'Creating & accessing lists': { num: 10, name: 'Party Member Rosters' },
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

// Parse MD Sections
const sections = content.split(/(?=## Case:)/);
const parsedChallenges = [];

sections.forEach(sec => {
  if (!sec.trim() || !sec.includes('## Case:')) return;
  
  const lines = sec.split('\n');
  let title = '';
  let concept = '';
  let levelNum = 0;
  let quizQuestions = [];
  let currentQuestion = null;
  let promptDescription = '';
  let promptRubric = '';
  let inPrompt = false;
  let inQuiz = false;

  const caseMatch = lines[0].match(/## Case:\s*(.*?)\s*\((.*?)\)/);
  if (caseMatch) {
    title = caseMatch[1].trim();
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('**Concept:**')) {
      concept = line.replace(/^\*\s*\*\*Concept:\*\*\s*/, '').replace('**Concept:**', '').trim();
    }
    else if (line.includes('**Phase/Level:**')) {
      const pl = line.replace(/^\*\s*\*\*Phase\/Level:\*\*\s*/, '').replace('**Phase/Level:**', '').trim();
      const parts = pl.split(' - Level ');
      levelNum = parseInt(parts[1]) || 0;
    }
    else if (line.includes('### Case Study Questions:')) {
      inQuiz = true;
      inPrompt = false;
    }
    else if (line.includes('### Prompt Challenge:')) {
      inQuiz = false;
      inPrompt = true;
    }
    else if (inQuiz && /^\d+\.\s*\*\*Question:\*\*/.test(line)) {
      if (currentQuestion) quizQuestions.push(currentQuestion);
      const qText = line.replace(/^\d+\.\s*\*\*Question:\*\*\s*/, '').trim();
      currentQuestion = {
        question: qText,
        type: 'Multiple Choice',
        options: [],
        correctAnswer: '',
        sampleAnswer: ''
      };
    }
    else if (inQuiz && currentQuestion && line.startsWith('* A)')) {
      currentQuestion.options.push(line.replace(/^\*\s*A\)\s*/, 'A) ').trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('* B)')) {
      currentQuestion.options.push(line.replace(/^\*\s*B\)\s*/, 'B) ').trim());
    }
    else if (inQuiz && currentQuestion && (line.startsWith('* C)') || line.startsWith('- C)'))) {
      currentQuestion.options.push(line.replace(/^\*?\-?\s*C\)\s*/, 'C) ').trim());
    }
    else if (inQuiz && currentQuestion && (line.startsWith('* D)') || line.startsWith('- D)'))) {
      currentQuestion.options.push(line.replace(/^\*?\-?\s*D\)\s*/, 'D) ').trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('A)')) {
      currentQuestion.options.push(line.trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('B)')) {
      currentQuestion.options.push(line.trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('C)')) {
      currentQuestion.options.push(line.trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('D)')) {
      currentQuestion.options.push(line.trim());
    }
    else if (inQuiz && currentQuestion && line.startsWith('*') && currentQuestion.options.length < 4 && !line.includes('Correct Answer') && !line.includes('Type') && !line.includes('Sample')) {
      const cleanOpt = line.replace(/^\*\s*/, '').replace(/^\-\s*/, '').trim();
      if (/^[A-D]\)/.test(cleanOpt)) {
        currentQuestion.options.push(cleanOpt);
      }
    }
    else if (inQuiz && currentQuestion && line.includes('**Correct Answer:**')) {
      currentQuestion.correctAnswer = line.replace(/.*\*\*Correct Answer:\*\*\s*/, '').trim();
    }
    else if (inQuiz && currentQuestion && line.includes('**Type:** Short Answer')) {
      currentQuestion.type = 'Short Answer';
    }
    else if (inQuiz && currentQuestion && line.includes('**Sample Answer:**')) {
      currentQuestion.sampleAnswer = line.replace(/.*\*\*Sample Answer:\*\*\s*/, '').trim();
    }
    else if (inPrompt && line.startsWith('>')) {
      promptDescription += line.replace(/^>\s*/, '').trim() + ' ';
    }
    else if (inPrompt && line.includes('**Scoring Rubric:**')) {
      promptRubric = line.replace(/.*\*\*Scoring Rubric:\*\*\s*/, '').trim();
    }
  }
  if (currentQuestion) {
    quizQuestions.push(currentQuestion);
  }

  if (concept) {
    const chapInfo = conceptToChapterMap[concept] || { num: 22, name: 'General Practice' };
    
    // Generate code template/output based on concept
    let template = 'print("Hello, world")';
    let targetOutput = 'Hello, world';
    const cName = concept.toLowerCase();
    
    if (cName.includes('variable')) {
      template = 'x = 10\nprint(x)';
      targetOutput = '10';
    } else if (cName.includes('type')) {
      template = 'x = 3.14\nprint(type(x))';
      targetOutput = "<class 'float'>";
    } else if (cName.includes('index') || cName.includes('string')) {
      template = "text = 'Python'\nprint(text[0])";
      targetOutput = 'P';
    } else if (cName.includes('arithmetic') || cName.includes('operator')) {
      template = 'print(10 + 5)';
      targetOutput = '15';
    } else if (cName.includes('comparison')) {
      template = 'print(10 == 10)';
      targetOutput = 'True';
    } else if (cName.includes('if')) {
      template = 'x = 10\nif x > 5:\n    print("big")';
      targetOutput = 'big';
    } else if (cName.includes('loop')) {
      template = 'for i in range(3):\n    print(i)';
      targetOutput = '0\n1\n2';
    }

    parsedChallenges.push({
      chapter: chapInfo.num,
      title: title,
      concept: concept,
      conceptName: chapInfo.name,
      instructions: `Master the concept of <strong>${concept}</strong> by executing the code and completing the prompting/quiz tasks.`,
      whyThisMatters: `This level explores the essential logic of <strong>${concept}</strong>. Understanding this is key to structuring functional Python routines.`,
      template: template,
      targetOutput: targetOutput,
      errorTips: `Verify that your script outputs exactly "${targetOutput}". Check capitalization and parentheses.`,
      quizQuestions: quizQuestions,
      promptChallenge: {
        description: promptDescription.trim(),
        rubric: promptRubric
      }
    });
  }
});

// Sort parsed challenges by chapter number
parsedChallenges.sort((a, b) => a.chapter - b.chapter);

// Merge: Original 6 challenges come first, then all 150 parsed challenges!
const allChallenges = [...originalChallenges, ...parsedChallenges];

// Assign sequential Level IDs starting from 1 to 156
allChallenges.forEach((c, idx) => {
  c.id = idx + 1;
});

const mongoURI = 'mongodb://127.0.0.1:27017/pybe';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB. Resetting challenges collection...');
    await Challenge.deleteMany({});
    await Challenge.insertMany(allChallenges);
    console.log(`Seeded ${allChallenges.length} challenges successfully (6 original + 150 parsed).`);
    
    // Also save local json backup
    fs.writeFileSync('./parsed_challenges.json', JSON.stringify(allChallenges, null, 2));
    console.log('Saved parsed_challenges.json locally.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  });
