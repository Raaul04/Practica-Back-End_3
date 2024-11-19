import { MongoClient, ObjectId } from "mongodb";
import { TareaModel } from "./types.ts";
import { validarTarea  } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")

if (!MONGO_URL) {
  console.error("MONGO_URL is not set");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB");


const db = client.db("Backend");
const typeCollection = db.collection<TareaModel>("tareas");


const handler = async (req: Request): Promise<Response> => {
  const method = req.method; 
  const url = new URL(req.url);
  const path = url.pathname; 

  if (method === "GET") {
    if (path === "/tasks") {

      const tareaDB = await typeCollection.find().toArray();
      const tareas = tareaDB.map(validarTarea);
   
      return new Response(JSON.stringify(tareas), {
        status: 200,
      });

    } else if (path.startsWith("/tasks/")) {
        const id = path.split("/",3);
        const auxID = id[2];
        
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID de tarea es requerido" }),
            { status: 400 },
          );
        }

      const task = await typeCollection
      .find({_id: new ObjectId(auxID)})
      .toArray();
      
      if (!task) {
        return new Response(
          JSON.stringify({ error: "Tarea no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify(task), {
        headers: { "Content-Type": "application/json" },
      });
    }

  }
  else if(method === "PUT"){
    if(path.startsWith('/tasks/')){
        const id = (path.split("/",3));
        const auxID = id[2];

        const body = await req.json();

        if(!body.done){
            return new Response("Bad request", {status: 400});
        }

        const {modifiedCount} = await typeCollection.updateOne(
            {_id: new ObjectId(auxID)},
            {$set: {done: body.done}}
        )

        if(modifiedCount === 0){
            return new Response("Ningun tarea actualizada", {status: 404});
        }

        return new Response(JSON.stringify({
          id: auxID,
          title: body.title,
          done: body.done
        }), {status: 200});
    }
  }

  else if(method === "POST"){
    if(path === "/tasks"){
        const body = await req.json();

        if(!body.title){
            return new Response("Bad request", {status: 400});
        }

        const e = await typeCollection.findOne({title: body.title});
        if(e){
            return new Response("Libro existente", {status: 400});
        }

        const {insertedId} = await typeCollection.insertOne({
            title: body.title,
            done: false
        });



        return new Response(JSON.stringify({
            id: insertedId,
            title: body.title,
            done: false
        }),
    {status: 201});

    }
}
else if (method === "DELETE") {
  if (path.startsWith('/tasks/')) {
      const id = path.split("/", 3);
      const auxID = id[2];

      if (!auxID) {
          return new Response("Bad request", { status: 400 });
      }

      const { deletedCount } = await typeCollection.deleteOne({ _id: new ObjectId(auxID) });

      if (deletedCount === 0) {
          return new Response("Tarea no encontrada", { status: 404 });
      }

      return new Response(JSON.stringify({
          message: "Tarea eliminada correctamente",
          id: auxID
      }), { status: 200 });
  }
}

  return new Response (JSON.stringify({error: "Ruta no encontrada"}), {status: 404});
}

Deno.serve({ port: 3000 }, handler)
