export interface Tile {
  type: string;
  width?: number;
  height?: number;
  color?: string;
  direction?: "row" | "column" | string;
  img?: string;
  title?: string;
  link?: string;
  children?: Tile[];
}

export interface TileConfig {
  grid: {
    columns: number;
    rows: string;
  };
  tiles: Tile[];
}

