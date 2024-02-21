import express from 'express'
import morgan from 'morgan'
import cors from 'cors'


import { createRoles } from './libs/initialSetUp.js';

import entidadBancariaRoute from './routes/entidadBancarias.routes.js'
import usersRoute from './routes/user.routes.js'
import authRoute from './routes/auth.routes.js'


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


app.use('/entidadBancaria',entidadBancariaRoute)
app.use('/users',usersRoute)
app.use('/auth',authRoute)

export default app;