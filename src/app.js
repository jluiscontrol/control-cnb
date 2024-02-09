import express from 'express'
import morgan from 'morgan'


import productRout from './routes/products.routes.js'
import entidadBancariaRoute from './routes/entidadBancarias.routes.js'
import usersRoute from './routes/user.routes.js'


const app = express()
app.use(morgan('dev'));
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        author: 'kelvin',
        descripcion: 'control-cnb'

    })
})

app.use('/products',productRout)
app.use('/entidadBancaria',entidadBancariaRoute)
app.use('/users',usersRoute)

export default app;