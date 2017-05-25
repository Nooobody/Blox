import { Position } from '../position.interface';

export interface Block {
    id: number;
    pos: Position;
    health: number;
    color: number;
}
