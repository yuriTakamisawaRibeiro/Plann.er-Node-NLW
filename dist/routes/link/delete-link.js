"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/link/delete-link.ts
var delete_link_exports = {};
__export(delete_link_exports, {
  deleteLinks: () => deleteLinks
});
module.exports = __toCommonJS(delete_link_exports);
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/errors/client-errors.ts
var ClientError = class extends Error {
};

// src/routes/link/delete-link.ts
async function deleteLinks(app) {
  app.withTypeProvider().delete(
    "/links/:linkId",
    {
      schema: {
        params: import_zod.z.object({
          linkId: import_zod.z.string().uuid()
        })
      }
    },
    async (request, reply) => {
      const { linkId } = request.params;
      try {
        const link = await prisma.link.findUnique({
          where: { id: linkId }
        });
        if (!link) {
          throw new ClientError("Link not found");
        }
        await prisma.link.delete({
          where: { id: linkId }
        });
        reply.status(204).send();
      } catch (error) {
        console.error("Error deleting link:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteLinks
});
