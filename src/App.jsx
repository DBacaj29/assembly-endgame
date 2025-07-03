// Import React hooks for managing state
import { useState } from "react";
// Import an array of language objects, each representing a guess attempt
import { languages } from "./languages";
// Import clsx utility for conditional className building
import clsx from "clsx";
// Import helper functions: getFarewellText for farewell messages and getRandomWord to pick a word
import { getFarewellText, getRandomWord } from "./utils";
// Import Confetti component to celebrate winning the game
import Confetti from "react-confetti";

// Main App component for the word guessing game "Assembly: Endgame"
const App = () => {
  // State to hold the current secret word the player is guessing, initialized by picking a random word
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());

  // State to hold the list of letters the player has guessed so far, starts empty
  const [guessedLetters, setGuessedLetters] = useState([]);

  // Number of wrong guesses allowed, set to one less than the number of languages (8 attempts)
  const guessesLeft = languages.length - 1;

  // Calculate how many wrong guesses the player has made by filtering guessed letters that are NOT in the word
  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length;

  // Debugging output to the console: how many wrong guesses have been made so far
  console.log(wrongGuessCount);

  // Determine if the game is won: every letter in the current word must have been guessed
  const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter));

  // Determine if the game is lost: number of wrong guesses reached or exceeded allowed attempts
  const isGameLost = wrongGuessCount >= guessesLeft;

  // The game is over if either won or lost
  const isGameOver = isGameWon || isGameLost;

  // The last letter guessed by the player (used for status messaging)
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];

  // Check if the last guess was wrong (exists and is not in the current word)
  const isLastGuessCorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // Alphabet string to generate buttons for guessing letters
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  // Function to add a new letter to guessedLetters, only if it hasn't been guessed before
  function addGuessedLetter(letter) {
    setGuessedLetters(prevLetters =>
      prevLetters.includes(letter) ? // If already guessed, return previous unchanged
        prevLetters :
        [...prevLetters, letter] // Else add new letter to the guessed list
    );
  }

  // Function to start a new game by selecting a new random word and clearing guesses
  function newGame() {
    setCurrentWord(getRandomWord()); // Pick new word
    setGuessedLetters([]); // Reset guessed letters
  }

  // Use clsx to dynamically assign class names for the game status section based on game state
  const gameStatusClass = clsx("game-status", {
    won: isGameWon,                 // Apply "won" class if game is won
    lost: isGameLost,               // Apply "lost" class if lost
    farewell: !isGameOver && isLastGuessCorrect // Show farewell message class if game ongoing and last guess was wrong
  });

  // Function to render different game status messages based on game progress
  function gameStatus() {
    if (!isGameOver && isLastGuessCorrect) {
      // Show a farewell message from the current language, indexed by wrong guesses
      return (<p className="farewell-message">{getFarewellText(languages[wrongGuessCount - 1].name)}</p>);
    }

    if (isGameWon) {
      // Congratulatory message if player won
      return (
        <>
          <h2>You Win!</h2>
          <p>Well Done! 🎉</p>
        </>
      );
    }

    if (isGameLost) {
      // Game over message if player lost
      return (
        <>
          <h2>Game Over!</h2>
          <p>You better start learning assembly</p>
        </>
      );
    } else {
      // No message if game is ongoing and no recent wrong guess
      return null;
    }
  }

  // Generate language chip elements to visualize guesses left and lost attempts
  // Each chip shows a language name styled with its background and text colors
  // Chips corresponding to lost attempts get a "lost" class for styling
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount; // Mark languages as lost if index less than wrong guesses
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color
    };
    return (
      <span
        className={`chip ${isLanguageLost ? "lost" : ""}`}
        style={styles}
        key={lang.name}
      >
        {lang.name}
      </span>
    );
  });

  // Generate letter display elements for the current word
  // Letters are revealed if guessed or game is lost
  // Missed letters (not guessed when lost) get a special class "missed-letter"
  const letterElements = currentWord.split("").map((letter, index) => {
    const revealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    );
    return (
      <span key={index} className={letterClassName}>
        {revealLetter ? letter.toUpperCase() : ""}
      </span>
    );
  });

  // Generate the on-screen keyboard buttons for guessing letters
  // Each button shows a letter and:
  // - is disabled when the game is over
  // - changes style to "correct" or "wrong" based on guess accuracy
  // - triggers addGuessedLetter when clicked
  const keyboardElements = alphabet.split("").map(letter => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong
    });

    return (
      <button
        className={className}
        key={letter}
        disabled={isGameOver}               // Disable input if game finished
        aria-disabled={guessedLetters.includes(letter)} // Accessibility to mark disabled letters
        aria-label={`Letter ${letter}`}     // Accessible label for screen readers
        onClick={() => addGuessedLetter(letter)} // Handle click to guess letter
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  // Render the full game UI
  return (
    <main>
      {
        // Show confetti celebration only if the player has won
        isGameWon &&
        <Confetti
          recycle={false}
          numberOfPieces={1000}
        />
      }
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to keep the
          programming world safe from Assembly!
        </p>
      </header>

      {/* Game status message area with ARIA live region for screen readers */}
      <section aria-live="polite" role="status" className={gameStatusClass}>
        {gameStatus()}
      </section>

      {/* Display the chips representing the languages / attempts */}
      <section className="language-chips">
        {languageElements}
      </section>

      {/* Display the current word with letters revealed or hidden */}
      <section className="word">
        {letterElements}
      </section>

      {/* Visually hidden live status section for screen readers */}
      <section
        className="sr-only"
        aria-live="polite"
        role="status"
      >
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word`}
          You have {guessesLeft} attempts left.
        </p>
        <p>
          Current Word: {currentWord.split("")
            .map(letter => guessedLetters.includes(letter) ? letter + "." : "blank")
            .join(" ")}
        </p>
      </section>

      {/* Render the letter buttons keyboard */}
      <section className="keyboard">
        {keyboardElements}
      </section>

      {/* Show "New Game" button only when the game is over */}
      {isGameOver && <button className="new-game" onClick={newGame}>New Game</button>}
    </main>
  );
}

// Export App component as default export
export default App;
