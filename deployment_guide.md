## 🚂 Railway Deployment (Quick Start)

I recommend Railway for this project because it handles monorepos perfectly.

### 1. Initialize Git (If needed)
Railway works best with GitHub. Run these in your project root:
```bash
git init
git add .
git commit -m "🚀 Complete production-ready SaaS platform"
# Create a private repo on GitHub and follow their "push existing repo" instructions
```

### 2. Install & Login
```bash
npm i -g @railway/cli
railway login
```

### 3. Create Services
In the [Railway Dashboard](https://railway.app/dashboard):
1. **New Project** -> **Deploy from GitHub**.
2. **First Service (API)**:
   - Name: `Antigravity API`
   - Root Directory: `./` (Keep as root)
   - Dockerfile Path: `apps/api/Dockerfile`
   - Custom Domain: e.g., `api.yourdomain.com`
3. **Second Service (Web)**:
   - Name: `Antigravity Web`
   - Root Directory: `./` (Keep as root)
   - Dockerfile Path: `apps/web/Dockerfile`
   - Custom Domain: e.g., `app.yourdomain.com`
   - **Env Var**: `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`

---

## 🚀 Step 1: Provision your Infrastructure

I recommend using **Railway** because it handles your Monorepo, Database, and Redis with a single configuration.

1.  **Create a New Project**: In Railway, select "Deploy from GitHub repo".
2.  **Add PostgreSQL**:
    -   Click "New" -> "Database" -> "Add PostgreSQL".
    -   Railway will automatically provide a `DATABASE_URL`.
3.  **Add Redis**:
    -   Click "New" -> "Database" -> "Add Redis".
    -   Railway will provide a `REDIS_URL`.

---

## 🔑 Step 2: Environment Variables

Configure these variables in your **API** and **WEB** service settings in Railway:

### API Service
| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-linked by Railway |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Auto-linked by Railway |
| `JWT_SECRET` | *(long-random-string)* | Critical for security |
| `CORS_ORIGIN` | `https://your-app-domain.com` | Your frontend URL |
| `NODE_ENV` | `production` | Enables production optimizations |

### Web Service
| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-api-domain.com` | Public URL of your API |

---

## 📦 Step 3: Deployment Strategy & Docker

Antigravity is pre-configured with **Dockerfiles** for high-efficiency builds.

-   **API**: Point Railway to `/apps/api/Dockerfile`.
-   **Web**: Point Railway to `/apps/web/Dockerfile`.

> [!TIP]
> Next.js is configured in `standalone` mode, which means your production container will be minimal in size and extremely fast to boot.

---

## 🧪 Step 4: Final Verification

Once the build logs show "Successfully deployed":

1.  **Database Migration**:
    -   Connect to your API container's shell.
    -   Run: `npx prisma migrate deploy` to apply your schema to the production DB.
2.  **Seed Data (Optional)**:
    -   If you want to start with the demo data, run: `npm run seed`.
3.  **Check Health**:
    -   Visit `https://your-api-domain.com/health`.
    -   You should see `{"status": "ok", "db": "up", "redis": "up"}`.

---

## 🌐 Step 5: Domain & SSL

1.  In Railway/Vercel settings, go to **Domains**.
2.  Add your custom domain (e.g., `app.antigravity.travel`).
3.  Railway/Vercel will provide CNAME records to add to your DNS provider (GoDaddy, Namecheap, etc.).
4.  SSL (HTTPS) will be provisioned **automatically**.

---

## 🛡 Security Checklist

-   [ ] **JWT Secrets**: Ensure they are unique and long.
-   [ ] **Database Access**: Never expose your `DATABASE_URL` publicly.
-   [ ] **Rate Limiting**: The API is pre-hardened to allow 150 requests per minute per IP.
-   [ ] **Metadata**: Your OpenGraph tags are set up in `layout.tsx` for premium link previews.

---

**You are now ready to launch! 🚀**
Contact me if you run into any specific cloud provider hurdles.
