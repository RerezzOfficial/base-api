const express = require('express')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const qs = require('qs')
const crypto = require('crypto')
const owner = "Rerezz Ganteng"
const router = express.Router()

router.get('/', (req, res) => {
    res.json({
        status: true,
        code: 200,
        owner: owner,
        version: "1.0.0",
        message: "Endpoint API Download"
    })
})

async function wait(url) {
    while (true) {
        const r = await axios.get(url, {
            headers: { 'user-agent': 'CT Android/1.0.0' }
        })
        if (r.data.percent === 'Completed') return r.data
        await new Promise(resolve => setTimeout(resolve, 1500))
    }
}

async function tiktokDownloader(url) {
    const r = await axios.post(
        'https://tikdown.com/proxy.php',
        qs.stringify({ url }),
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
                referer: 'https://tikdown.com/en',
                'user-agent': 'Mozilla/5.0 Android'
            }
        }
    )

    const api = r.data.api

    const videoItem = api.mediaItems.find(i => i.type === 'Video')
    const audioItem = api.mediaItems.find(i => i.type === 'Music')
    const imageItems = api.mediaItems.filter(i => i.type === 'Image')

    const video = videoItem ? await wait(videoItem.mediaUrl) : null
    const audio = audioItem ? await wait(audioItem.mediaUrl) : null

    return {
        service: api.service,
        status: api.status,
        message: api.message,
        media: {
            id: api.id,
            title: api.title,
            description: api.description,
            createdTime: api.createdTime,
            permalink: api.permalink
        },
        user: {
            id: api.userInfo.userId,
            username: api.userInfo.username,
            name: api.userInfo.name,
            bio: api.userInfo.userBio,
            avatar: api.userInfo.userAvatar,
            verified: api.userInfo.isVerified,
            stats: api.userStats
        },
        stats: api.mediaStats,
        video: videoItem && video ? {
            processUrl: videoItem.mediaUrl,
            resolution: videoItem.mediaRes,
            quality: videoItem.mediaQuality,
            duration: videoItem.mediaDuration,
            format: videoItem.mediaExtension,
            fileName: video.fileName,
            fileSize: video.fileSize,
            downloadUrl: video.fileUrl
        } : null,
        audio: audioItem && audio ? {
            processUrl: audioItem.mediaUrl,
            quality: audioItem.mediaQuality,
            duration: audioItem.mediaDuration,
            format: audioItem.mediaExtension,
            fileName: audio.fileName,
            fileSize: audio.fileSize,
            downloadUrl: audio.fileUrl
        } : null,
        images: imageItems.map(i => ({
            id: i.mediaId,
            resolution: i.mediaRes,
            quality: i.mediaQuality,
            fileSize: i.mediaFileSize,
            downloadUrl: i.mediaUrl
        }))
    }
}

async function ytdownloader(url) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://app.ytdown.to',
        'Referer': 'https://app.ytdown.to/id2/',
        'X-Requested-With': 'XMLHttpRequest'
    }

    const step1 = await axios.post(
        'https://app.ytdown.to/proxy.php',
        new URLSearchParams({ url }).toString(),
        { headers }
    )

    const videoInfo = step1.data
    if (!videoInfo.api || videoInfo.api.status !== 'ok') throw new Error('Gagal mengambil info video')

    const { title, description, mediaItems, userInfo, mediaStats, permanentLink } = videoInfo.api
    const videos = mediaItems.filter(item => item.type === 'Video').slice(0, 1)
    const audios = mediaItems.filter(item => item.type === 'Audio').slice(0, 1)

    if (videos.length === 0) throw new Error('Video tidak tersedia')

    const bestVideo = videos[0]
    const bestAudio = audios.length > 0 ? audios[0] : null

    const downloadMedia = async (mediaUrl) => {
        const requestDownload = async () => {
            const r = await axios.post(
                'https://app.ytdown.to/proxy.php',
                new URLSearchParams({ url: mediaUrl }).toString(),
                { headers }
            )
            return r.data
        }

        let downloadStatus = await requestDownload()
        let attempts = 0

        while (
            downloadStatus.api &&
            (downloadStatus.api.status === 'queued' || !downloadStatus.api.fileUrl) &&
            attempts < 30
        ) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            downloadStatus = await requestDownload()
            attempts++
        }

        if (!downloadStatus.api || !downloadStatus.api.fileUrl) {
            throw new Error('Download timeout')
        }

        return {
            fileName: downloadStatus.api.fileName,
            fileSize: downloadStatus.api.fileSize,
            downloadUrl: downloadStatus.api.fileUrl
        }
    }

    const promises = [downloadMedia(bestVideo.mediaUrl)]
    if (bestAudio) promises.push(downloadMedia(bestAudio.mediaUrl))

    const results = await Promise.all(promises)
    const videoResult = results[0]
    const audioResult = results.length > 1 ? results[1] : null

    return {
        title,
        description,
        permanentLink,
        channel: {
            name: userInfo.name,
            username: userInfo.username,
            country: userInfo.accountCountry,
            joined: userInfo.dateJoined
        },
        stats: {
            videos: mediaStats.mediaCount,
            subscribers: mediaStats.followersCount,
            views: mediaStats.viewsCount
        },
        video: {
            quality: bestVideo.mediaQuality,
            resolution: bestVideo.mediaRes,
            duration: bestVideo.mediaDuration,
            fileName: videoResult.fileName,
            fileSize: videoResult.fileSize,
            downloadUrl: videoResult.downloadUrl
        },
        audio: audioResult ? {
            quality: bestAudio.mediaQuality,
            fileName: audioResult.fileName,
            fileSize: audioResult.fileSize,
            downloadUrl: audioResult.downloadUrl
        } : null
    }
}

router.get('/tiktok', async (req, res) => {
    try {
        const { url } = req.query

        if (!url) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: 'Rerezz',
                message: 'Url parameter is required'
            })
        }

        const result = await tiktokDownloader(url)

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

router.get('/ytdl', async (req, res) => {
    try {
        const { url } = req.query

        if (!url) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: 'Rerezz',
                message: 'Url parameter is required'
            })
        }

        const result = await ytdownloader(url)

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

module.exports = router