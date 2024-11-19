import { TareaModel } from "./types.ts";

export const validarTarea = (tarea: TareaModel) => ({
    id:tarea._id!.toString() ,//Si pones una interrogacion es opcional y si es excalmacion es obligatorio
    title: tarea.title,
    done: tarea.done
});