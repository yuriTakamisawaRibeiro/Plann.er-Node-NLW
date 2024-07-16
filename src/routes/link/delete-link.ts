import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-errors";

export async function deleteLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/links/:linkId",
    {
      schema: {
        params: z.object({
          linkId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { linkId } = request.params;

      try {
        const link = await prisma.link.findUnique({
          where: { id: linkId },
        });

        if (!link) {
          throw new ClientError("Link not found");
        }

        await prisma.link.delete({
          where: { id: linkId },
        });

        reply.status(204).send();
      } catch (error) {
        console.error("Error deleting link:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
