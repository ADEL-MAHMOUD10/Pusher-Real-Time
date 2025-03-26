document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-upload');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressMessage = document.getElementById('progress-message');
    const progressPercentage = document.getElementById('progress-percentage');
    const fileSizeInfo = document.getElementById('file-size-info');
    const statusBadge = document.getElementById('status-badge');
    const result = document.getElementById('result');
    const transcriptionText = document.getElementById('transcription-text');
    const copyBtn = document.getElementById('copy-btn');

    // Initialize Pusher
    try {
        const pusher = new Pusher(PUSHER_CONFIG.key, {
            cluster: PUSHER_CONFIG.cluster,
            encrypted: true
        });

        // Subscribe to the upload channel
        const channel = pusher.subscribe('upload-channel');

        // Listen for progress updates
        channel.bind('progress-update', function(data) {
            updateProgress(data);
        });
    } catch (error) {
        console.error('Failed to initialize Pusher:', error);
    }

    function updateProgress(data) {
        if (data.progress_percentage !== undefined) {
            const percentage = data.progress_percentage;
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage.toFixed(1)}%`;
            
            // Update status badge
            if (percentage === 0) {
                statusBadge.textContent = "Error";
                statusBadge.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                statusBadge.style.color = "#fca5a5";
                statusBadge.style.borderColor = "rgba(239, 68, 68, 0.3)";
            } else if (percentage < 50) {
                statusBadge.textContent = "Uploading";
                statusBadge.style.backgroundColor = "rgba(99, 102, 241, 0.2)";
                statusBadge.style.color = "#a5b4fc";
                statusBadge.style.borderColor = "rgba(99, 102, 241, 0.3)";
            } else if (percentage < 100) {
                statusBadge.textContent = "Processing";
                statusBadge.style.backgroundColor = "rgba(37, 99, 235, 0.2)";
                statusBadge.style.color = "#93c5fd";
                statusBadge.style.borderColor = "rgba(37, 99, 235, 0.3)";
            } else {
                statusBadge.textContent = "Completed";
                statusBadge.style.backgroundColor = "rgba(22, 163, 74, 0.2)";
                statusBadge.style.color = "#86efac";
                statusBadge.style.borderColor = "rgba(22, 163, 74, 0.3)";
            }
            
            // Update sound wave animation based on progress
            updateSoundWaveAnimation(percentage);
        }
        
        if (data.prog_mes) {
            progressMessage.textContent = data.prog_mes;
            
            // Extract file size information from the message
            const mbMatch = data.prog_mes.match(/\(([\d.]+)MB\s*\/\s*([\d.]+)MB\)/);
            if (mbMatch) {
                const [_, uploaded, total] = mbMatch;
                fileSizeInfo.textContent = `Uploaded: ${uploaded}MB / Total: ${total}MB`;
            }
            
            // Add pulse animation during processing
            if (data.prog_mes.includes("Processing")) {
                progressMessage.classList.add("pulse-animation");
            } else {
                progressMessage.classList.remove("pulse-animation");
            }
        }
    }
    
    // Create floating particles
    const particlesContainer = document.getElementById('particles');
    function createParticles() {
        if (!particlesContainer) {
            return;
        }
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 2px and 8px
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Animation
            const duration = Math.random() * 60 + 30;
            particle.style.animation = `float ${duration}s linear infinite`;
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Apply animation with random parameters
            animateParticle(particle);
            
            particlesContainer.appendChild(particle);
        }
    }
    
    function animateParticle(particle) {
        const speedX = (Math.random() - 0.5) * 0.3;
        const speedY = (Math.random() - 0.5) * 0.3;
        
        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        
        function updatePosition() {
            posX += speedX;
            posY += speedY;
            
            // Boundary check and loop
            if (posX < 0) posX = 100;
            if (posX > 100) posX = 0;
            if (posY < 0) posY = 100;
            if (posY > 100) posY = 0;
            
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            
            requestAnimationFrame(updatePosition);
        }
        
        updatePosition();
    }
    
    // Function to update sound wave animation based on progress
    function updateSoundWaveAnimation(progress) {
        const soundWaveBars = document.querySelectorAll('.sound-wave-bar');
        if (soundWaveBars.length === 0) {
            return;
        }
        
        if (progress < 10) {
            // Almost not moving
            soundWaveBars.forEach(bar => {
                bar.style.animationDuration = '3s';
                bar.style.opacity = '0.3';
            });
        } else if (progress < 50) {
            // Slow movement
            soundWaveBars.forEach(bar => {
                bar.style.animationDuration = '1.5s';
                bar.style.opacity = '0.6';
            });
        } else if (progress < 90) {
            // Active movement
            soundWaveBars.forEach(bar => {
                bar.style.animationDuration = '0.8s';
                bar.style.opacity = '1';
            });
        } else {
            // Fast movement
            soundWaveBars.forEach(bar => {
                bar.style.animationDuration = '0.5s';
                bar.style.opacity = '1';
            });
        }
    }

    // Handle drag and drop with improved visual feedback
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-indigo-400');
            uploadArea.classList.add('bg-indigo-900/20');
            uploadArea.style.transform = 'scale(1.02)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-indigo-400');
            uploadArea.classList.remove('bg-indigo-900/20');
            uploadArea.style.transform = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-indigo-400');
            uploadArea.classList.remove('bg-indigo-900/20');
            uploadArea.style.transform = '';
            const files = e.dataTransfer.files;
            if (files.length) {
                handleFileUpload(files[0]);
            }
        });
    }

    // Handle file input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }
    
    // Handle copy button
    if (copyBtn && transcriptionText) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(transcriptionText.textContent)
                .then(() => {
                    copyBtn.textContent = "Copied!";
                    setTimeout(() => {
                        copyBtn.textContent = "Copy";
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });
    }

    async function handleFileUpload(file) {
        if (!file.type.startsWith('audio/')) {
            alert('Please upload an audio file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Show progress container
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }
        
        // Hide result container
        if (result) {
            result.classList.add('hidden');
        }
        
        // Disable upload area
        if (uploadArea) {
            uploadArea.classList.add('opacity-50', 'pointer-events-none');
        }
        
        // Reset progress indicators
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercentage) progressPercentage.textContent = '0%';
        if (progressMessage) progressMessage.textContent = 'Preparing upload...';
        
        if (statusBadge) {
            statusBadge.textContent = "Uploading";
            statusBadge.style.backgroundColor = "rgba(99, 102, 241, 0.2)";
            statusBadge.style.color = "#a5b4fc";
            statusBadge.style.borderColor = "rgba(99, 102, 241, 0.3)";
        }
        
        // Activate sound wave animation
        updateSoundWaveAnimation(5);
        
        // Display file info
        if (fileSizeInfo) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            fileSizeInfo.textContent = `File: ${file.name} (${fileSizeMB}MB)`;
        }

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                if (progressMessage) progressMessage.textContent = 'Transcription completed!';
                if (progressBar) progressBar.style.width = '100%';
                if (progressPercentage) progressPercentage.textContent = '100%';
                
                if (statusBadge) {
                    statusBadge.textContent = "Completed";
                    statusBadge.style.backgroundColor = "rgba(22, 163, 74, 0.2)";
                    statusBadge.style.color = "#86efac";
                    statusBadge.style.borderColor = "rgba(22, 163, 74, 0.3)";
                }
                
                // Update sound wave animation to completed state
                updateSoundWaveAnimation(100);
                
                // Show transcription result
                if (result) result.classList.remove('hidden');
                if (transcriptionText) transcriptionText.textContent = data.file_transcripe;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error during upload:', error);
            if (progressMessage) progressMessage.textContent = `Error: ${error.message}`;
            if (progressBar) progressBar.style.width = '0%';
            if (progressPercentage) progressPercentage.textContent = '0%';
            
            if (statusBadge) {
                statusBadge.textContent = "Error";
                statusBadge.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                statusBadge.style.color = "#fca5a5";
                statusBadge.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }
            
            // Update sound wave animation to error state
            updateSoundWaveAnimation(0);
        } finally {
            // Re-enable upload area
            if (uploadArea) {
                uploadArea.classList.remove('opacity-50', 'pointer-events-none');
            }
            
            if (progressMessage) {
                progressMessage.classList.remove("pulse-animation");
            }
        }
    }
    
    // Initialize particles on page load
    createParticles();
}); 