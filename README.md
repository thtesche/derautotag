# Derautotag

A simple 2D dodging game built with **Astro** and **React**.

## Features

- **Core Gameplay**: Dodge falling obstacles to increase your score.
- **Powerups**: Collect green powerups to gain a temporary shield (indicated by a purple color and a green border).
- **Garage System**: Collect enough powerups to unlock the "Car Menu," where you can choose a new color for your player.
- **Responsive Canvas**: A clean, centered 2D canvas experience.

## Tech Stack

- [Astro](https://astro.build/) - Web framework for content-driven websites.
- [React](https://reactjs.org/) - UI library for the game logic and components.
- [TypeScript](https://www.typescriptlang.org/) - For type safety (configured via `tsconfig.json`).
- [Vite](https://vitejs.dev/) - Fast build tool and development server.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd derautotag
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser to play the game.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

To preview your production build locally:
```bash
npm run preview
```

## Controls

- **Left Arrow (←)**: Move player left.
- **Right Arrow (→)**: Move player right.

## License

[Specify your license here, e.g., MIT]
