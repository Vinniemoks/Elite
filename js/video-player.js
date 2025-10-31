// Video Player Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find all video thumbnails with the video-thumbnail class
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    // Add click event listeners to each thumbnail
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-video-src');
            if (videoSrc) {
                openVideoModal(videoSrc);
            }
        });
    });
    
    // Close modal when clicking outside the video
    document.addEventListener('click', function(event) {
        const modal = document.querySelector('.video-modal');
        if (modal && !event.target.closest('.video-content') && !event.target.closest('.video-thumbnail')) {
            closeVideoModal();
        }
    });
});

// Function to open video modal
function openVideoModal(videoSrc) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    
    // Create video content container
    const videoContent = document.createElement('div');
    videoContent.className = 'video-content';
    
    // Create video element
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    
    // Create source element
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-video';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeVideoModal);
    
    // Assemble the modal
    video.appendChild(source);
    videoContent.appendChild(video);
    videoContent.appendChild(closeBtn);
    modal.appendChild(videoContent);
    
    // Add to document
    document.body.appendChild(modal);
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
}

// Function to close video modal
function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (modal) {
        // Stop video playback
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
        }
        
        // Remove modal
        modal.remove();
        
        // Restore scrolling
        document.body.style.overflow = '';
    }
}