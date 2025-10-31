// Guide Registration: Video recording, validation, and backend submission
(function() {
  const API_URL = window.GUIDE_API_URL || 'http://localhost:5000';
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

    const fd = new FormData(form);
    // Append recorded video if available
    if (recordedBlob) {
      fd.append('video', recordedBlob, 'intro.webm');
    }
    // Append uploaded video file otherwise (already part of fd via input)

    // Try backend submission; fallback to local simulation on failure
    try {
      const resp = await fetch(`${API_URL}/api/guides/apply`, { method: 'POST', body: fd });
      if (!resp.ok) {
        const msg = await safeError(resp);
        throw new Error(msg || `Server responded ${resp.status}`);
      }
      const data = await resp.json();
      successBanner.textContent = 'Application submitted successfully. We will review and contact you.';
      successBanner.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      form.reset();
      recordedBlob = null;
      recordedChunks = [];
      videoEl.src = '';
      alert('Thank you! Your application has been received.');
    } catch (err) {
      console.warn('Backend submission failed, falling back to local capture:', err);
      const payloadSummary = {
        fullName: fd.get('fullName'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        location: fd.get('location'),
        languages: fd.get('languages'),
        experienceYears: fd.get('experienceYears'),
        socialEmails: fd.get('socialEmails'),
        facebook: fd.get('facebook'),
        instagram: fd.get('instagram'),
        twitter: fd.get('twitter'),
        tiktok: fd.get('tiktok'),
        youtube: fd.get('youtube'),
        resumeFileName: (resumeInput.files[0] && resumeInput.files[0].name) || null,
        hasRecordedVideo: !!recordedBlob,
        uploadedVideoFileName: (videoFileInput.files[0] && videoFileInput.files[0].name) || null,
      };
      console.log('Guide application payload (local simulation):', payloadSummary);
      successBanner.textContent = 'Your application has been captured locally. Backend unavailable.';
      successBanner.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert('Backend is unavailable. We captured your application locally for now.');
    }
  });

  startBtn?.addEventListener('click', startRecording);
  stopBtn?.addEventListener('click', stopRecording);
  window.addEventListener('beforeunload', cleanupStream);

  async function safeError(resp) {
    try { const j = await resp.json(); return j && (j.error || j.message); } catch { return null; }
  }
})();