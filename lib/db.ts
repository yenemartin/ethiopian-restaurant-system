import type { ModelLike } from "./model-types";

type MongooseModule = {
  connect: (uri: string, options: Record<string, unknown>) => Promise<unknown>;
  models: Record<string, ModelLike | undefined>;
  model: (name: string, schema: unknown) => ModelLike;
  Schema: new (definition: unknown, options?: unknown) => unknown;
  Types: { ObjectId: new (id: string) => unknown };
};

declare global {
  var mongooseConnection: Promise<unknown> | undefined;
  var mongooseModule: MongooseModule | undefined;
}

async function importExternal(moduleName: string) {
  const importer = new Function("moduleName", "return import(moduleName)") as (name: string) => Promise<Record<string, unknown>>;
  return importer(moduleName);
}

export async function getMongoose(): Promise<MongooseModule> {
  if (!global.mongooseModule) {
    const loaded = await importExternal("mongoose");
    global.mongooseModule = (loaded.default || loaded) as MongooseModule;
  }
  return global.mongooseModule;
}

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const mongoose = await getMongoose();
  if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
      bufferCommands: false,
    });
  }

  return global.mongooseConnection;
}
