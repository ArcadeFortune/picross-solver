/////////////// helper, to reduce repetetiv code ///////////////
enum Space {
  UNCHECKED,
  CHECKED,
  UNKNOWN,
}

export function changeXYOf2dArray<T>(array: T[][]): T[][] {
  const finalArray: T[][] = [[]];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (!finalArray[j]) finalArray.push([]);
      finalArray[j][i] = array[i][j];
    }
  }
  return finalArray;
}

//checks if the given board is ready for the user by returning the amount of unknown spaces
/**
 * @returns the amount of unkown spaces
 */
export function isBoardClear(board: Space[][]): number {
  if (board.length === 0 || board[0].length === 0) return -1;
  let counter: number = 0;
  board.forEach((row: Space[]) => {
    row.forEach((space: Space) => {
      if (space === Space.UNKNOWN) counter++;
    });
  });
  return counter;
}

//returns a string representation of a 2d array that is nice to look at for larger boards
function renderBoard(board: Space[][]): string {
  const stringArr: string[] = [];
  board.forEach((row: Space[]) => {
    let stringRow: string = '';
    row.forEach((space: Space) => {
      if (space === Space.UNKNOWN) {
        stringRow += '\x1b[0m?';
      } else if (space === Space.CHECKED) {
        stringRow += `\x1b[38;5;40m${space}\x1b[0m`;
      } else if (space === Space.UNCHECKED) {
        stringRow += `\x1b[38;5;8m${space}\x1b[0m`
      }
    })
    stringArr.push(stringRow);
  })
  return stringArr.join('\n');
}

/////////////// core functions ///////////////
//returns a row with all possible combinations of 1 and 0 according to picross law
export function findAllPossibilities(
  spaces: number,
  numbers: number[],
  remainingNumbers: number[] = numbers,
  currentArray: number[] = [],
  finalArray: Space[][] = [],
): Space[][] {
  if (currentArray.length >= spaces) {
    const placedAmountOfOnes: number = currentArray.filter((num) => num === 1).length;
    const supposedAmountOfOnes: number = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    if (placedAmountOfOnes === supposedAmountOfOnes) {
      finalArray.push([...currentArray]);
    }
    return finalArray;
  }
  //if the currentNumber is 0, remove it (properly move onto the next number)
  if (remainingNumbers[0] === 0) remainingNumbers.pop();

  //if there is no more space for the upcoming number, dont even try
  if (spaces - currentArray.length < remainingNumbers[0]) return finalArray;

  //if a checked space can be placed
  if (remainingNumbers.length !== 0) {
    for (let i: number = 0; i < remainingNumbers[0]; i++) {
      currentArray.push(Space.CHECKED);
    }

    //if an unchecked space can be placed
    const hasEnoughPlaceForSpacing0: boolean = currentArray.length < spaces;
    if (hasEnoughPlaceForSpacing0) currentArray.push(Space.UNCHECKED);
    findAllPossibilities(spaces, numbers, remainingNumbers.slice(1), currentArray, finalArray);
    if (hasEnoughPlaceForSpacing0) currentArray.pop();
    for (let i: number = 0; i < remainingNumbers[0]; i++) {
      currentArray.pop();
    }
  }

  currentArray.push(Space.UNCHECKED);
  findAllPossibilities(spaces, numbers, remainingNumbers, currentArray, finalArray);
  currentArray.pop();
  return finalArray;
}

//returns all possible combinations that must include a given pattern
//>[[1, 1, 0, 1, 0], [1, 1, 0, 0, 1], [0, 1, 1, 0, 1]]
//> [0, 1, 2, 0, 1]
//=[[0, 1, 1, 0, 1]]
export function reduceToPotentials(allPossibilities: Space[][], givenPattern: Space[]): Space[][] {
  const finalArray: Space[][] = [];

  for (let i: number = 0; i < allPossibilities.length; i++) {
    let isArrayValid: boolean = true;

    allPossibilities[i].forEach((currentSpace: Space, spaceI: number) => {
      const patternSpace: Space = givenPattern[spaceI];

      if (patternSpace === Space.UNKNOWN) return; //space might be valid
      if (currentSpace === patternSpace) return; //space is valid
      isArrayValid = false;
    });
    if (isArrayValid) finalArray.push(allPossibilities[i]);
  }
  if (finalArray.length === 0) return [givenPattern];
  else return finalArray;
}

//from the potentials, reduce to the ones that are true for sure
//>[[1, 1, 0, 0, 1], [0, 1, 1, 0, 1]]
//= [2, 1, 2, 0, 1]
export function reduceToSafeSolution(allPotentials: Space[][]): Space[] {
  return allPotentials.reduce((accumulatedRow: Space[], currentRow: Space[]): Space[] => {
    const oneValidRow: Space[] = [];
    for (let spaceI: Space = 0; spaceI < currentRow.length; spaceI++) {
      const currentSpace: Space = currentRow[spaceI];
      const patternSpace: Space = accumulatedRow[spaceI];
      if (currentSpace === patternSpace) oneValidRow.push(currentSpace);
      else oneValidRow.push(Space.UNKNOWN);
    }
    return oneValidRow;
  });
}

/////////////// play the actual game ///////////////
//with the scenraio and a given, returns the fully calculated resulting row
export function handleRow(spaces: number, numbers: number[], given?: Space[]): Space[] {
  const possibleArrs: Space[][] = findAllPossibilities(spaces, numbers);
  let potentialArrs: Space[][] = possibleArrs;
  if (given && given.length) {
    potentialArrs = reduceToPotentials(possibleArrs, given);
  }
  const safeSolution: Space[] = reduceToSafeSolution(potentialArrs);
  return safeSolution;
}

export function clearGame(head: number[][], side: number[][], prevRows: Space[][] = [], prevUnknownSpaces?: number): Space[][] {
  //if the game is finished
  const unknownSpaces = isBoardClear(prevRows)
  if (unknownSpaces === 0 || prevUnknownSpaces === unknownSpaces) return changeXYOf2dArray(prevRows);

  const columns: Space[][] = [];
  for (let i: number = 0; i < head.length; i++) {
    const column: number[] = handleRow(side.length, head[i], prevRows[i]);
    columns.push(column);
  }
  const columnsReversed: Space[][] = changeXYOf2dArray(columns);

  const rows: Space[][] = [];
  for (let i: number = 0; i < side.length; i++) {
    const row: number[] = handleRow(head.length, side[i], columnsReversed[i]);
    rows.push(row);
  }
  const rowsReversed: Space[][] = changeXYOf2dArray(rows);

  return clearGame(head, side, rowsReversed, unknownSpaces);
}

if (import.meta.main) {
  const header: number[][] = [[1,1],[1,1],[2],[1],[1,1]];
  const side: number[][] = [[1],[4],[1],[1,1],[1]];

  const allRows = clearGame(header, side);
  console.log(renderBoard(allRows));
}
