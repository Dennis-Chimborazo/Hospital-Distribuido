import { mongoDB } from './config/db.js';
import app from './config/app.js';
import 'dotenv/config';

import authRoute from './modules/auth/auth.route.js';
import pacienteRoute from './modules/paciente/paciente.route.js';

mongoDB();
app.use("/auth", authRoute);
app.use("/paciente", pacienteRoute);

app.listen(4002, () => {
    console.log("Server is running on port 4002");

});


