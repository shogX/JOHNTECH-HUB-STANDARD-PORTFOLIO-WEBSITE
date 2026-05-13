const API_BASE = 'http://localhost:5001';
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

// Image preview handling
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

imageFileInput.addEventListener('change', updateImagePreview);
imageUrlInput.addEventListener('input', updateImagePreview);

// Sidebar navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.getAttribute('href').substring(1);
    document.getElementById(target).scrollIntoView({ behavior: 'smooth' });
  });
});

// Logout (placeholder)
logoutBtn.addEventListener('click', () => {
  alert('Logout functionality not implemented yet.');
});

const loadJobs = async () => {
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
    const featuredJobs = jobs.filter(job => job.featured).length;
    const remainingActions = 0; // Placeholder

    if (jobCount) jobCount.textContent = `${totalJobs} project${totalJobs === 1 ? '' : 's'} found`;
    if (totalJobsEl) totalJobsEl.textContent = totalJobs;
    if (featuredJobsEl) featuredJobsEl.textContent = featuredJobs;
    if (remainingActionsEl) remainingActionsEl.textContent = remainingActions;

    if (!jobs.length) {
      jobsBody.innerHTML = '<tr><td colspan="6" class="empty-state">No projects yet. Add one with the form.</td></tr>';
      return;
    }

    jobsBody.innerHTML = jobs.map((job) => {
      const featured = job.featured ? 'Yes' : 'No';
      const image = job.image ? `<img src="${job.image}" alt="${job.title} image" class="job-image-thumb" />` : '<span style="color:#94a3b8;">No image</span>';
      return `
        <tr>
          <td>${job.title}</td>
          <td>${job.company || '-'}</td>
          <td>${image}</td>
          <td>${job.category || '-'}</td>
          <td><span class="status-pill">${featured}</span></td>
          <td class="job-actions">
            <button type="button" data-id="${job._id}" class="delete-btn">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!confirm('Delete this project?')) return;
        await deleteJob(id);
      });
    });
  } catch (error) {
    console.error(error);
    jobsBody.innerHTML = `<tr><td colspan="6" class="empty-state">Unable to load projects. ${error.message}</td></tr>`;
    if (jobCount) jobCount.textContent = 'Error loading projects';
  }
};

const deleteJob = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/jobs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
    await loadJobs();
  } catch (error) {
    alert('Could not delete project.');
    console.error(error);
  }
};

jobForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append('title', jobForm.title.value.trim());
  formData.append('company', jobForm.company.value.trim());
  formData.append('description', jobForm.description.value.trim());
  formData.append('category', jobForm.category.value);
  formData.append('link', jobForm.link.value.trim());
  formData.append('featured', jobForm.featured.checked);

  const file = imageFileInput.files[0];
  const url = imageUrlInput.value.trim();

  if (file) {
    formData.append('imageFile', file);
  } else if (url) {
    formData.append('imageUrl', url);
  }

  if (!formData.get('title') || !formData.get('description')) {
    alert('Please enter a title and description.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save project');
    }

    jobForm.reset();
    imagePreview.innerHTML = '<span class="preview-empty">Preview will appear here</span>';
    await loadJobs();
  } catch (error) {
    alert('Could not save project.');
    console.error(error);
  }
});

loadJobs();
