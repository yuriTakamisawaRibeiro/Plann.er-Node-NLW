import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createAcitivity } from "./routes/create-activity";
import { createTrip } from "./routes/create-trip";
import { getActivity } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { getParticipant } from "./routes/get-participant";
import { errorHandler } from "./error-handler";
import { env } from "./env";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

app.register(createTrip);
app.register(confirmTrip);
app.register(getTripDetails);
app.register(confirmParticipant);
app.register(getParticipant);
app.register(getParticipants);
app.register(createAcitivity);
app.register(getActivity);
app.register(createLink);
app.register(getLinks);
app.register(createInvite);
app.register(updateTrip);

app.listen({ port: env.PORT }).then(() => {
  console.log("Server running");
});
