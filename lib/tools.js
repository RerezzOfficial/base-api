const express = require('express')
const axios = require("axios")
const dns = require ("dns/promises")
const owner = "Rerezz Ganteng"
const router = express.Router()

router.get('/tobinary', (req, res) => {
    const { text } = req.query

    if (!text) {
        return res.status(400).json({
            status: false,
            code: 400,
            creator: 'Rerezz',
            message: 'Parameter text wajib diisi'
        })
    }

    const binary = text
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')

    res.json({
        status: true,
        code: 200,
        creator: 'Rerezz',
        result: {
            original: text,
            binary
        }
    })
})

router.get('/toascii', (req, res) => {
    const { text } = req.query

    if (!text) {
        return res.status(400).json({
            status: false,
            code: 400,
            creator: 'Rerezz',
            message: 'Parameter text wajib diisi'
        })
    }

    const ascii = text
        .split('')
        .map(char => char.charCodeAt(0))
        .join(' ')

    res.json({
        status: true,
        code: 200,
        creator: 'Rerezz',
        result: {
            original: text,
            ascii
        }
    })
})

router.get('/totext', (req, res) => {
    const { text } = req.query
    if (!text) {
        return res.status(400).json({
            status: false,
            code: 400,
            creator: 'Rerezz',
            message: 'Parameter text wajib diisi'
        })
    }
    const clean = text.trim()
    const isBinary = /^[01\s]+$/.test(clean)
    let result = ''
    try {
        if (isBinary) {
            result = clean
                .split(/\s+/)
                .map(bin => String.fromCharCode(parseInt(bin, 2)))
                .join('')
        } else {
            result = clean
                .split(/\s+/)
                .map(num => String.fromCharCode(parseInt(num, 10)))
                .join('')
        }
        res.json({
            status: true,
            code: 200,
            creator: 'Rerezz',
            result: {
                original: text,
                text: result
            }
        })
    } catch {
        res.status(400).json({
            status: false,
            code: 400,
            creator: 'Rerezz',
            message: 'Format tidak valid herus berupa "binary" atau "ascii"'
        })
    }
})

router.get("/infoip", async (req, res) => {
    const { ip } = req.query

    if (!ip) {
        return res.status(400).json({
            status: false,
            code: 400,
            creator: "Rerezz",
            message: "Query ip diperlukan"
        })
    }

    try {
        const { data } = await axios.get(`http://ip-api.com/json/${ip}`)

        if (data.status !== "success") {
            return res.status(404).json({
                status: false,
                code: 404,
                creator: "Rerezz",
                message: "IP tidak ditemukan"
            })
        }

        res.status(200).json({
            status: true,
            code: 200,
            creator: "Rerezz",
            result: {
                ip: data.query,
                country: data.country,
                countryCode: data.countryCode,
                region: data.regionName,
                city: data.city,
                zip: data.zip,
                lat: data.lat,
                lon: data.lon,
                timezone: data.timezone,
                isp: data.isp,
                org: data.org,
                as: data.as
            }
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            creator: "Rerezz",
            message: "Internal Server Error",
            error: error.message
        })
    }
})

router.get("/cekip", async (req, res) => {
    const { domain } = req.query

    if (!domain) {
        return res.status(400).json({
            status: false,
            code: 400,
            creator: "Rerezz",
            message: "Query domain diperlukan"
        })
    }

    try {
        const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")

        const [whois, a, aaaa, mx, ns, txt] = await Promise.allSettled([
            axios.get(`https://api.whois.vu/?q=${encodeURIComponent(cleanDomain)}`),
            dns.resolve4(cleanDomain),
            dns.resolve6(cleanDomain),
            dns.resolveMx(cleanDomain),
            dns.resolveNs(cleanDomain),
            dns.resolveTxt(cleanDomain)
        ])

        res.status(200).json({
            status: true,
            code: 200,
            creator: "Rerezz",
            result: {
                domain: cleanDomain,
                ip: a.status === "fulfilled" ? a.value : [],
                ipv6: aaaa.status === "fulfilled" ? aaaa.value : [],
                mx: mx.status === "fulfilled" ? mx.value : [],
                ns: ns.status === "fulfilled" ? ns.value : [],
                txt: txt.status === "fulfilled" ? txt.value.flat() : [],
                whois: whois.status === "fulfilled" ? {
                    registrar: whois.value.data.registrar,
                    created: whois.value.data.created,
                    expires: whois.value.data.expires,
                    updated: whois.value.data.changed
                } : null
            }
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            creator: "Rerezz",
            message: "Internal Server Error",
            error: error.message
        })
    }
})

module.exports = router