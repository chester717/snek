import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, Flex, Text, Button, useBreakpointValue } from "@chakra-ui/react";
import { TbAppleFilled } from "react-icons/tb";

const GRID_SIZE = 10;
const INITIAL_SNAKE = [
  { x: 2, y: 2 },
  { x: 2, y: 1 },
];
const INITIAL_DIRECTION = { x: 0, y: 1 };
const getRandomFoodPosition = (snake) => {
  let FoodPosition;
  do {
    FoodPosition = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some(
      (snakePosition) =>
        snakePosition.x === FoodPosition.x && snakePosition.y === FoodPosition.y
    )
  );
  return FoodPosition;
};

const App = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFoodPosition(INITIAL_SNAKE));
  const [bonusFood, setBonusFood] = useState(null);
  const [foodCount, setFoodCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused,setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const bonusFoodTimeout = useRef(null);
  const boardRef = useRef(null);

  const cellSize = useBreakpointValue({ base: 8, md: 6 });

const moveSnake = useCallback(() => {
  if (isGameOver || !isStarted || isPaused) return;

  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y >= GRID_SIZE;

  const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);

  if (hitWall || hitSelf) {
    setIsGameOver(true);
    return;
  }

  const newSnake = [newHead, ...snake];

  const ateNormalFood = newHead.x === food.x && newHead.y === food.y;
  const ateBonusFood =
    bonusFood && newHead.x === bonusFood.x && newHead.y === bonusFood.y;

  if (ateNormalFood) {
    setFood(getRandomFoodPosition(newSnake));
    setScore((prev) => prev + 1);
    setFoodCount((prev) => {
      const updated = prev + 1;
      if (updated % 5 === 0) {
        const bonus = getRandomFoodPosition(newSnake);
        setBonusFood(bonus); // you forgot this
        if (bonusFoodTimeout.current) clearTimeout(bonusFoodTimeout.current);
        bonusFoodTimeout.current = setTimeout(() => setBonusFood(null), 6000);
      }
      return updated;
    });
  } else if (ateBonusFood) {
    setBonusFood(null);
    setScore((prev) => prev + 5);
  } else {
    newSnake.pop();
  }

  setSnake(newSnake);
}, [snake, direction, food, bonusFood, isGameOver, isStarted, isPaused]);


  useEffect(() => {
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;

        case "ArrowDown":
        case "s":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;

        case "ArrowLeft":
        case "a":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;

        case "ArrowRight":
        case "d":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, isGameOver]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      if (boardRef.current?.contains(e.target)) {
        e.preventDefault();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e) => {
      if (!boardRef.current?.contains(e.target)) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30 && direction.x === 0) setDirection({ x: 1, y: 0 });
        else if (diffX < -30 && direction.x === 0)
          setDirection({ x: -1, y: 0 });
      } else {
        if (diffY > 30 && direction.y === 0) setDirection({ x: 0, y: 1 });
        else if (diffY < -30 && direction.y === 0)
          setDirection({ x: 0, y: -1 });
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [direction]);

  const handleStart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFoodPosition(INITIAL_SNAKE));
    setBonusFood(null);
    setFoodCount(0);
    if (bonusFoodTimeout.current) clearTimeout(bonusFoodTimeout.current);
    setIsGameOver(false);
    setScore(0);
    setIsStarted(true);
    setIsPaused(false);
  };

    const handlePause = () => {
      setIsPaused((prev) => !prev);
    }

  return (
    <Flex align="center" direction="column" mt={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        Snake Game
      </Text>

      <Flex justify="center" align="center" mt={4} mb={2} gap={4}>
        {!isStarted || isGameOver ? (
          <Button onClick={handleStart}>
            Start Game
          </Button>
        ):(
          <Button onClick={handlePause}>{isPaused ? "Resume" : "Pause"}</Button>
        )}
              <Text fontSize="lg" mb={2}>
        Score: {score}
      </Text>
      </Flex>



      <Box
        ref={boardRef}
        mt={4}
        border="2px solid gray"
        display="grid"
        gridTemplateColumns={`repeat(${GRID_SIZE}, ${cellSize}vmin)`}
        gridTemplateRows={`repeat(${GRID_SIZE}, ${cellSize}vmin)`}
        bg="gray.100"
        touchAction="none"
      >
        {Array(GRID_SIZE * GRID_SIZE)
          .fill(null)
          .map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isHead = snake.length && snake[0].x === x && snake[0].y === y;
            const isSnake = snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            const isBonusFood =
              bonusFood && bonusFood.x === x && bonusFood.y === y;
            return (
              <Box
                key={idx}
                bg={isHead ? "green.700" : isSnake ? "green.500" : "white"}
                border="1px solid"
                borderRadius={isHead ? "10px" : isSnake ? "15px" : 0}
                borderColor="gray.300"
              >
                {isFood && <TbAppleFilled color="red" size="100%" />}
                {isBonusFood && <TbAppleFilled color="gold" size="100%" />}
              </Box>
            );
          })}
      </Box>
    </Flex>
  );
};

export default App;
