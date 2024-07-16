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

// src/routes/participant/create-invite.ts
var create_invite_exports = {};
__export(create_invite_exports, {
  createInvite: () => createInvite
});
module.exports = __toCommonJS(create_invite_exports);
var import_zod2 = require("zod");
var import_nodemailer2 = __toESM(require("nodemailer"));

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/lib/dayjs.ts
var import_dayjs = __toESM(require("dayjs"));
var import_localizedFormat = __toESM(require("dayjs/plugin/localizedFormat"));
var import_pt_br = require("dayjs/locale/pt-br");
import_dayjs.default.locale("pt-br");
import_dayjs.default.extend(import_localizedFormat.default);

// src/lib/mail.ts
var import_nodemailer = __toESM(require("nodemailer"));
async function getMailClient() {
  const account = await import_nodemailer.default.createTestAccount();
  const transporter = import_nodemailer.default.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  return transporter;
}

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

// src/routes/participant/create-invite.ts
async function createInvite(app) {
  app.withTypeProvider().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: import_zod2.z.object({
          tripId: import_zod2.z.string().uuid()
        }),
        body: import_zod2.z.object({
          email: import_zod2.z.string().email()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          trip_id: tripId,
          email
        }
      });
      if (existingParticipant) {
        throw new ClientError("Este email j\xE1 foi convidado para esta viagem.");
      }
      const participant = await prisma.participant.create({
        data: {
          name: "",
          email,
          trip_id: tripId
        }
      });
      const formattedStartDate = (0, import_dayjs.default)(trip.starts_at).format("LL");
      const formattedEndDate = (0, import_dayjs.default)(trip.ends_at).format("LL");
      const mail = await getMailClient();
      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;
      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er"
        },
        to: participant.email,
        subject: `Confirme sua presen\xE7a na viagem para ${trip.destination}`,
        html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height:1.6">
                <p>Voc\xEA foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> at\xE9 <strong>${formattedEndDate}</strong>.</p>
                <br>
                <p>Para confirmar sua presen\xE7a na viagem, clique no link abaixo:</p>
                <br>
                <p>
                    <a href="${confirmationLink}">Confirmar viagem</a>
                </p>
                <br>
                <p>Caso voc\xEA n\xE3o saiba do que se trata esse e-mail, apenas ignore-o.</p>
            </div>`.trim()
      });
      console.log(import_nodemailer2.default.getTestMessageUrl(message));
      return {
        participantId: participant.id
      };
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createInvite
});
