"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/participant/confirm-participant.ts
var confirm_participant_exports = {};
__export(confirm_participant_exports, {
  confirmParticipant: () => confirmParticipant
});
module.exports = __toCommonJS(confirm_participant_exports);
var import_zod2 = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/errors/client-errors.ts
var ClientError = class extends Error {
};

// src/env.ts
var import_zod = require("zod");
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string().url(),
  API_BASE_URL: import_zod.z.string().url(),
  WEB_BASE_URL: import_zod.z.string().url(),
  PORT: import_zod.z.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/routes/participant/confirm-participant.ts
async function confirmParticipant(app) {
  app.withTypeProvider().get(
    `/participants/:participantId/confirm`,
    {
      schema: {
        params: import_zod2.z.object({
          participantId: import_zod2.z.string().uuid()
        })
      }
    },
    async (request, reply) => {
      const { participantId } = request.params;
      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId
        }
      });
      if (!participant) {
        throw new ClientError("Participant not found");
      }
      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.WEB_BASE_URL}/trips/${participant.trip_id}`
        );
      }
      await prisma.participant.update({
        where: { id: participantId },
        data: {
          is_confirmed: true
        }
      });
      return reply.redirect(
        `${env.WEB_BASE_URL}/trips/${participant.trip_id}`
      );
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  confirmParticipant
});
