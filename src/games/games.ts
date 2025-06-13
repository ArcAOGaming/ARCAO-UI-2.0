import { RUNREALM_LINKS } from "../links";

export interface Game {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'coming_soon';
  creator: string;
  creatorLogo: string;
  externalLink?: string;
}

export const games: Game[] = [
  {
    id: 'PONG',
    title: 'PONG',
    description: 'Experience the timeless classic reimagined for the blockchain era. Compete for high scores!',
    status: 'live',
    creator: 'ARCAO',
    creatorLogo: '/Creator_Logos/arcao.ico'
  },
  {
    id: 'BRICK_BLITZ',
    title: 'Brick Blitz',
    description: 'The legendary puzzle game meets blockchain. Stack, clear lines, and compete for high scores on the blockchain!',
    status: 'live',
    creator: 'ARCAO',
    creatorLogo: '/Creator_Logos/arcao.ico'
  },
  {
    id: 'MAZE_MUNCHER',
    title: 'Maze Muncher',
    description: 'Navigate through the maze, collect coins, and avoid ghosts in this blockchain-powered arcade adventure!',
    status: 'live',
    creator: 'ARCAO',
    creatorLogo: '/Creator_Logos/arcao.ico'
  },
  {
    id: 'FEAST_OR_FAMINE',
    title: 'Feast or Famine',
    description: 'Control your blob and feast or famine in this exciting arcade game. Compete for the highest score!',
    status: 'live',
    creator: 'ARCAO',
    creatorLogo: '/Creator_Logos/arcao.ico'
  },
  {
    id: 'RUNE_REALM',
    title: 'Rune Realm',
    description: 'Explore a mystical world of runes and magic in this enchanting blockchain adventure.',
    status: 'live',
    creator: "Rune Realm",
    creatorLogo: '/Creator_Logos/rune_realm.png',
    externalLink: RUNREALM_LINKS.GAME
  }
  // {
  //   id: 'TOWER_GAME',
  //   title: 'Tower Game',
  //   description: 'Build, defend, and conquer in this strategic tower defense game powered by blockchain technology.',
  //   status: 'live',
  //   creator: "Satoshi's Palace",
  //   creatorLogo: '/Creator_Logos/sp.ico',
  //   externalLink: 'https://tower.ar.ionode.online/'
  // },
  // {
  //   id: 'Ghost_Hunt',
  //   title: 'Ghost Hunt',
  //   description: 'Play with friends to survive waves of ghosts. Compete for the highest score!',
  //   status: 'coming_soon',
  //   creator: 'ARCAO',
  //   creatorLogo: '/Creator_Logos/arcao.ico'
  // }
];
