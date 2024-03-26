import express from 'express'
import morgan from 'morgan'
import cors from 'cors'


import { createRoles } from './libs/initialSetUp.js';

import consultaCedula from './routes/consultaCedula.routes.js'
import arqueo from './routes/arqueo.routes.js'
import roles from './routes/roles.routes.js'
import comisiones from './routes/comision.routes.js'
import entidadBancariaRoute from './routes/entidadBancarias.routes.js'
import tipoTransaccion from './routes/tipotransaccion.routes.js'
import operaciones from './routes/operaciones.routes.js'
import usersRoute from './routes/user.routes.js'
import authRoute from './routes/auth.routes.js'
import dashboard from './routes/dashboard.js'

const app = express()

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

createRoles();


app.get('/', (req, res) => {
    res.json({
        author: 'kelvin',
        descripcion: 'control-cnb'

    })
})
app.use('/consultaCedula',consultaCedula)
app.use('/arqueo',arqueo)
app.use('/roles',roles)
app.use('/comisiones',comisiones)
app.use('/tipoTransaccion',tipoTransaccion)
app.use('/operaciones',operaciones)
app.use('/entidadBancaria',entidadBancariaRoute)
app.use('/users',usersRoute)
app.use('/auth',authRoute)
app.use('/dashboard',dashboard)



export default app;