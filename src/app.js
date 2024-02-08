import express from 'express'
import morgan from 'morgan'
import productRout from './routes/products.routes.js'
//import pkg from '../package.json' 
//const pkg = require('../package.json');

const app = express()

app.use(morgan('dev'));

//app.set('pkg', pkg);

app.get('/', (req, res) => {
    res.json({
        author: 'kelvin',
        descripcion: 'control-cnb'

    })
})

app.use('/products',productRout)

export default app;