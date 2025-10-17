import { mongoDB } from './config/db.js';
import app from './config/app.js';
import 'dotenv/config';

import authRoute from './modules/auth/auth.route.js';
import sedeRoute from './modules/sede/sede.route.js';
import consultorioRoute from './modules/consultorio/consultorio.route.js';
import especialidadRoute from './modules/especialidad/especialidad.route.js';
import medicoRoute from './modules/medico/medico.route.js';
import personaRoute from './modules/persona/persona.route.js';
import secretariaRoute from './modules/secretaria/secretaria.route.js';
import oficinaRoute from './modules/oficina/oficina.route.js';

mongoDB();
app.use("/auth", authRoute);
app.use("/sede", sedeRoute);
app.use("/consultorio", consultorioRoute);
app.use("/especialidad", especialidadRoute);
app.use("/medico", medicoRoute);
app.use("/persona", personaRoute);
app.use("/secretaria", secretariaRoute);
app.use("/oficina", oficinaRoute);

app.listen(4001, () => {
    console.log("Server is running on port 4001");

});


