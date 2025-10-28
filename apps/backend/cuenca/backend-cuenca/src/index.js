import { mongoDB } from './config/db.js';
import app from './config/app.js';
import 'dotenv/config';

import authRoute from './modules/auth/auth.route.js';
import pacienteRoute from './modules/paciente/paciente.route.js';
import citaRoute from './modules/cita/cita.route.js';
import especialidadRoute from './modules/especialidad/especialidad.route.js';
import medicoRoute from './modules/medico/medico.route.js';

mongoDB();
app.use("/auth", authRoute);
app.use("/paciente", pacienteRoute);
app.use("/cita", citaRoute);
app.use("/especialidad", especialidadRoute);
app.use("/medico", medicoRoute);

app.listen(4002, () => {
    console.log("Server is running on port 4002");

});


