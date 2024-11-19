import { ObjectId,OptionalId } from "mongodb";

export type TareaModel = OptionalId<{
    title: string;
    done: boolean;
}>;

export type Tarea ={
    _id: ObjectId;
    title: string;
    done: boolean;
}

