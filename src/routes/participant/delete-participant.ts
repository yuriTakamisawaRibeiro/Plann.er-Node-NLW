import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-errors";

export async function deleteParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/trips/:tripId/participants",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const participant = await prisma.participant.findFirst({
        where: {
          trip_id: tripId,
          email,
        },
      });

      if (!participant) {
        throw new ClientError("Participante não encontrado.");
      }

      await prisma.participant.delete({
        where: {
          id: participant.id,
        },
      });

      return {
        message: "Participante removido com sucesso.",
      };
    }
  );
}
