const express = require('express')
const owner = "Rerezz Official"
const router = express.Router()


router.get('/list', (req, res) => {
    res.status(200).json({
        status: true,
        code: 200,
        owner: owner,
        version: "1.0.0",
        total_Api: 9,
        message: "Endpoint API list",
        data: {
            openai: [
                {
                    name: "AI",
                    status: true,
                    method: "GET",
                    route: "/api/openai/ai",
                    query: "?text=hallo",
                    example: "/api/openai/ai?text=hallo"
                },
                {
                    name: "Kimi",
                    status: true,
                    method: "GET",
                    route: "/api/openai/kimi",
                    query: "?text=hallo",
                    example: "/api/openai/kimi?text=hallo"
                }
            ],
            download: [
                {
                    name: "TikTok",
                    status: true,
                    method: "GET",
                    route: "/api/download/tiktok",
                    query: "?url=https://vt.tiktok.com/ZSmAnEJNQ/",
                    example: "/api/download/tiktok?url=https://vt.tiktok.com/ZSmAnEJNQ/"
                },
                {
                    name: "YouTube",
                    status: true,
                    method: "GET",
                    route: "/api/download/ytdl",
                    query: "?url=https://youtu.be/_4nvfBU_wV8?si=IELXdIO-huiqJgQH",
                    example: "/api/download/ytdl?url=https://youtu.be/_4nvfBU_wV8?si=IELXdIO-huiqJgQH"
                }
            ],
            tools: [
                {
                    name: "Text To Binary",
                    status: true,
                    method: "GET",
                    route: "/api/tools/tobinary",
                    query: "?text=hallo",
                    example: "/api/tools/tobinary?text=hallo"
                },
                {
                    name: "Text To Ascii",
                    status: true,
                    method: "GET",
                    route: "/api/tools/toascii",
                    query: "?text=hallo",
                    example: "/api/tools/toascii?text=hallo"
                },
                {
                    name: "To Text",
                    status: true,
                    method: "GET",
                    route: "/api/tools/totext",
                    query: "?text=104+97+108+105",
                    example: "/api/tools/totext?text=104+97+108+105"
                },
                {
                    name: "Info IP",
                    status: true,
                    method: "GET",
                    route: "/api/tools/infoip",
                    query: "?ip=198.169.2.129",
                    example: "/api/tools/infoip?ip=198.169.2.129"
                },
                {
                    name: "Cek IP",
                    status: true,
                    method: "GET",
                    route: "/api/tools/cekip",
                    query: "?domain=vercel.com",
                    example: "/api/tools/cekip?domain=vercel.com"
                }
            ]
        }
    })
})

router.get('/info', (req, res) => {
    res.status(200).json({
        status: true,
        code: 200,
        owner: owner,
        version: "1.0.0",
        total_Api: 9,
        last_update: "19 Februari 2026",
        message: "Layanan Api Siap Di Gunakan",
        tqto: {
            1: "Allah SWT",
            2: "My parents",
            3: "My Friend",
            4: "And all of you who contributed to making this API"
        }
    })
})
module.exports = router