const APP_ID = '7b8e56c519e44522b08ba45c28bd7429'
const CHANNEL =  'main'
const TOKEN = '007eJxTYLj0Zn1ge76to+WybTaMqiuUp28WKb205VeEgsShIp6GxEMKDOZJFqmmZsmmhpapJiamRkZJBhZJiSamyUYWSSnmJkaWX1Y8Sm4IZGR4p5zIzMgAgSA+C0NuYmYeAwMAFw4fCg=='
let UID; 

const client = AgoraRTC.createClient({mode: 'rtc' , codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null)
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player =`<div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span class="user-name">${UID}</span></div>
    <div class="video-player" id="user-${UID}"></div> 
    </div>`
    document.getElementById('videoscontainer').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove();
        }
        player =`<div class="video-container" id="user-container-${user.uid}">
        <div class="username-wrapper"><span class="user-name">${UID}</span></div>
        <div class="video-player" id="user-${user.uid}"></div> 
        </div>`
        document.getElementById('videoscontainer').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType ==='audio'){
        user.audioTrack.play();
    }
}


let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    console.log('we dont talk anymore ')
    console.log(`user-container-${user.uid}`)
    document.querySelector(`#user-container-${user.uid}`).remove()

}

let leaveAndRemoveLocalStream = async () => {
    for(let i=0 ; localTracks.length>i;i++){
        localTracks[i].stop()
        localTracks[i].close()
    }


    await client.leave()
    window.open('/','_self')
}


let toggleCamera = async (e) => {
    if (localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
        console.log('mamad')

    }else{
        await localTracks[1].setMuted(true)
        console.log('mamad')
        e.target.style.backgroundColor = 'rgb(255,80,80,1)'

    }
}
let toggleVoice = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
        console.log('mamad')

    }else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255,80,80,1)'

    }
}

joinAndDisplayLocalStream()
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click',toggleCamera)
document.getElementById('mic-btn').addEventListener('click',toggleVoice)