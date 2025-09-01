# 3D Sliding Block Puzzle Explorer

A mesmerizing 3D visualization tool that brings sliding block puzzles to life! Watch as every possible move unfolds in an interactive 3D tree, revealing the hidden complexity and beauty of these classic puzzles.

## What is this?

Imagine you have a sliding block puzzle (like the classic "Rush Hour" game) where you need to move blocks around to free a specific piece. This tool doesn't just solve the puzzle - it shows you **every single possible move** in a stunning 3D visualization.

Each node in the 3D tree represents a different state of the puzzle, and the connections show how moves transform one state into another. It's like having a magical window into the puzzle's soul!

## Why is this cool?

🎯 **See the Big Picture**: Instead of just finding one solution, you can explore the entire solution space and understand why certain moves work or don't work.

🧠 **Learn Algorithm Concepts**: Perfect for understanding search algorithms, state space exploration, and computational complexity in a visual, intuitive way.

🎨 **Beautiful Visualization**: The 3D tree layout uses force-directed algorithms to create an aesthetically pleasing and informative representation of the puzzle's complexity.

🎮 **Interactive Experience**: Click on any node to see that puzzle state, adjust visualization parameters, and explore the tree from any angle.

## What can you do with it?

- **Explore Puzzle Complexity**: See how simple-looking puzzles can have hundreds or thousands of possible states
- **Educational Tool**: Great for teaching algorithms, game theory, or computational thinking
- **Puzzle Analysis**: Understand why certain puzzles are harder than others
- **Visual Learning**: See abstract concepts like "state space" and "search trees" come to life

## How to use it

1. **Start the app**: Run `pnpm install` then `pnpm dev`
2. **Choose a puzzle**: The app comes with sample puzzles to explore
3. **Navigate the tree**: Use your mouse to rotate, zoom, and explore the 3D visualization
4. **Click nodes**: Select any node to see that specific puzzle state
5. **Adjust settings**: Fine-tune the visualization with the settings panel

## The Magic Behind It

The tool uses a breadth-first search algorithm to explore all possible moves from the starting position, creating a tree where:

- **Nodes** = puzzle states
- **Edges** = possible moves between states
- **Tree structure** = the complete solution space

The 3D layout uses force-directed algorithms to position nodes so that related states are close together, making patterns and relationships visible.

## Perfect For

- **Students** learning about algorithms and computational thinking
- **Teachers** looking for engaging ways to explain search algorithms
- **Puzzle enthusiasts** who want to understand the deeper structure of sliding block puzzles
- **Anyone** curious about how computers explore complex problem spaces

---

_This isn't just a puzzle solver - it's a window into the fascinating world of computational problem-solving, made beautiful and accessible through 3D visualization._
