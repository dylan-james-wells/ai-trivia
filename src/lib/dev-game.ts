import { GameState, Player, Category, Question } from "@/types/game";

const devPlayers: Player[] = [
  { id: "player-1", name: "Player 1", score: 0 },
  { id: "player-2", name: "Player 2", score: 0 },
];

const devCategories: Category[] = [
  { name: "2000-2010 Pop Music", confirmed: true, aiInterpretation: "Popular music from the 2000s decade" },
  { name: "Web Development", confirmed: true, aiInterpretation: "Programming and building websites" },
  { name: "History of Vehicles", confirmed: true, aiInterpretation: "The history of cars, planes, and transportation" },
  { name: "Video Games 2010-2020", confirmed: true, aiInterpretation: "Video games released between 2010 and 2020" },
  { name: "Movies 1980-1989", confirmed: true, aiInterpretation: "Films from the 1980s" },
  { name: "African Animals", confirmed: true, aiInterpretation: "Wildlife native to Africa" },
];

const devQuestions: Question[] = [
  // Category 0: 2000-2010 Pop Music
  { id: "q-0", categoryIndex: 0, difficulty: 1, points: 200, question: "This Britney Spears song from 2000 asked 'My loneliness is killing me' - what was it?", answer: "Oops!... I Did It Again", answered: false },
  { id: "q-1", categoryIndex: 0, difficulty: 2, points: 400, question: "Which band sang 'Mr. Brightside' in 2003?", answer: "The Killers", answered: false },
  { id: "q-2", categoryIndex: 0, difficulty: 3, points: 600, question: "Beyoncé's 2008 hit told listeners to 'put a ring on it' - what was the song called?", answer: "Single Ladies (Put a Ring on It)", answered: false },
  { id: "q-3", categoryIndex: 0, difficulty: 4, points: 800, question: "Which Amy Winehouse album won 5 Grammy Awards in 2008?", answer: "Back to Black", answered: false },
  { id: "q-4", categoryIndex: 0, difficulty: 5, points: 1000, question: "What was the best-selling digital single of the 2000s decade in the United States?", answer: "I Gotta Feeling by The Black Eyed Peas", answered: false },

  // Category 1: Web Development
  { id: "q-5", categoryIndex: 1, difficulty: 1, points: 200, question: "What does HTML stand for?", answer: "HyperText Markup Language", answered: false },
  { id: "q-6", categoryIndex: 1, difficulty: 2, points: 400, question: "What CSS property is used to change the text color of an element?", answer: "color", answered: false },
  { id: "q-7", categoryIndex: 1, difficulty: 3, points: 600, question: "In JavaScript, what method is used to add an element to the end of an array?", answer: "push()", answered: false },
  { id: "q-8", categoryIndex: 1, difficulty: 4, points: 800, question: "What is the name of the React hook used to perform side effects in function components?", answer: "useEffect", answered: false },
  { id: "q-9", categoryIndex: 1, difficulty: 5, points: 1000, question: "What HTTP status code indicates that a resource has been permanently moved to a new URL?", answer: "301", answered: false },

  // Category 2: History of Vehicles
  { id: "q-10", categoryIndex: 2, difficulty: 1, points: 200, question: "What company produced the Model T, often called the first affordable automobile?", answer: "Ford", answered: false },
  { id: "q-11", categoryIndex: 2, difficulty: 2, points: 400, question: "The Wright Brothers made their famous first powered flight in what year?", answer: "1903", answered: false },
  { id: "q-12", categoryIndex: 2, difficulty: 3, points: 600, question: "What German engineer is credited with building the first true motorcycle in 1885?", answer: "Gottlieb Daimler", answered: false },
  { id: "q-13", categoryIndex: 2, difficulty: 4, points: 800, question: "The Shinkansen, the world's first high-speed rail system, began operation in what country?", answer: "Japan", answered: false },
  { id: "q-14", categoryIndex: 2, difficulty: 5, points: 1000, question: "What was the name of the first commercial jet airliner, which entered service in 1952?", answer: "de Havilland Comet", answered: false },

  // Category 3: Video Games 2010-2020
  { id: "q-15", categoryIndex: 3, difficulty: 1, points: 200, question: "What block-building survival game created by Markus Persson was officially released in 2011?", answer: "Minecraft", answered: false },
  { id: "q-16", categoryIndex: 3, difficulty: 2, points: 400, question: "In what 2017 Nintendo game do you play as Link in the kingdom of Hyrule?", answer: "The Legend of Zelda: Breath of the Wild", answered: false },
  { id: "q-17", categoryIndex: 3, difficulty: 3, points: 600, question: "What 2015 CD Projekt Red game features a monster hunter named Geralt of Rivia?", answer: "The Witcher 3: Wild Hunt", answered: false },
  { id: "q-18", categoryIndex: 3, difficulty: 4, points: 800, question: "What indie game released in 2017 tasks players with dating skeleton brothers and other monsters?", answer: "Undertale (Note: Undertale was 2015, but the question refers to it)", answered: false },
  { id: "q-19", categoryIndex: 3, difficulty: 5, points: 1000, question: "What 2019 FromSoftware game won Game of the Year and is set in Sengoku-era Japan?", answer: "Sekiro: Shadows Die Twice", answered: false },

  // Category 4: Movies 1980-1989
  { id: "q-20", categoryIndex: 4, difficulty: 1, points: 200, question: "What 1982 Steven Spielberg film features a boy who befriends an alien?", answer: "E.T. the Extra-Terrestrial", answered: false },
  { id: "q-21", categoryIndex: 4, difficulty: 2, points: 400, question: "In what 1985 film does Marty McFly travel back in time in a DeLorean?", answer: "Back to the Future", answered: false },
  { id: "q-22", categoryIndex: 4, difficulty: 3, points: 600, question: "What 1987 film featured the quote 'Nobody puts Baby in a corner'?", answer: "Dirty Dancing", answered: false },
  { id: "q-23", categoryIndex: 4, difficulty: 4, points: 800, question: "What 1988 animated film was the first collaboration between Disney and Pixar's predecessor?", answer: "Who Framed Roger Rabbit", answered: false },
  { id: "q-24", categoryIndex: 4, difficulty: 5, points: 1000, question: "What 1982 sci-fi film directed by Ridley Scott asks 'What does it mean to be human?' through replicants?", answer: "Blade Runner", answered: false },

  // Category 5: African Animals
  { id: "q-25", categoryIndex: 5, difficulty: 1, points: 200, question: "What is the largest land animal, native to Africa?", answer: "African Elephant", answered: false },
  { id: "q-26", categoryIndex: 5, difficulty: 2, points: 400, question: "What African animal has the longest neck of any living terrestrial animal?", answer: "Giraffe", answered: false },
  { id: "q-27", categoryIndex: 5, difficulty: 3, points: 600, question: "What is the fastest land animal, capable of speeds up to 70 mph?", answer: "Cheetah", answered: false },
  { id: "q-28", categoryIndex: 5, difficulty: 4, points: 800, question: "What nocturnal African mammal has a long sticky tongue to eat ants and termites?", answer: "Aardvark", answered: false },
  { id: "q-29", categoryIndex: 5, difficulty: 5, points: 1000, question: "What is the only great ape found outside of Asia, living in the forests of Central Africa?", answer: "Gorilla", answered: false },
];

export function createDevGameState(): GameState {
  return {
    phase: "playing",
    players: devPlayers,
    categories: devCategories,
    questions: devQuestions,
    currentPlayerIndex: 0,
    selectedQuestion: null,
  };
}
