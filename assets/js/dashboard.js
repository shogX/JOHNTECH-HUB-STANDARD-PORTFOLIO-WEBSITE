const origin = typeof window !== 'undefined' && window.location && window.location.origin;
const isFile =
  !origin ||
  origin === 'null' ||
  (window.location && window.location.protocol === 'file:');
const API_BASE = window.API_BASE || (isFile ? 'http://localhost:5000' : origin);

const authHeaders = (json = false) => {
  const token = localStorage.getItem('cms_token');
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const authOverlay = () => document.getElementById('auth-overlay');
const showAuth = () => authOverlay()?.classList.remove('hidden');
const hideAuth = () => authOverlay()?.classList.add('hidden');

async function probeAuth() {
  const res = await fetch(`${API_BASE}/api/cms/analytics/summary`, { headers: authHeaders(false) });
  if (res.status === 401 && !localStorage.getItem('cms_token')) {
    showAuth();
    return false;
  }
  if (res.status === 401 && localStorage.getItem('cms_token')) {
    localStorage.removeItem('cms_token');
    showAuth();
    return false;
  }
  hideAuth();
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('dash-login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('dash-login-err');
      if (err) err.style.display = 'none';
      const email = document.getElementById('dash-email')?.value;
      const password = document.getElementById('dash-password')?.value;
      try {
        const r = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('cms_token', data.token);
        hideAuth();
        await loadJobs();
      } catch (ex) {
        if (err) {
          err.textContent = ex.message;
          err.style.display = 'block';
        }
      }
    });
  }
  await probeAuth();
});

const jobsBody = document.getElementById('jobs-body');
const jobCount = document.getElementById('job-count');
const totalJobsEl = document.getElementById('total-jobs');
const featuredJobsEl = document.getElementById('featured-jobs');
const remainingActionsEl = document.getElementById('remaining-actions');
const jobForm = document.getElementById('job-form');
const imageFileInput = document.getElementById('image-file');
const imageUrlInput = document.getElementById('image-url');
const imagePreview = document.getElementById('image-preview');
const logoutBtn = document.getElementById('logout-btn');
const editingJobIdInput = document.getElementById('editing-job-id');

const dashJobsSkeletonRows = (n = 7) =>
  Array.from({ length: n })
    .map(
      () => `
      <tr class="dash-skeleton-row" aria-hidden="true">
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:72%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:55%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:40px;width:56px;border-radius:8px;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:48%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:52%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:40%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:32%;"></div></td>
        <td><div class="dash-skeleton-line cms-skeleton" style="height:14px;width:64%;"></div></td>
      </tr>`
    )
    .join('');

const updateImagePreview = () => {
  const file = imageFileInput.files[0];
  const url = imageUrlInput.value.trim();

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  } else if (url) {
    imagePreview.innerHTML = `<img src="${url}" alt="Preview" />`;
  } else {
    imagePreview.innerHTML = '<span class="preview-empty">Preview will appear here</span>';
  }
};

if (imageFileInput) imageFileInput.addEventListener('change', updateImagePreview);
if (imageUrlInput) imageUrlInput.addEventListener('input', updateImagePreview);

document.querySelectorAll('.sidebar-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.getAttribute('href').substring(1);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('cms_token');
    showAuth();
    alert('Signed out.');
  });
}

const thumbUrl = (job) => {
  if (!job.image) return '<span style="color:#94a3b8;">No image</span>';
  const src = job.image.startsWith('/') ? `${API_BASE}${job.image}` : job.image;
  return `<img src="${src}" alt="${job.title} image" class="job-image-thumb" />`;
};

const wireJobRowDrag = () => {
  const tbody = document.getElementById('jobs-body');
  if (!tbody) return;
  let dragEl = null;
  tbody.querySelectorAll('tr').forEach((row) => {
    row.setAttribute('draggable', 'true');
    row.addEventListener('dragstart', () => {
      dragEl = row;
      row.style.opacity = '0.5';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
      dragEl = null;
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragEl || dragEl === row) return;
      const rect = row.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      if (offset < rect.height / 2) {
        tbody.insertBefore(dragEl, row);
      } else {
        tbody.insertBefore(dragEl, row.nextSibling);
      }
    });
  });
};

const persistJobOrder = async () => {
  const rows = [...document.querySelectorAll('#jobs-body tr')];
  const jobs = rows.map((tr, idx) => ({ id: tr.dataset.id, order: idx }));
  if (!jobs.length || !jobs[0].id) return;
  await fetch(`${API_BASE}/api/jobs/reorder`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify({ jobs }),
  });
};

window.saveJobOrder = async () => {
  try {
    await persistJobOrder();
    alert('Project order saved.');
    await loadJobs();
  } catch (e) {
    alert(e.message || 'Could not save order');
  }
};

const loadJobs = async () => {
  if (!(await probeAuth())) {
    if (jobsBody) jobsBody.innerHTML = '<tr><td colspan="8" class="empty-state">Sign in to manage projects.</td></tr>';
    return;
  }
  if (jobsBody) jobsBody.innerHTML = dashJobsSkeletonRows(7);
  if (jobCount) jobCount.textContent = 'Loading projects…';
  try {
    const response = await fetch(`${API_BASE}/api/jobs`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const jobs = await response.json();
    if (!Array.isArray(jobs)) {
      throw new Error('Unexpected response format from server.');
    }

    const totalJobs = jobs.length;
    const featuredJobs = jobs.filter((job) => job.featured).length;

    if (jobCount) jobCount.textContent = `${totalJobs} project${totalJobs === 1 ? '' : 's'} found`;
    if (totalJobsEl) totalJobsEl.textContent = totalJobs;
    if (featuredJobsEl) featuredJobsEl.textContent = featuredJobs;
    if (remainingActionsEl) remainingActionsEl.textContent = jobs.filter((j) => j.status === 'draft').length;

    if (!jobs.length) {
      jobsBody.innerHTML = '<tr><td colspan="8" class="empty-state">No projects yet. Add one with the form.</td></tr>';
      return;
    }

    jobsBody.innerHTML = jobs
      .map((job) => {
        const featured = job.featured ? 'Yes' : 'No';
        const status = job.status || 'published';
        const views = job.views ?? 0;
        return `
        <tr data-id="${job._id}" draggable="true">
          <td>${job.title}</td>
          <td>${job.company || '-'}</td>
          <td>${thumbUrl(job)}</td>
          <td>${job.category || '-'}</td>
          <td><span class="status-pill">${status}</span></td>
          <td><span class="status-pill">${featured}</span></td>
          <td>${views}</td>
          <td class="job-actions">
            <button type="button" data-id="${job._id}" class="edit-btn">Edit</button>
            <button type="button" data-id="${job._id}" class="delete-btn">Delete</button>
          </td>
        </tr>`;
      })
      .join('');

    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!confirm('Delete this project?')) return;
        await deleteJob(id);
      });
    });

    document.querySelectorAll('.edit-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const res = await fetch(`${API_BASE}/api/jobs/${id}`);
        if (!res.ok) return alert('Could not load project');
        const job = await res.json();
        if (editingJobIdInput) editingJobIdInput.value = job._id;
        jobForm.title.value = job.title || '';
        jobForm.company.value = job.company || '';
        jobForm.description.value = job.description || '';
        jobForm.category.value = job.category || 'Web Development';
        jobForm.link.value = job.link || '';
        jobForm.githubUrl.value = job.githubUrl || '';
        jobForm.liveUrl.value = job.liveUrl || '';
        jobForm.technologies.value = (job.technologies || []).join(', ');
        jobForm.status.value = job.status || 'published';
        jobForm.order.value = job.order ?? 0;
        jobForm.featured.checked = Boolean(job.featured);
        imageUrlInput.value = job.image && !job.image.startsWith('/uploads') ? job.image : '';
        updateImagePreview();
        document.getElementById('add-job')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    wireJobRowDrag();
  } catch (error) {
    console.error(error);
    jobsBody.innerHTML = `<tr><td colspan="8" class="empty-state">Unable to load projects. ${error.message}</td></tr>`;
    if (jobCount) jobCount.textContent = 'Error loading projects';
  }
};

const deleteJob = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    if (!response.ok) throw new Error('Delete failed');
    await loadJobs();
  } catch (error) {
    alert('Could not delete project.');
    console.error(error);
  }
};

if (jobForm) {
  jobForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', jobForm.title.value.trim());
    formData.append('company', jobForm.company.value.trim());
    formData.append('description', jobForm.description.value.trim());
    formData.append('category', jobForm.category.value);
    formData.append('link', jobForm.link.value.trim());
    formData.append('githubUrl', jobForm.githubUrl?.value?.trim() || '');
    formData.append('liveUrl', jobForm.liveUrl?.value?.trim() || '');
    formData.append('technologies', jobForm.technologies?.value || '');
    formData.append('status', jobForm.status?.value || 'published');
    formData.append('order', jobForm.order?.value || '0');
    formData.append('featured', jobForm.featured.checked);

    const file = imageFileInput.files[0];
    const url = imageUrlInput.value.trim();

    if (file) {
      formData.append('imageFile', file);
    } else if (url) {
      formData.append('imageUrl', url);
    }

    const galleryInput = document.getElementById('gallery-files');
    if (galleryInput && galleryInput.files) {
      [...galleryInput.files].forEach((f) => formData.append('galleryFiles', f));
    }

    if (!formData.get('title') || !formData.get('description')) {
      alert('Please enter a title and description.');
      return;
    }

    const editingId = editingJobIdInput?.value;
    const endpoint = editingId ? `${API_BASE}/api/jobs/${editingId}` : `${API_BASE}/api/jobs`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: authHeaders(false),
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to save project');
      }

      jobForm.reset();
      if (editingJobIdInput) editingJobIdInput.value = '';
      imagePreview.innerHTML = '<span class="preview-empty">Preview will appear here</span>';
      await loadJobs();
    } catch (error) {
      alert('Could not save project.');
      console.error(error);
    }
  });
}

window.clearJobEdit = () => {
  if (editingJobIdInput) editingJobIdInput.value = '';
  jobForm?.reset();
  imagePreview.innerHTML = '<span class="preview-empty">Preview will appear here</span>';
};

let charts = { skills: null, totals: null, views: null };

window.loadDashboardAnalytics = async () => {
  if (typeof Chart === 'undefined') return;
  if (!(await probeAuth())) return;
  try {
    const res = await fetch(`${API_BASE}/api/cms/analytics/summary`, { headers: authHeaders(false) });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('an-visits').textContent = data.portfolioVisits ?? 0;
    document.getElementById('an-projects').textContent = data.totalProjects ?? 0;
    document.getElementById('an-messages').textContent = data.totalMessages ?? 0;

    const sLabels = Object.keys(data.skillsByCategory || {});
    const sValues = sLabels.map((k) => data.skillsByCategory[k]);
    const ctxS = document.getElementById('chart-skills');
    if (ctxS) {
      charts.skills?.destroy();
      charts.skills = new Chart(ctxS, {
        type: 'doughnut',
        data: {
          labels: sLabels,
          datasets: [{ data: sValues, backgroundColor: ['#8b5cf6', '#ec4899', '#38bdf8', '#f97316'] }],
        },
        options: { plugins: { legend: { labels: { color: '#e2e8f0' } } } },
      });
    }

    const ctxT = document.getElementById('chart-totals');
    if (ctxT) {
      charts.totals?.destroy();
      charts.totals = new Chart(ctxT, {
        type: 'bar',
        data: {
          labels: ['Projects', 'Messages', 'Services', 'Skills'],
          datasets: [
            {
              label: 'Count',
              data: [data.totalProjects, data.totalMessages, data.totalServices, data.totalSkills],
              backgroundColor: ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'],
            },
          ],
        },
        options: {
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    const top = data.topProjects || [];
    const ctxV = document.getElementById('chart-views');
    if (ctxV) {
      charts.views?.destroy();
      charts.views = new Chart(ctxV, {
        type: 'line',
        data: {
          labels: top.map((p) => p.title),
          datasets: [{ label: 'Views', data: top.map((p) => p.views || 0), borderColor: '#a78bfa', tension: 0.25 }],
        },
        options: {
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          },
          plugins: { legend: { labels: { color: '#e2e8f0' } } },
        },
      });
    }
  } catch (e) {
    console.error(e);
  }
};

loadJobs();
