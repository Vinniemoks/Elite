// Guide Registration: Video recording, validation, and backend submission
(function() {
  const form = document.getElementById('guide-application-form');
  const successBanner = document.getElementById('success-banner');
  const startBtn = document.getElementById('startRecording');
  const stopBtn = document.getElementById('stopRecording');
  const statusEl = document.getElementById('recordStatus');
  const videoEl = document.getElementById('videoPreview');
  const videoFileInput = document.getElementById('videoFile');
  const resumeInput = document.getElementById('resume');

  let mediaStream = null;
  let recorder = null;
  let recordedChunks = [];
  let recordTimeout = null;
  let recordedBlob = null;

  function updateStatus(text) { statusEl.textContent = text; }

  async function startRecording() {
    try {
      recordedChunks = [];
      recordedBlob = null;
      updateStatus('Requesting camera & microphone...');
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoEl.srcObject = mediaStream;
      videoEl.muted = true;
      await videoEl.play();

      recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9,opus' });
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
      recorder.onstop = () => {
        recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(recordedBlob);
        videoEl.srcObject = null;
        videoEl.src = url;
        videoEl.muted = false;
        updateStatus('Recording complete. Preview available.');
        cleanupStream();
      };

      recorder.start();
      updateStatus('Recording... (auto-stops at 60s)');
      startBtn.disabled = true;
      stopBtn.disabled = false;

      recordTimeout = setTimeout(() => stopRecording(), 60_000);
    } catch (err) {
      console.error('Recording error:', err);
      updateStatus('Unable to start recording. Please allow camera & mic.');
    }
  }

  function stopRecording() {
    if (recordTimeout) { clearTimeout(recordTimeout); recordTimeout = null; }
    try {
      if (recorder && recorder.state !== 'inactive') { recorder.stop(); }
      startBtn.disabled = false;
      stopBtn.disabled = true;
      updateStatus('Stopping...');
    } catch (err) {
      console.error('Stop error:', err);
      updateStatus('Failed to stop recording.');
    }
  }

  function cleanupStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
  }

  function validateForm() {
    const requiredIds = ['fullName', 'email', 'bio'];
    for (const id of requiredIds) {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el && el.focus();
        alert('Please complete all required fields.');
        return false;
      }
    }
    if (!resumeInput.files || resumeInput.files.length === 0) {
      alert('Please upload your resume.');
      return false;
    }
    const resume = resumeInput.files[0];
    if (resume && resume.size > 5 * 1024 * 1024) {
      alert('Resume exceeds 5MB. Please upload a smaller file.');
      return false;
    }
    const agreeTalent = document.getElementById('agreeTalent');
    const agreePrivacy = document.getElementById('agreePrivacy');
    const consentBackground = document.getElementById('consentBackground');
    const certifyTruth = document.getElementById('certifyTruth');
    if (![agreeTalent, agreePrivacy, consentBackground, certifyTruth].every(cb => cb && cb.checked)) {
      alert('You must agree to the terms and privacy policy and required consents.');
      return false;
    }
    // Require either recorded video or uploaded file
    const hasUploadedVideo = videoFileInput.files && videoFileInput.files.length > 0;
    if (!recordedBlob && !hasUploadedVideo) {
      alert('Please record a video or upload one.');
      return false;
    }
    return true;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Applying requires an account: the application is tied to the user profile
    if (!window.EliteAPI || !EliteAPI.isLoggedIn()) {
      alert('Please create an account (or log in) first — your guide application is linked to your profile.');
      window.location.href = 'signup.html?redirect=become-guide.html';
      return;
    }

    const raw = new FormData(form);

    // Map form fields to the API's expected shape
    const fd = new FormData();
    fd.append('bio', raw.get('bio') || '');
    fd.append('region', raw.get('location') || '');
    fd.append('languages', raw.get('languages') || '');
    fd.append('yearsOfExperience', raw.get('experienceYears') || '0');
    fd.append(
      'socialLinks',
      JSON.stringify({
        phone: raw.get('phone') || null,
        socialEmails: raw.get('socialEmails') || null,
        facebook: raw.get('facebook') || null,
        instagram: raw.get('instagram') || null,
        twitter: raw.get('twitter') || null,
        tiktok: raw.get('tiktok') || null,
        youtube: raw.get('youtube') || null
      })
    );

    if (resumeInput.files[0]) {
      fd.append('resume', resumeInput.files[0]);
    }
    if (recordedBlob) {
      fd.append('video', recordedBlob, 'intro.webm');
    } else if (videoFileInput.files[0]) {
      fd.append('video', videoFileInput.files[0]);
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      await EliteAPI.applyAsGuide(fd);
      successBanner.textContent = 'Application submitted successfully. We will review and contact you.';
      successBanner.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      form.reset();
      recordedBlob = null;
      recordedChunks = [];
      videoEl.src = '';
    } catch (err) {
      console.error('Guide application failed:', err);
      successBanner.textContent = `Submission failed: ${err.message}`;
      successBanner.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  startBtn?.addEventListener('click', startRecording);
  stopBtn?.addEventListener('click', stopRecording);
  window.addEventListener('beforeunload', cleanupStream);
})();