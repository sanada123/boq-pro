/**
 * API Client — drop-in replacement for Base44 SDK.
 *
 * Exposes the same interface:
 *   api.auth.me(), .login(), .register(), .logout()
 *   api.entities.Project.create(), .filter(), .update(), .delete(), .bulkCreate()
 *   api.integrations.Core.InvokeLLM({ prompt, file_urls, response_json_schema })
 *   api.integrations.Core.UploadFile({ file })
 *   api.functions.invoke('processPdf', { file_url })
 */

const TOKEN_KEY = 'boqpro_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(error.error || 'Request failed');
    err.status = res.status;
    err.data = error;
    throw err;
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────

const auth = {
  async me() {
    return request('/auth/me');
  },

  async login(email, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(result.token);
    return result.user;
  },

  async register(email, username, password) {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password })
    });
    setToken(result.token);
    return result.user;
  },

  logout(redirectUrl) {
    clearToken();
    if (redirectUrl !== undefined) {
      window.location.href = '/Login';
    }
  },

  redirectToLogin(returnUrl) {
    window.location.href = '/Login';
  }
};

// ── Entity CRUD Factory ──────────────────────────

function createEntity(apiPath) {
  return {
    async filter(params = {}, sort) {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          query.set(key, value);
        }
      }
      if (sort) query.set('sort', sort);
      const qs = query.toString();
      return request(`${apiPath}${qs ? '?' + qs : ''}`);
    },

    async get(id) {
      return request(`${apiPath}/${id}`);
    },

    async create(data) {
      return request(apiPath, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async bulkCreate(items) {
      return request(`${apiPath}/bulk`, {
        method: 'POST',
        body: JSON.stringify(items)
      });
    },

    async update(id, data) {
      return request(`${apiPath}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    async delete(id) {
      return request(`${apiPath}/${id}`, {
        method: 'DELETE'
      });
    }
  };
}

// ── Entities ─────────────────────────────────────

const entities = {
  Project: createEntity('/projects'),
  PlanReading: createEntity('/plan-readings'),
  QuantityItem: createEntity('/quantity-items'),
  EngineerStandard: createEntity('/standards'),
  PriceItem: createEntity('/prices'),
  CalculationFormula: createEntity('/formulas'),
  EngineerProfile: createEntity('/profiles')
};

// ── Integrations ─────────────────────────────────

const integrations = {
  Core: {
    async InvokeLLM({ prompt, file_urls, response_json_schema }) {
      return request('/llm/invoke', {
        method: 'POST',
        body: JSON.stringify({ prompt, file_urls, response_json_schema })
      });
    },

    async UploadFile({ file }) {
      const formData = new FormData();
      formData.append('file', file);
      return request('/upload', {
        method: 'POST',
        body: formData
      });
    }
  }
};

// ── Functions ────────────────────────────────────

const functions = {
  async invoke(name, params) {
    if (name === 'processPdf') {
      const result = await request('/pdf/extract', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      // Wrap in { data: ... } to match Base44 function return format
      return { data: result };
    }
    throw new Error(`Unknown function: ${name}`);
  }
};

// ── Export ────────────────────────────────────────

export const api = {
  auth,
  entities,
  integrations,
  functions
};
