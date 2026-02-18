const express = require('express')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const qs = require('qs')
const crypto = require('crypto')
const owner = "Rerezz Ganteng"
const router = express.Router()

//=====[ FUNCTION OPENAI ]=====//
async function AiCT(question, imagePath) {
    let file = null

    if (imagePath) {
        const buffer = fs.readFileSync(imagePath)
        file = {
            data: buffer.toString('base64'),
            type: 'image/jpeg',
            name: path.basename(imagePath)
        }
    }

    const response = await axios.post(
        'https://aifreeforever.com/api/generate-ai-answer',
        {
            question,
            tone: 'friendly',
            format: 'paragraph',
            file
        },
        {
            headers: {
                accept: '*/*',
                'accept-language': 'id-ID',
                'content-type': 'application/json',
                referer: 'https://aifreeforever.com/tools/free-chatgpt-no-login'
            },
            timeout: 30000
        }
    )

    return response.data.answer
}

async function kimiChat(message) {
    const session_id = `session_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`

    const nonceRes = await axios.get('https://kimi-ai.chat/chat/')
    const nonceMatch = nonceRes.data.match(/"nonce":"(.*?)"/)
    const nonce = nonceMatch ? nonceMatch[1] : null

    if (!nonce) {
        return {
            success: false,
            error: 'Failed to get nonce'
        }
    }

    const data = qs.stringify({
        action: 'kimi_send_message',
        nonce,
        message,
        model: 'moonshotai/Kimi-K2-Instruct-0905',
        session_id
    })

    try {
        const res = await axios.post(
            'https://kimi-ai.chat/wp-admin/admin-ajax.php',
            data,
            {
                headers: {
                    accept: '*/*',
                    'accept-language': 'id-ID',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'x-requested-with': 'XMLHttpRequest',
                    Referer: 'https://kimi-ai.chat/chat/',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            }
        )

        if (res.data.success) {
            return {
                success: true,
                session_id,
                message_input: message,
                response: res.data.data.message
            }
        } else {
            return {
                success: false,
                session_id,
                error: 'Failed to get response'
            }
        }
    } catch (err) {
        return {
            success: false,
            session_id,
            error: err.message
        }
    }
}



//=====[ RUTE ENDPOINT API ]=====//

router.get('/', (req, res) => {
    res.json({
        status: true,
        code: 200,
        owner: owner,
        version: "1.0.0",
        message: "Endpoint API OpenAI"
    })
})

router.get('/ai', async (req, res) => {
    try {
        const { text, image } = req.query

        if (!text) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: 'Rerezz',
                message: 'parmeter "text" harus di isi'
            })
        }

        const imagePath = image ? path.join(process.cwd(), image) : null
        const result = await AiCT(text, imagePath)

        return res.status(200).json({
            status: true,
            code: 200,
            creator: 'Rerezz',
            message: 'Request Api Succes',
            data: result
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            code: 500,
            creator: 'Rerezz',
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

router.get('/kimi', async (req, res) => {
    try {
        const { text } = req.query

        if (!text) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: 'Rerezz',
                message: 'Parmeter "text" haru di isi'
            })
        }

        const result = await kimiChat(text)

        if (!result.success) {
            return res.status(500).json({
                status: false,
                code: 500,
                creator: 'Rerezz',
                message: 'Request Failed',
                error: result.error
            })
        }

        return res.status(200).json({
            status: true,
            code: 200,
            creator: 'Rerezz',
            message: 'Request Api Succes',
            data: result.response
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            code: 500,
            creator: 'Rerezz',
            message: 'Internal Server Error',
            error: error.message
        })
    }
})



module.exports = router