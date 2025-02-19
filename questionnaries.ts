import { Answer } from "./answer";

export interface Questionnaries {
    id: string | null;
    answers: Answer[] | null;
};