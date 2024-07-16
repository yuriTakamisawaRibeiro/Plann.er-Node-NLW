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

// src/routes/participant/delete-participant.ts
var delete_participant_exports = {};
__export(delete_participant_exports, {
  deleteParticipant: () => deleteParticipant
});
module.exports = __toCommonJS(delete_participant_exports);
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/errors/client-errors.ts
var ClientError = class extends Error {
};

// src/routes/participant/delete-participant.ts
async function deleteParticipant(app) {
  app.withTypeProvider().delete(
    "/trips/:tripId/participants",
    {
      schema: {
        params: import_zod.z.object({
          tripId: import_zod.z.string().uuid()
        }),
        body: import_zod.z.object({
          email: import_zod.z.string().email()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;
      const participant = await prisma.participant.findFirst({
        where: {
          trip_id: tripId,
          email
        }
      });
      if (!participant) {
        throw new ClientError("Participante n\xE3o encontrado.");
      }
      await prisma.participant.delete({
        where: {
          id: participant.id
        }
      });
      return {
        message: "Participante removido com sucesso."
      };
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteParticipant
});
