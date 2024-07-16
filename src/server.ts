import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmParticipant } from "./routes/participant/confirm-participant";
import { confirmTrip } from "./routes/trip/confirm-trip"; 
import { createAcitivity } from "./routes/activity/create-activity";
import { createTrip } from "./routes/trip/create-trip";
import { getActivity } from "./routes/activity/get-activities";
import { createLink } from "./routes/link/create-link"; 
import { getLinks } from "./routes/link/get-links";
import { getParticipants } from "./routes/participant/get-participants";
import { createInvite } from "./routes/participant/create-invite";
import { updateTrip } from "./routes/trip/update-trip";
import { getTripDetails } from "./routes/trip/get-trip-details"; 
import { getParticipant } from "./routes/participant/get-participant";
import { errorHandler } from "./error-handler";
import { env } from "./env";
import { deleteLinks } from "./routes/link/delete-link";
import { deleteParticipant } from "./routes/participant/delete-participant";

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
app.register(deleteParticipant);
app.register(createAcitivity);
app.register(getActivity);
app.register(createLink);
app.register(deleteLinks);
app.register(getLinks);
app.register(createInvite);
app.register(updateTrip);



app.listen({ 
  host: '0.0.0.0',  
  port: env.PORT,
   
  
}).then(() => {
  console.log("Server running");
});
