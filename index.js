const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.get('/docs.api', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'))
})
app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'donate.html'))
})

const listApi = require('./lib/api')
app.use('/api', listApi)

const openai = require('./lib/openai')
app.use('/api/openai', openai)

const download = require('./lib/download')
app.use('/api/download', download)

const tools = require('./lib/tools')
app.use('/api/tools', tools)


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})