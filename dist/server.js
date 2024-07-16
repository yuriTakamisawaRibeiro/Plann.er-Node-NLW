"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/server.ts
var import_cors = __toESM(require("@fastify/cors"));
var import_fastify = __toESM(require("fastify"));
var import_fastify_type_provider_zod = require("fastify-type-provider-zod");

// src/routes/participant/confirm-participant.ts
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
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string().url(),
  API_BASE_URL: import_zod.z.string().url(),
  WEB_BASE_URL: import_zod.z.string().url(),
  PORT: import_zod.z.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/routes/participant/confirm-participant.ts
async function confirmParticipant(app2) {
  app2.withTypeProvider().get(
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

// src/routes/trip/confirm-trip.ts
var import_zod3 = require("zod");

// src/lib/dayjs.ts
var import_dayjs = __toESM(require("dayjs"));
var import_localizedFormat = __toESM(require("dayjs/plugin/localizedFormat"));
var import_pt_br = require("dayjs/locale/pt-br");
import_dayjs.default.locale("pt-br");
import_dayjs.default.extend(import_localizedFormat.default);

// src/routes/trip/confirm-trip.ts
var import_nodemailer2 = __toESM(require("nodemailer"));

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

// src/routes/trip/confirm-trip.ts
async function confirmTrip(app2) {
  app2.withTypeProvider().get(
    `/trips/:tripId/confirm`,
    {
      schema: {
        params: import_zod3.z.object({
          tripId: import_zod3.z.string().uuid()
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId
        },
        include: {
          participants: {
            where: {
              is_owner: false
            }
          }
        }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      if (trip.is_confirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
      }
      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true }
      });
      const formattedStartDate = (0, import_dayjs.default)(trip.starts_at).format("LL");
      const formattedEndDate = (0, import_dayjs.default)(trip.ends_at).format("LL");
      const mail = await getMailClient();
      await Promise.all(
        trip.participants.map(async (participant) => {
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
                <p>Voc\xEA foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> at\xE9 <strong>${formattedEndDate}</strong> .</p>
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
        })
      );
      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
    }
  );
}

// src/routes/activity/create-activity.ts
var import_zod4 = require("zod");
async function createAcitivity(app2) {
  app2.withTypeProvider().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: import_zod4.z.object({
          tripId: import_zod4.z.string().uuid()
        }),
        body: import_zod4.z.object({
          title: import_zod4.z.string().min(4),
          occurs_at: import_zod4.z.coerce.date()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const { title, occurs_at } = request.body;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      if ((0, import_dayjs.default)(occurs_at).isBefore(trip.starts_at)) {
        throw new ClientError("Invalid activity date");
      }
      if ((0, import_dayjs.default)(occurs_at).isAfter(trip.ends_at)) {
        throw new ClientError("Invalid activity date");
      }
      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId
        }
      });
      return {
        activityId: activity.id
      };
    }
  );
}

// src/routes/trip/create-trip.ts
var import_zod5 = require("zod");
var import_nodemailer3 = __toESM(require("nodemailer"));
async function createTrip(app2) {
  app2.withTypeProvider().post(
    "/trips",
    {
      schema: {
        body: import_zod5.z.object({
          destination: import_zod5.z.string().min(4),
          starts_at: import_zod5.z.coerce.date(),
          ends_at: import_zod5.z.coerce.date(),
          owner_name: import_zod5.z.string(),
          owner_email: import_zod5.z.string().email(),
          emails_to_invite: import_zod5.z.array(import_zod5.z.string().email()).optional()
        })
      }
    },
    async (request) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite = []
      } = request.body;
      if ((0, import_dayjs.default)(starts_at).isBefore(/* @__PURE__ */ new Date())) {
        throw new ClientError("Invalid trip start date");
      }
      if ((0, import_dayjs.default)(ends_at).isBefore(starts_at)) {
        throw new ClientError("Invalid trip end date");
      }
      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true
                },
                ...emails_to_invite.map((email) => ({
                  name: "",
                  email
                }))
              ]
            }
          }
        }
      });
      const formattedStartDate = (0, import_dayjs.default)(starts_at).format("LL");
      const formattedEndDate = (0, import_dayjs.default)(ends_at).format("LL");
      const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;
      const emailClient = await getMailClient();
      const message = await emailClient.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er"
        },
        to: {
          name: owner_name,
          address: owner_email
        },
        subject: `Confirme sua viagem para ${destination}`,
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height:1.6">
            <p>Voc\xEA solicitou a cria\xE7\xE3o de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> at\xE9 <strong>${formattedEndDate}</strong>.</p>
            <br>
            <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <br>
            <p>Caso voc\xEA n\xE3o saiba do que se trata esse e-mail, apenas ignore-o.</p>
        </div>`.trim()
      });
      console.log(import_nodemailer3.default.getTestMessageUrl(message));
      return {
        tripId: trip.id
      };
    }
  );
}

// src/routes/activity/get-activities.ts
var import_zod6 = require("zod");
async function getActivity(app2) {
  app2.withTypeProvider().get(
    "/trips/:tripId/activities",
    {
      schema: {
        params: import_zod6.z.object({
          tripId: import_zod6.z.string().uuid()
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          activities: {
            orderBy: {
              occurs_at: "asc"
            }
          }
        }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      const differenceInDaysBetweenTripStartAndEnd = (0, import_dayjs.default)(trip.ends_at).diff(
        (0, import_dayjs.default)(trip.starts_at),
        "days"
      );
      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1
      }).map((_, index) => {
        const date = (0, import_dayjs.default)(trip.starts_at).add(index, "days");
        return {
          date: date.toISOString(),
          activities: trip.activities.filter((activity) => {
            return (0, import_dayjs.default)(activity.occurs_at).isSame(date, "day");
          })
        };
      });
      return reply.send({ activities });
    }
  );
}

// src/routes/link/create-link.ts
var import_zod7 = require("zod");
async function createLink(app2) {
  app2.withTypeProvider().post(
    "/trips/:tripId/links",
    {
      schema: {
        params: import_zod7.z.object({
          tripId: import_zod7.z.string().uuid()
        }),
        body: import_zod7.z.object({
          title: import_zod7.z.string().min(4),
          url: import_zod7.z.string().url()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const { title, url } = request.body;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId
        }
      });
      return {
        linkId: link.id
      };
    }
  );
}

// src/routes/link/get-links.ts
var import_zod8 = require("zod");
async function getLinks(app2) {
  app2.withTypeProvider().get(
    "/trips/:tripId/links",
    {
      schema: {
        params: import_zod8.z.object({
          tripId: import_zod8.z.string().uuid()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { links: true }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      return { links: trip.links };
    }
  );
}

// src/routes/participant/get-participants.ts
var import_zod9 = require("zod");
async function getParticipants(app2) {
  app2.withTypeProvider().get(
    "/trips/:tripId/participants",
    {
      schema: {
        params: import_zod9.z.object({
          tripId: import_zod9.z.string().uuid()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true
            }
          }
        }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      return { participants: trip.participants };
    }
  );
}

// src/routes/participant/create-invite.ts
var import_zod10 = require("zod");
var import_nodemailer4 = __toESM(require("nodemailer"));
async function createInvite(app2) {
  app2.withTypeProvider().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: import_zod10.z.object({
          tripId: import_zod10.z.string().uuid()
        }),
        body: import_zod10.z.object({
          email: import_zod10.z.string().email()
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
      console.log(import_nodemailer4.default.getTestMessageUrl(message));
      return {
        participantId: participant.id
      };
    }
  );
}

// src/routes/trip/update-trip.ts
var import_zod11 = require("zod");
async function updateTrip(app2) {
  app2.withTypeProvider().put(
    "/trips/:tripId",
    {
      schema: {
        params: import_zod11.z.object({
          tripId: import_zod11.z.string().uuid()
        }),
        body: import_zod11.z.object({
          destination: import_zod11.z.string().min(4),
          starts_at: import_zod11.z.coerce.date(),
          ends_at: import_zod11.z.coerce.date()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const { destination, starts_at, ends_at } = request.body;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      if ((0, import_dayjs.default)(ends_at).isBefore(starts_at)) {
        throw new ClientError("Invalid trip end date.");
      }
      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          starts_at,
          ends_at
        }
      });
      return { tripId: trip.id };
    }
  );
}

// src/routes/trip/get-trip-details.ts
var import_zod12 = require("zod");
async function getTripDetails(app2) {
  app2.withTypeProvider().get(
    "/trips/:tripId",
    {
      schema: {
        params: import_zod12.z.object({
          tripId: import_zod12.z.string().uuid()
        })
      }
    },
    async (request) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          is_confirmed: true
        }
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      return { trip };
    }
  );
}

// src/routes/participant/get-participant.ts
var import_zod13 = require("zod");
async function getParticipant(app2) {
  app2.withTypeProvider().get(
    "/participants/:participantId",
    {
      schema: {
        params: import_zod13.z.object({
          participantId: import_zod13.z.string().uuid()
        })
      }
    },
    async (request) => {
      const { participantId } = request.params;
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true
        }
      });
      if (!participant) {
        throw new ClientError("Participant not found");
      }
      return { participant };
    }
  );
}

// src/error-handler.ts
var import_zod14 = require("zod");
var errorHandler = (error, request, reply) => {
  if (error instanceof import_zod14.ZodError) {
    return reply.status(400).send({ message: "Invalid input", errors: error.flatten().fieldErrors });
  }
  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message });
  }
  return reply.status(500).send({ message: "Internal server error" });
};

// src/routes/link/delete-link.ts
var import_zod15 = require("zod");
async function deleteLinks(app2) {
  app2.withTypeProvider().delete(
    "/links/:linkId",
    {
      schema: {
        params: import_zod15.z.object({
          linkId: import_zod15.z.string().uuid()
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

// src/routes/participant/delete-participant.ts
var import_zod16 = require("zod");
async function deleteParticipant(app2) {
  app2.withTypeProvider().delete(
    "/trips/:tripId/participants",
    {
      schema: {
        params: import_zod16.z.object({
          tripId: import_zod16.z.string().uuid()
        }),
        body: import_zod16.z.object({
          email: import_zod16.z.string().email()
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

// src/server.ts
var app = (0, import_fastify.default)();
app.register(import_cors.default, {
  origin: "*"
});
app.setValidatorCompiler(import_fastify_type_provider_zod.validatorCompiler);
app.setSerializerCompiler(import_fastify_type_provider_zod.serializerCompiler);
app.setErrorHandler(errorHandler);
app.register(createTrip);
app.register(confirmTrip);
app.register(getTripDetails);
app.register(confirmParticipant);
app.register(getParticipant);
app.register(getParticipants);
app.register(deleteParticipant);
app.register(createAcitivity);
app.register(getActivity);
app.register(createLink);
app.register(deleteLinks);
app.register(getLinks);
app.register(createInvite);
app.register(updateTrip);
app.listen({
  host: "0.0.0.0",
  port: env.PORT
}).then(() => {
  console.log("Server running");
});
