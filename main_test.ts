import { assertEquals } from "@std/assert";
import {
  changeXYOf2dArray,
  clearGame,
  findAllPossibilities,
  handleRow,
  isBoardClear,
  reduceToPotentials,
  reduceToSafeSolution,
} from "./main.ts";

Deno.test(function canChangeXYOf2dArray() {
  assertEquals(changeXYOf2dArray([[1, 2], [0, 0]]), [[1, 0], [2, 0]]);
  assertEquals(
    changeXYOf2dArray([
      [2, 2, 1, 2, 2],
      [1, 1, 1, 0, 1],
      [2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1],
    ]),
    [
      [2, 1, 2, 0, 1],
      [2, 1, 2, 0, 0],
      [1, 1, 2, 0, 1],
      [2, 0, 2, 0, 0],
      [2, 1, 2, 0, 1],
    ],
  );
});

Deno.test(function canClearBoard() {
  assertEquals(isBoardClear([[1, 1], [0, 1]]), 0);
  assertEquals(isBoardClear([[1, 1], [0, 2]]), 1);
  assertEquals(isBoardClear([[2, 2], [2, 2]]), 4);
  assertEquals(isBoardClear([[]]), -1);
});

Deno.test(function canFindAllPossibilities() {
  assertEquals(findAllPossibilities(2, [2]), [[1, 1]]);
  assertEquals(findAllPossibilities(3, [2]), [[1, 1, 0], [0, 1, 1]]);
  assertEquals(findAllPossibilities(3, [3]), [[1, 1, 1]]);
  assertEquals(findAllPossibilities(4, [3]), [[1, 1, 1, 0], [0, 1, 1, 1]]);
  assertEquals(findAllPossibilities(4, [2]), [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]]);
  assertEquals(findAllPossibilities(4, [2, 1]), [[1, 1, 0, 1]]);
  assertEquals(findAllPossibilities(5, [2, 1]), [[1, 1, 0, 1, 0], [1, 1, 0, 0, 1], [0, 1, 1, 0, 1]]);
});

Deno.test(function canReducePossibilitiesAgainstPattern() {
  assertEquals(reduceToPotentials([[1, 1, 0], [0, 1, 1]], [2, 2, 1]), [[0, 1, 1]]);
  assertEquals(reduceToPotentials([[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]], [2, 1, 2, 2]), [[1, 1, 0, 0], [0, 1, 1, 0]]);
  assertEquals(reduceToPotentials([[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]], [2, 1, 2, 2]), [[1, 1, 0, 0], [0, 1, 1, 0]]);
  assertEquals(reduceToPotentials([[1, 1, 0, 1, 0], [1, 1, 0, 0, 1], [0, 1, 1, 0, 1]], [2, 1, 2, 2, 2]), [
    [1, 1, 0, 1, 0],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1],
  ]);
});

Deno.test(function canCalculateSafeSolution() {
  assertEquals(reduceToSafeSolution([[1, 1, 0, 0], [0, 1, 1, 0]]), [2, 1, 2, 0]);
  assertEquals(reduceToSafeSolution([[1, 0, 0, 0], [0, 1, 1, 0]]), [2, 2, 2, 0]);
  assertEquals(reduceToSafeSolution([[1, 1, 1, 1], [1, 1, 1, 1]]), [1, 1, 1, 1]);
  assertEquals(reduceToSafeSolution([[1, 0, 0, 0, 0], [1, 0, 0, 0, 0]]), [1, 0, 0, 0, 0]);
});

Deno.test(function canHandleRow() {
  assertEquals(handleRow(4, [2], [2, 1, 2, 2]), [2, 1, 2, 0]);
  assertEquals(handleRow(5, [2, 1]), [2, 1, 2, 2, 2]);
  assertEquals(handleRow(5, [3]), [2, 2, 1, 2, 2]);
  assertEquals(handleRow(5, [4]), [2, 1, 1, 1, 2]);
  assertEquals(handleRow(10, [4, 4]), [2, 1, 1, 1, 2, 2, 1, 1, 1, 2]);
  assertEquals(handleRow(10, [4, 4], [1, 2, 2, 2, 2, 2, 2, 2, 2, 2]), [1, 1, 1, 1, 0, 2, 1, 1, 1, 2]);
  assertEquals(handleRow(10, [2, 3, 3]), [1, 1, 0, 1, 1, 1, 0, 1, 1, 1]);
});

Deno.test(function canClearGame() {
  assertEquals(clearGame([[1]], [[1]]), [[1]]);
  assertEquals(
    clearGame([[1, 1, 1, 2], [1], [1, 2, 1], [1, 3, 1], [4, 1], [2, 2, 3], [6, 2], [5, 2], [2, 2, 1], [2, 1]], [
      [2, 1, 1, 1],
      [1, 4],
      [1, 2],
      [1, 6],
      [7],
      [1, 1, 1, 2, 1],
      [3, 1],
      [1, 2, 1, 2],
      [1, 3],
      [1, 1, 1],
    ]),
    [
      [
        1,
        1,
        0,
        1,
        0,
        1,
        0,
        0,
        1,
        0,
      ],
      [
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1,
        1,
        0,
      ],
      [
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        0,
        0,
      ],
      [
        1,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
      ],
      [
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
      ],
      [
        1,
        0,
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        1,
      ],
      [
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        0,
        0,
        1,
      ],
      [
        1,
        0,
        1,
        1,
        0,
        1,
        0,
        1,
        1,
        0,
      ],
      [
        1,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        0,
        0,
      ],
      [
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        0,
        1,
      ],
    ],
  );
  
  assertEquals(clearGame([[2,1,1],[1,3,1,1],[2],[2,3,2],[2,2,1,1],[3,1,1],[4,2],[1,2,5],[1],[1,1]], [[1,1,1],[3],[1,1,1,1],[2,6],[2,2,1],[1,3,1],[1,3,2],[2,1],[1,1,3],[1,2,2]]), [[0,1,0,0,1,0,0,1,0,0],[0,0,0,1,1,1,0,0,0,0],[0,1,0,1,0,1,0,1,0,0],[1,1,0,0,1,1,1,1,1,1],[1,1,0,1,1,0,1,0,0,0],[0,0,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,1,0,0],[0,1,1,0,0,0,0,1,0,0],[1,0,0,1,0,1,1,1,0,0],[0,1,0,1,1,0,1,1,0,0]]);
});
