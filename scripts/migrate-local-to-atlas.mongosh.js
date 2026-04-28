const srcUri = process.env.SRC_URI;
const dstUri = process.env.DST_URI;
const srcDbName = process.env.SRC_DB || "padayun";
const dstDbName = process.env.DST_DB || srcDbName;

if (!srcUri || !dstUri) {
  throw new Error("SRC_URI and DST_URI are required");
}

const src = new Mongo(srcUri);
const dst = new Mongo(dstUri);
const srcDb = src.getDB(srcDbName);
const dstDb = dst.getDB(dstDbName);

const collections = srcDb.getCollectionNames();
print(`Found ${collections.length} collection(s) in source DB '${srcDbName}'.`);

for (const name of collections) {
  const sourceCollection = srcDb.getCollection(name);
  const targetCollection = dstDb.getCollection(name);
  const docs = sourceCollection.find().toArray();

  targetCollection.deleteMany({});
  if (docs.length > 0) {
    targetCollection.insertMany(docs, { ordered: true });
  }

  print(`Migrated '${name}': ${docs.length} document(s).`);
}

print("Migration completed.");
