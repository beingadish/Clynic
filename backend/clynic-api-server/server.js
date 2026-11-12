const http = require("http");
const url = require("url");

const PORT = process.env.PORT || 4004;

// In-Memory Database with realistic Human & Veterinary Hospital data
const tenants = [
  {
    id: "tnt-apex-01",
    name: "Apex Multispecialty & Veterinary Hospital",
    slug: "apex-health",
    careMode: "HUMAN",
    planTier: "ENTERPRISE",
    status: "ACTIVE",
  },
];

const facilities = [
  {
    id: "fac-01",
    name: "Main Clinical & Surgical Pavilion",
    type: "HOSPITAL",
    address: "Block 4, Medical Enclave, Mumbai, MH 400001",
  },
  {
    id: "fac-02",
    name: "Apex Animal Care & Trauma Wing",
    type: "CLINIC",
    address: "North Tower, Annex 2, Mumbai, MH 400001",
  },
  {
    id: "fac-03",
    name: "Advanced Diagnostics & Imaging Center",
    type: "DIAGNOSTIC",
    address: "East Wing Ground Floor, Mumbai, MH 400001",
  },
];

const departments = [
  { id: "dep-01", name: "Cardiology & Interventional Care", code: "CARDIO" },
  { id: "dep-02", name: "Veterinary Surgery & Exotic Animals", code: "VET-SURG" },
  { id: "dep-03", name: "Orthopedics & Joint Reconstruction", code: "ORTHO" },
  { id: "dep-04", name: "Pediatrics & Neonatal Care", code: "PED" },
  { id: "dep-05", name: "Neurology & Stroke Unit", code: "NEURO" },
];

let patients = [
  {
    id: "pat-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    dateOfBirth: "1994-06-18",
    address: "402 Palm Heights, Powai, Mumbai",
    phone: "+91 98201 12345",
    subjectType: "HUMAN",
    registeredDate: "2026-01-15T09:30:00Z",
  },
  {
    id: "pat-102",
    name: "Bruno (Golden Retriever)",
    email: "rohan.verma@example.com",
    dateOfBirth: "2022-03-10",
    address: "12 Gulmohar Lane, Juhu, Mumbai",
    phone: "+91 98330 67890",
    subjectType: "ANIMAL",
    registeredDate: "2026-02-01T14:15:00Z",
  },
  {
    id: "pat-103",
    name: "Dr. Sunita Patel",
    email: "sunita.patel@example.com",
    dateOfBirth: "1988-11-24",
    address: "704 Sea Breeze, Bandra West, Mumbai",
    phone: "+91 98190 54321",
    subjectType: "HUMAN",
    registeredDate: "2026-02-20T11:00:00Z",
  },
  {
    id: "pat-104",
    name: "Milo (Persian Cat)",
    email: "ananya.iyer@example.com",
    dateOfBirth: "2023-07-05",
    address: "B-103 Green Acres, Thane West, Mumbai",
    phone: "+91 98450 99887",
    subjectType: "ANIMAL",
    registeredDate: "2026-03-10T16:45:00Z",
  },
  {
    id: "pat-105",
    name: "Vikramaditya Singhania",
    email: "vikram.singhania@example.com",
    dateOfBirth: "1976-09-02",
    address: "Penthouse 3, Worli Sea Face, Mumbai",
    phone: "+91 98211 44556",
    subjectType: "HUMAN",
    registeredDate: "2026-03-25T08:15:00Z",
  },
];

let appointments = [
  {
    id: "apt-201",
    patientId: "pat-101",
    practitionerId: "doc-01",
    departmentId: "dep-01",
    startTime: "2026-11-15T10:00:00.000Z",
    endTime: "2026-11-15T10:30:00.000Z",
    reason: "Echocardiogram & Post-Op Cardiac Evaluation",
    status: "CONFIRMED",
  },
  {
    id: "apt-202",
    patientId: "pat-102",
    practitionerId: "vet-01",
    departmentId: "dep-02",
    startTime: "2026-11-15T11:30:00.000Z",
    endTime: "2026-11-15T12:00:00.000Z",
    reason: "Orthopedic Gait Analysis & Canine Hip Dysplasia Screening",
    status: "BOOKED",
  },
  {
    id: "apt-203",
    patientId: "pat-103",
    practitionerId: "doc-01",
    departmentId: "dep-05",
    startTime: "2026-11-16T14:00:00.000Z",
    endTime: "2026-11-16T14:45:00.000Z",
    reason: "Neurological Follow-up & Contrast MRI Review",
    status: "CHECKED_IN",
  },
  {
    id: "apt-204",
    patientId: "pat-104",
    practitionerId: "vet-01",
    departmentId: "dep-02",
    startTime: "2026-11-16T15:30:00.000Z",
    endTime: "2026-11-16T16:00:00.000Z",
    reason: "Annual Feline Core Vaccination & Ultrasonic Dental Scale",
    status: "COMPLETED",
  },
];

const mockUser = {
  id: "usr-clynic-01",
  email: "doctor@apexhealth.org",
  fullName: "Dr. Aadarsh Pandey",
  tenantId: "tnt-apex-01",
  roles: ["TENANT_ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],
};

function parseBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Tenant-ID, X-Correlation-ID",
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || "/";

  // Normalize path (strip /api or /clynic-api prefix if present)
  pathname = pathname.replace(/^\/(?:clynic-api|api)/, "") || "/";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Tenant-ID, X-Correlation-ID",
      "Access-Control-Max-Age": "86400",
    });
    return res.end();
  }

  // --- Health Checks ---
  if (pathname === "/health" || pathname === "/actuator/health") {
    return sendJson(res, 200, {
      status: "UP",
      service: "clynic-api",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      tenantsCount: tenants.length,
      patientsCount: patients.length,
      appointmentsCount: appointments.length,
    });
  }

  // --- Auth endpoints ---
  if (pathname === "/auth/login" && req.method === "POST") {
    const body = await parseBody(req);
    const user = {
      ...mockUser,
      email: body.email || mockUser.email,
      fullName: body.email?.includes("admin") ? "Hospital Administrator" : "Dr. Aadarsh Pandey",
    };
    return sendJson(res, 200, {
      user,
      accessToken: "ey.clynic.mock.access.token." + Date.now(),
      refreshToken: "ey.clynic.mock.refresh.token." + Date.now(),
      tokenType: "Bearer",
    });
  }

  if (pathname === "/auth/register" && req.method === "POST") {
    const body = await parseBody(req);
    const newTenant = {
      id: "tnt-" + Date.now(),
      name: body.tenantName || "New Health Center",
      slug: body.tenantSlug || "new-health",
      careMode: body.careMode || "HUMAN",
      planTier: "STARTER",
      status: "ACTIVE",
    };
    tenants.push(newTenant);
    const user = {
      id: "usr-" + Date.now(),
      email: body.email,
      fullName: body.fullName || "Hospital Director",
      tenantId: newTenant.id,
      roles: ["TENANT_ADMIN", "DOCTOR"],
    };
    return sendJson(res, 200, {
      user,
      accessToken: "ey.clynic.mock.access.token." + Date.now(),
      refreshToken: "ey.clynic.mock.refresh.token." + Date.now(),
      tokenType: "Bearer",
    });
  }

  if (pathname === "/auth/me" && req.method === "GET") {
    return sendJson(res, 200, mockUser);
  }

  if (pathname === "/auth/refresh" && req.method === "POST") {
    return sendJson(res, 200, {
      accessToken: "ey.clynic.mock.access.token." + Date.now(),
      refreshToken: "ey.clynic.mock.refresh.token." + Date.now(),
      tokenType: "Bearer",
    });
  }

  // --- Tenants & Facilities & Departments ---
  const tenantMatch = pathname.match(/^\/tenants\/([^/]+)$/);
  if (tenantMatch && req.method === "GET") {
    const tenant = tenants.find((t) => t.id === tenantMatch[1] || t.slug === tenantMatch[1]) || tenants[0];
    return sendJson(res, 200, tenant);
  }

  const facilitiesMatch = pathname.match(/^\/tenants\/([^/]+)\/facilities$/);
  if (facilitiesMatch) {
    if (req.method === "GET") {
      return sendJson(res, 200, facilities);
    }
    if (req.method === "POST") {
      const body = await parseBody(req);
      const newFac = {
        id: "fac-" + (facilities.length + 1).toString().padStart(2, "0"),
        name: body.name || "New Facility",
        type: body.type || "CLINIC",
        address: body.address || "Medical District, Mumbai",
      };
      facilities.push(newFac);
      return sendJson(res, 201, newFac);
    }
  }

  const departmentsMatch = pathname.match(/^\/tenants\/([^/]+)\/departments$/);
  if (departmentsMatch) {
    if (req.method === "GET") {
      return sendJson(res, 200, departments);
    }
    if (req.method === "POST") {
      const body = await parseBody(req);
      const newDep = {
        id: "dep-" + (departments.length + 1).toString().padStart(2, "0"),
        name: body.name || "New Department",
        code: body.code || "DEPT",
      };
      departments.push(newDep);
      return sendJson(res, 201, newDep);
    }
  }

  // --- Patients ---
  if (pathname === "/patients" && req.method === "GET") {
    return sendJson(res, 200, patients);
  }

  if (pathname === "/patients" && req.method === "POST") {
    const body = await parseBody(req);
    const newPatient = {
      id: "pat-" + Date.now().toString().slice(-4),
      name: body.name,
      email: body.email,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      phone: body.phone,
      subjectType: body.subjectType || "HUMAN",
      registeredDate: new Date().toISOString(),
    };
    patients.unshift(newPatient);
    return sendJson(res, 201, newPatient);
  }

  const patientIdMatch = pathname.match(/^\/patients\/([^/]+)$/);
  if (patientIdMatch) {
    const id = patientIdMatch[1];
    if (req.method === "GET") {
      const patient = patients.find((p) => p.id === id);
      if (!patient) return sendJson(res, 404, { error: "Patient not found" });
      return sendJson(res, 200, patient);
    }
    if (req.method === "PUT") {
      const body = await parseBody(req);
      const idx = patients.findIndex((p) => p.id === id);
      if (idx === -1) return sendJson(res, 404, { error: "Patient not found" });
      patients[idx] = { ...patients[idx], ...body };
      return sendJson(res, 200, patients[idx]);
    }
    if (req.method === "DELETE") {
      patients = patients.filter((p) => p.id !== id);
      return sendJson(res, 204, {});
    }
  }

  // --- Appointments ---
  if (pathname === "/appointments" && req.method === "GET") {
    return sendJson(res, 200, appointments);
  }

  if (pathname === "/appointments" && req.method === "POST") {
    const body = await parseBody(req);
    const newApt = {
      id: "apt-" + Date.now().toString().slice(-4),
      patientId: body.patientId,
      practitionerId: body.practitionerId || "doc-01",
      departmentId: body.departmentId || "dep-01",
      startTime: body.startTime,
      endTime: body.endTime,
      reason: body.reason,
      status: "BOOKED",
    };
    appointments.unshift(newApt);
    return sendJson(res, 201, newApt);
  }

  const aptIdMatch = pathname.match(/^\/appointments\/([^/]+)$/);
  if (aptIdMatch) {
    const id = aptIdMatch[1];
    if (req.method === "GET") {
      const apt = appointments.find((a) => a.id === id);
      if (!apt) return sendJson(res, 404, { error: "Appointment not found" });
      return sendJson(res, 200, apt);
    }
    if (req.method === "PUT") {
      const body = await parseBody(req);
      const idx = appointments.findIndex((a) => a.id === id);
      if (idx === -1) return sendJson(res, 404, { error: "Appointment not found" });
      appointments[idx] = { ...appointments[idx], ...body };
      return sendJson(res, 200, appointments[idx]);
    }
    if (req.method === "DELETE") {
      appointments = appointments.filter((a) => a.id !== id);
      return sendJson(res, 204, {});
    }
  }

  // Fallback 404
  sendJson(res, 404, { error: "Route not found", path: pathname, method: req.method });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Clynic Gateway & API Service running on http://0.0.0.0:${PORT}`);
});
