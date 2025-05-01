// Import the PhotoBooth class
import { photoBooth } from './camera.js';

// Music control
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicPlaying = false;

// Make functions globally accessible
window.toggleMusic = function() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        bgMusic.play();
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    isMusicPlaying = !isMusicPlaying;
};

window.goToGallery = function() {
    gsap.to("#mainPage", {
        duration: 0.5,
        opacity: 0,
        onComplete: function() {
            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('galleryPage').style.display = 'block';
            gsap.fromTo("#galleryPage", 
                { opacity: 0 },
                { duration: 0.5, opacity: 1 }
            );
            initCamera(); // Initialize camera when entering gallery
        }
    });
};

window.goToMain = function() {
    gsap.to("#galleryPage", {
        duration: 0.5,
        opacity: 0,
        onComplete: function() {
            document.getElementById('galleryPage').style.display = 'none';
            document.getElementById('mainPage').style.display = 'block';
            gsap.fromTo("#mainPage", 
                { opacity: 0 },
                { duration: 0.5, opacity: 1 }
            );
            stopCamera(); // Stop camera when leaving gallery
        }
    });
};

// Add click event to toggle button
musicToggle.addEventListener('click', window.toggleMusic);

// Start music automatically (but muted)
document.addEventListener('DOMContentLoaded', function() {
    bgMusic.volume = 0.5; // Set volume to 50%
    bgMusic.play();
    isMusicPlaying = true;
});

// Photo Booth functionality
let currentStream = null;
let facingMode = "user";

async function initCamera() {
    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('cameraFeed');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        currentStream = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        const video = document.getElementById('cameraFeed');
        video.srcObject = null;
        currentStream = null;
    }
}

function takePhoto() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'photo.jpeg';
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
}

function takePhoto() {
    const video = document.getElementById("cameraFeed");
    const compositeCanvas = document.createElement("canvas");
    const compositeCtx = compositeCanvas.getContext("2d");

    let isPortrait = video.videoHeight > video.videoWidth;
    compositeCanvas.width = isPortrait ? 720 : 1280;
    compositeCanvas.height = isPortrait ? 1280 : 720;

    const borderAspect = compositeCanvas.width / compositeCanvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;

    let sx, sy, sWidth, sHeight;

    if (videoAspect > borderAspect) {
        sHeight = video.videoHeight;
        sWidth = sHeight * borderAspect;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
    } else {
        sWidth = video.videoWidth;
        sHeight = sWidth / borderAspect;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
    }

    compositeCtx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, compositeCanvas.width, compositeCanvas.height);

    const borderImage = new Image();
    borderImage.src = isPortrait ? "border-portrait.png" : "border-landscape.png";
    borderImage.onload = function () {
        compositeCtx.drawImage(borderImage, 0, 0, compositeCanvas.width, compositeCanvas.height);

        const imageData = compositeCanvas.toDataURL("image/jpeg");

        // Send image data to the server
        fetch('/save-photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData })
        })
        .then(res => res.text())
        .then(msg => {
            console.log(msg);
            alert('Photo saved to server!');
        })
        .catch(err => {
            console.error('Upload error:', err);
        });
    };
}


function switchCamera() {
    facingMode = facingMode === "user" ? "environment" : "user";
    stopCamera();
    initCamera();
}

// Add event listeners for photo booth buttons
document.addEventListener('DOMContentLoaded', function() {
    const takePhotoBtn = document.querySelector('button[name="take_photo"]');
    const switchCamBtn = document.querySelector('button[name="switch_cam"]');
    
    takePhotoBtn.addEventListener('click', takePhoto);
    switchCamBtn.addEventListener('click', switchCamera);
});
