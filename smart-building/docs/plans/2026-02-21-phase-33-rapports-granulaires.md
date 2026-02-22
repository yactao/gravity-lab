# Phase 33: Rapports Énergétiques Granulaires Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modify the reporting and analytics logic to generate energy reports by Site, integrate average temperature during active hours, and separate HVAC consumption from global energy.

**Architecture:** We will extend the backend API endpoints (`getGlobalEnergy`, `getReadings`) to accept an optional `siteId` parameter. We will seed specific "HVAC" energy sensors alongside global "Energy" sensors to allow consumption splitting. In the frontend, the Analytics page (`/energy/page.tsx`) will be updated to display this granular data, replacing the static mock data with API calls. Average temperature will be computed via a new backend endpoint fetching `temperature` readings during daytime (8h-19h) for a given site.

**Tech Stack:** NestJS, TypeORM, Next.js, Recharts, Tailwind CSS.

---

### Task 1: Backend - Add HVAC Sensors to Demo Seeder

**Files:**
- Modify: `backend/src/app.service.ts`

**Step 1: Write minimal implementation**
Modify `onModuleInit` in `app.service.ts` to also create an `hvac_energy` sensor alongside the main `energy` sensor for the demo sites.
```typescript
          const sEnergy = this.sensorRepo.create({ name: 'Compteur Général', type: 'energy', externalId: 's-ener-v4', zone: site.zones[0] });
          const sHvac = this.sensorRepo.create({ name: 'Climatisation/Chauffage', type: 'hvac_energy', externalId: 's-hvac-v4', zone: site.zones[0] });
          await this.sensorRepo.save([sEnergy, sHvac]);
```

**Step 2: Commit**
```bash
git add backend/src/app.service.ts
git commit -m "chore: add hvac sensor to demo data seeder"
```

---

### Task 2: Backend - API logic for reports by Site and HVAC separation

**Files:**
- Modify: `backend/src/app.service.ts`
- Modify: `backend/src/app.controller.ts`

**Step 1: Write minimal implementation**
1. In `app.controller.ts`, add `@Query('siteId') siteId?: string` to `getGlobalEnergy` method.
2. In `app.service.ts`, update `getGlobalEnergy(orgId?: string, siteId?: string)` to filter by `siteId` if provided. Modify the query to group results into `global` and `hvac` categories based on sensor type.
   
```typescript
    const where: any = { sensor: { type: In(['energy', 'hvac_energy']) } };
    if (siteId) {
      where.sensor.zone = { site: { id: siteId } };
    } else if (orgId) {
      where.sensor.zone = { site: { organization: { id: orgId } } };
    }
```
Sum the values separately: `powerGlobal` for `energy` and `powerHvac` for `hvac_energy`. Update the return format to include both.

**Step 2: Commit**
```bash
git add backend/src/app.service.ts backend/src/app.controller.ts
git commit -m "feat: backend API supports site filtering and hvac energy split"
```

---

### Task 3: Backend - API for average temperature during business hours

**Files:**
- Modify: `backend/src/app.service.ts`
- Modify: `backend/src/app.controller.ts`

**Step 1: Write minimal implementation**
1. Add generic active hours logic (e.g. 8:00 AM to 7:00 PM).
2. Create method `getAverageTemperature(orgId?: string, siteId?: string)` in `app.service.ts` fetching past 7 days of temperature readings, filtering by hour between 8 and 19, and grouping by local/zone.
3. Expose as `@Get('temperature/average')` in `app.controller.ts`.

**Step 2: Commit**
```bash
git add backend/src/app.service.ts backend/src/app.controller.ts
git commit -m "feat: endpoint for average temperature during business hours"
```

---

### Task 4: Frontend - Update Analytics Page (`/energy/page.tsx`)

**Files:**
- Modify: `frontend/src/app/energy/page.tsx`

**Step 1: Write minimal implementation**
Replace the static `consumptionVsTempData` and `distributionData` with dynamic fetching from `http://localhost:3001/api/energy/global?siteId=...` and `temperature/average`. Add a context-aware dropdown for selecting the Site (defaulting to "All sites" for the organization). Bind the Recharts `ComposedChart` and `PieChart` to the real state.

**Step 2: Commit**
```bash
git add frontend/src/app/energy/page.tsx
git commit -m "feat: bind frontend analytics page to real backend granular data"
```
