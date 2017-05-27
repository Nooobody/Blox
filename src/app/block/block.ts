import { Vector } from '../vector';

export interface Block {
    id: number;
    pos: Vector;
    health: number;
    color: number;
}
