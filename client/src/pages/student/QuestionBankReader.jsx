import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';
import {
  FaBookOpen,
  FaBriefcase,
  FaCode,
  FaBuilding,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaLightbulb,
  FaSpinner,
  FaStar,
  FaFolderOpen,
  FaPlusCircle,
  FaDownload,
  FaBookmark,
  FaHistory
} from 'react-icons/fa';

// Helper: Generate storage key for a Target Job
const getStorageKey = (job) => {
  const jobKey = job?._id || job?.id || job?.target_job_role || 'default_job';
  return `qb_progress_${jobKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

// Helper: Save progress & download checkpoint to localStorage
const saveProgressToStorage = (job, readIdx, downloadedIdx) => {
  if (!job) return;
  try {
    const key = getStorageKey(job);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    const data = {
      lastReadIndex: readIdx !== undefined ? readIdx : (existing.lastReadIndex || 0),
      lastDownloadedIndex: downloadedIdx !== undefined ? downloadedIdx : (existing.lastDownloadedIndex !== undefined ? existing.lastDownloadedIndex : -1),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save question bank progress:', err);
  }
};

// Helper: Load progress from localStorage
const loadProgressFromStorage = (job) => {
  if (!job) return null;
  try {
    const key = getStorageKey(job);
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.error('Failed to load question bank progress:', err);
  }
  return null;
};

// Helper: Generate Professional PDF Document for Checkpoint Range
const generateProfessionalPDF = (job, batchQuestions, startQNum, endQNum) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const roleTitle = job.target_job_role || job.targetJobRole || job.jobRole || job.title || 'Target Job';
  const companyName = job.target_company || job.targetCompany || job.companyName || job.company || 'Target Company';
  const skillsArr = job.required_skills || job.requiredSkills || job.skills || [];
  const skillsText = skillsArr.length > 0 ? skillsArr.join(', ') : 'Core Industry Skills';

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  // Helper: Draw Header & Footer on each page
  const addHeaderFooter = () => {
    // Top accent border line
    doc.setDrawColor(79, 70, 229); // #4F46E5
    doc.setLineWidth(0.8);
    doc.line(margin, 8, pageWidth - margin, 8);

    // Bottom footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // #9CA3AF
    doc.text('HireSmart AI • Target Job Question Bank Study Guide', margin, pageHeight - 7);
    const totalPages = doc.internal.getNumberOfPages();
    doc.text(`Page ${totalPages}`, pageWidth - margin - 12, pageHeight - 7);
  };

  // Helper: Check Page Break before rendering content block
  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      doc.addPage();
      y = margin + 4;
      addHeaderFooter();
    }
  };

  // --- 1. COVER / TITLE BANNER ---
  doc.setFillColor(30, 27, 75); // #1E1B4B (Dark Indigo)
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('HIRESMART AI • QUESTION BANK', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // #C7D2FE
  doc.text('Curated Interview Study Guide with Detailed Answers & Explanations', margin + 6, y + 18);

  y += 31;

  // --- 2. TARGET JOB METADATA CARD ---
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); // #4F46E5
  doc.text('TARGET JOB & CHECKPOINT METADATA', margin + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(31, 41, 55); // #1F2937
  doc.text('Target Job / Role:', margin + 5, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(roleTitle, margin + 36, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Target Company:', margin + 5, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(companyName, margin + 36, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Required Skills:', margin + 5, y + 26);
  doc.setFont('helvetica', 'normal');
  const wrappedSkills = doc.splitTextToSize(skillsText, contentWidth - 45);
  doc.text(wrappedSkills[0] || skillsText, margin + 36, y + 26);

  // Checkpoint badge on right side
  doc.setFillColor(236, 253, 245); // #ECFDF5
  doc.setDrawColor(167, 243, 208); // #A7F3D0
  doc.roundedRect(pageWidth - margin - 62, y + 6, 57, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text(`CHECKPOINT RANGE`, pageWidth - margin - 58, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Questions ${startQNum}–${endQNum}`, pageWidth - margin - 58, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Total: ${batchQuestions.length} Q&As`, pageWidth - margin - 58, y + 22);

  y += 40;

  addHeaderFooter();

  // --- 3. QUESTIONS LIST ---
  batchQuestions.forEach((q) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const qLines = doc.splitTextToSize(`Q${q.id}. ${q.question}`, contentWidth - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const ansLines = doc.splitTextToSize(q.answer, contentWidth - 12);

    const estBlockHeight = 14 + (qLines.length * 4.5) + (ansLines.length * 4) + 14;
    checkPageBreak(estBlockHeight);

    // Question Section Banner Pill
    doc.setFillColor(238, 242, 255); // #EEF2FF
    doc.setDrawColor(199, 210, 254); // #C7D2FE
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`QUESTION ${q.id} • ${q.category || 'TECHNICAL'} (${q.difficulty || 'Intermediate'})`, margin + 4, y + 4.8);

    y += 10;

    // Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39); // #111827
    doc.text(qLines, margin + 2, y);
    y += (qLines.length * 4.8) + 3;

    // Answer Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text('Detailed Answer & Explanation:', margin + 2, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81); // #374151
    doc.text(ansLines, margin + 4, y);
    y += (ansLines.length * 4.1) + 4;

    // Key Takeaways (if present)
    if (q.keyTakeaways && q.keyTakeaways.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105); // #059669
      doc.text('Key Technical Takeaways:', margin + 2, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99);
      q.keyTakeaways.forEach((pt) => {
        const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 10);
        checkPageBreak(ptLines.length * 3.8);
        doc.text(ptLines, margin + 4, y);
        y += (ptLines.length * 3.8);
      });
      y += 2;
    }

    // Pro Tip Box (if present)
    if (q.tip) {
      const tipLines = doc.splitTextToSize(`Pro Tip for ${companyName}: ${q.tip}`, contentWidth - 12);
      checkPageBreak((tipLines.length * 3.8) + 4);

      doc.setFillColor(255, 251, 235); // #FFFBEB
      doc.setDrawColor(253, 230, 138); // #FDE68A
      doc.setLineWidth(0.3);
      doc.roundedRect(margin + 2, y, contentWidth - 4, (tipLines.length * 3.8) + 4, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9); // #B45309
      doc.text(tipLines, margin + 5, y + 4);
      y += (tipLines.length * 3.8) + 7;
    }

    // Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  });

  // Trigger PDF file download
  const safeRole = roleTitle.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeRole}_QuestionBank_Q${startQNum}-Q${endQNum}.pdf`);
};

// Generate 100 curated questions & answers dynamically using the selected Target Job (Role, Required Skills, Company, & Job Description)
const generate100TargetJobQuestions = (job) => {
  const role = job.target_job_role || job.targetJobRole || job.jobRole || job.title || 'Software Engineer';
  const company = job.target_company || job.targetCompany || job.companyName || job.company || 'Top Target Company';
  const skillsArr = job.required_skills || job.requiredSkills || job.skills || [];
  const primarySkill = skillsArr[0] || 'Core Technical Architecture';
  const secondarySkill = skillsArr[1] || skillsArr[0] || 'System Performance';
  const skillsText = skillsArr.length > 0 ? skillsArr.join(', ') : 'Core Technical Skills';
  const jobDesc = job.job_description || job.jobDescription || job.description || '';
  const descSnippet = jobDesc ? jobDesc.substring(0, 140) : `${role} responsibilities, technical deliverables, and domain specifications`;

  const categories = [
    {
      name: 'ROLE & ARCHITECTURE',
      questions: [
        {
          q: `What are the core technical expectations and architectural standards for a ${role} position at ${company}?`,
          diff: 'Intermediate',
          ans: `Candidates evaluating for a ${role} position at ${company} are assessed on software engineering fundamentals, modular code design, and hands-on mastery in ${skillsText}. Evaluators prioritize clear problem-solving methodologies and scalable system design aligned with role deliverables: "${descSnippet}".`,
          takeaways: [`Master core principles of ${primarySkill}.`, 'Demonstrate structured thinking and clean code architecture.', 'Explain practical trade-offs in enterprise production deployments.'],
          tip: `Research ${company}'s engineering culture, product architecture, and tech stack before your technical interviews.`
        },
        {
          q: `How does a ${role} design systems to handle high concurrency and throughput at ${company}?`,
          diff: 'Advanced',
          ans: `Handling high concurrency requires stateless service instances, asynchronous processing pipelines, non-blocking I/O, load balancing across availability zones, and optimized database indexing.`,
          takeaways: ['Use asynchronous processing for non-blocking execution.', 'Distribute load across multi-region instances.', 'Implement connection pooling and aggressive caching.'],
          tip: `Discuss real-world throughput metrics (e.g. TPS, latency bounds) when answering for ${company}.`
        },
        {
          q: `What architectural patterns best suit enterprise applications built with ${skillsText}?`,
          diff: 'Advanced',
          ans: `Enterprise systems benefit from Microservices, Event-Driven Architecture (EDA), Domain-Driven Design (DDD), and Layered Architecture. Decoupling domain logic ensures independent service deployability.`,
          takeaways: ['Apply Domain-Driven Design to isolate core business rules.', 'Use event buses for loose coupling.', 'Maintain clear API contracts between sub-domains.'],
          tip: 'Explain trade-offs between monolithic simplicity and microservice operational overhead.'
        },
        {
          q: `How do you ensure long-term maintainability and technical debt reduction as a ${role}?`,
          diff: 'Intermediate',
          ans: `Managing technical debt involves enforcing static analysis linting, routine code reviews, continuous refactoring, automated testing, and establishing clear architecture decision records (ADRs).`,
          takeaways: ['Document architectural decisions using ADRs.', 'Integrate static analysis gates in CI/CD.', 'Allocate dedicated sprint capacity for refactoring.'],
          tip: 'Share concrete examples of legacy code refactoring from past engineering experiences.'
        },
        {
          q: `How would you evaluate build vs. buy decisions for core infrastructure components at ${company}?`,
          diff: 'Intermediate',
          ans: `Evaluate based on core competency alignment, total cost of ownership (TCO), maintenance overhead, security compliance, and required customizability. Custom solutions are reserved for unique competitive advantages.`,
          takeaways: ['Prioritize off-the-shelf solutions for commodity utilities.', 'Calculate long-term maintenance & operational costs.', 'Ensure third-party vendor SLA compliance.'],
          tip: `Demonstrate business acumen alongside technical expertise for ${company}.`
        },
        {
          q: `What key metrics indicate a successful software architecture for ${role} projects?`,
          diff: 'Intermediate',
          ans: `Key metrics include MTTR (Mean Time to Recovery), deployment frequency, change failure rate, P99 response latency, code test coverage, and infrastructure cost efficiency.`,
          takeaways: ['Monitor DORA metrics for engineering efficiency.', 'Track P95/P99 latency benchmarks.', 'Maintain zero-downtime deployment capabilities.'],
          tip: 'Mention continuous observability tools like Prometheus, Grafana, or Datadog.'
        },
        {
          q: `How do you handle breaking changes in legacy dependencies for ${skillsText}?`,
          diff: 'Advanced',
          ans: `Handling breaking changes requires adapter/facade wrapper patterns, feature flags for gradual rollouts, comprehensive regression testing, and phased migration pathways.`,
          takeaways: ['Isolate external dependency APIs using adapter interfaces.', 'Leverage feature flags for safe canary deployments.', 'Maintain automated backward compatibility tests.'],
          tip: 'Discuss risk mitigation strategies when upgrading core framework dependencies.'
        },
        {
          q: `What is the role of continuous refactoring in high-velocity engineering teams?`,
          diff: 'Intermediate',
          ans: `Refactoring improves code readability, reduces bug density, and accelerates feature velocity without altering external behavior. It should be an ongoing hygiene practice rather than a separate phase.`,
          takeaways: ['Refactor in small, verifiable increments.', 'Ensure comprehensive unit test coverage before refactoring.', 'Keep pull requests focused and manageable.'],
          tip: 'Reference the "Boy Scout Rule" (leave the code cleaner than you found it).'
        },
        {
          q: `How do you approach technological evaluation and adopting new frameworks for ${role}?`,
          diff: 'Intermediate',
          ans: `Technological evaluation involves prototyping proof-of-concepts (PoCs), benchmarking performance, analyzing community support & license governance, and calculating team onboarding velocity.`,
          takeaways: ['Build focused PoCs before full adoption.', 'Assess long-term open-source community health.', 'Consider team learning curve and ecosystem compatibility.'],
          tip: 'Show pragmatism over chasing hyped trends.'
        },
        {
          q: `How do you align technical engineering goals with overall business strategy at ${company}?`,
          diff: 'Advanced',
          ans: `Aligning technical goals requires mapping technical initiatives directly to business KPIs (e.g., user retention, system availability, conversion latency), transparent roadmap communication, and cross-functional collaboration.`,
          takeaways: ['Translate technical metrics into business impact.', 'Involve product managers early in architectural planning.', 'Prioritize user-centric performance optimizations.'],
          tip: `Align your answer directly with ${company}'s product vision and market positioning.`
        }
      ]
    },
    {
      name: 'SKILLS & PERFORMANCE',
      questions: [
        {
          q: `How do you optimize runtime performance and memory footprint when using ${primarySkill}?`,
          diff: 'Advanced',
          ans: `Optimization requires profiling CPU and memory usage, identifying memory leaks, minimizing heavy object allocation, leveraging async primitives, and tuning runtime garbage collection parameters.`,
          takeaways: [`Profile before optimizing ${primarySkill} routines.`, 'Minimize object creation in hot loops.', 'Analyze memory heap dumps to pinpoint retention leaks.'],
          tip: 'Name specific profiling tools relevant to your technical stack.'
        },
        {
          q: `What are the deep internal mechanics of ${primarySkill} that every senior ${role} must master?`,
          diff: 'Advanced',
          ans: `Deep mechanics include memory layout allocation, thread execution loop scheduling, event queue dispatching, immutability guarantees, and runtime engine optimizations.`,
          takeaways: ['Understand execution stack vs. heap allocation.', 'Master asynchronous event loop mechanics.', 'Leverage built-in engine optimization hints.'],
          tip: 'Walk through an execution sequence step-by-step.'
        },
        {
          q: `How do you handle state synchronization across asynchronous operations involving ${secondarySkill}?`,
          diff: 'Intermediate',
          ans: `State synchronization utilizes atomic operations, mutex/semaphore locks, reactive streams, or immutable state updates to prevent race conditions and non-deterministic behavior.`,
          takeaways: ['Prefer immutable state updates for predictability.', 'Use atomic primitives for thread-safe operations.', 'Handle promise rejection and error boundaries cleanly.'],
          tip: 'Explain how race conditions are prevented in multi-threaded or async environments.'
        },
        {
          q: `What performance bottlenecks commonly occur in ${skillsText} implementations and how do you resolve them?`,
          diff: 'Intermediate',
          ans: `Common bottlenecks include N+1 queries, unindexed lookups, excessive payload serialization, synchronous blockings, and un-debounced event listeners.`,
          takeaways: ['Eliminate N+1 database/API roundtrips.', 'Implement intelligent pagination and lazy loading.', 'Optimize serialization format payloads.'],
          tip: 'Provide a concrete problem-solution-result narrative.'
        },
        {
          q: `How do you implement effective client-side or server-side caching using ${primarySkill}?`,
          diff: 'Intermediate',
          ans: `Caching strategies involve choosing appropriate eviction policies (LRU, LFU), setting TTL bounds, handling cache invalidation triggers, and preventing cache stampedes using mutex locks.`,
          takeaways: ['Cache invalidation is critical—define strict TTLs.', 'Use Redis/Memcached for distributed application caching.', 'Implement stale-while-revalidate headers for responsive UX.'],
          tip: 'Explain the difference between write-through, write-around, and cache-aside patterns.'
        },
        {
          q: `How do you optimize resource utilization in serverless or micro-container environments for ${role}?`,
          diff: 'Intermediate',
          ans: `Optimization focuses on cold-start mitigation, bundle size reduction, lean runtime base images, efficient connection reuse, and minimal memory allocation profiles.`,
          takeaways: ['Tree-shake and bundle code to minimize cold starts.', 'Reuse global database connections across function invocations.', 'Right-size memory allocation based on load benchmarks.'],
          tip: 'Mention cloud-native tooling (e.g. AWS Lambda, Docker, Kubernetes).'
        },
        {
          q: `Explain how to prevent memory leaks in long-running applications using ${skillsText}.`,
          diff: 'Advanced',
          ans: `Prevent leaks by clearing event listeners, nullifying unused references, avoiding global variables, closing unmanaged sockets/streams, and running automated leak detection tools.`,
          takeaways: ['Unsubscribe from subscriptions and listeners upon teardown.', 'Avoid static or global reference accumulation.', 'Analyze heap snapshots periodically.'],
          tip: 'Detail how you identified and resolved a memory leak in production.'
        },
        {
          q: `What are the trade-offs between synchronous execution and asynchronous event-driven models in ${primarySkill}?`,
          diff: 'Intermediate',
          ans: `Synchronous execution offers simpler debugging and deterministic flow but blocks threads. Asynchronous models offer high throughput and concurrency but introduce complex error handling and traceability.`,
          takeaways: ['Use sync for straightforward CPU-bound atomic tasks.', 'Use async for I/O-bound operations and external integrations.', 'Implement distributed tracing for async debugging.'],
          tip: 'Highlight when async complexity is justified by concurrency demands.'
        },
        {
          q: `How do you conduct stress testing and load generation for applications using ${skillsText}?`,
          diff: 'Intermediate',
          ans: `Stress testing involves generating realistic user traffic scenarios using tools like k6, JMeter, or Locust to identify breaking points, bottleneck thresholds, and resource exhaustion limits.`,
          takeaways: ['Simulate realistic user behavior patterns.', 'Identify degrading metrics under peak load.', 'Establish auto-scaling threshold triggers.'],
          tip: 'Quantify baseline load limits versus target throughput requirements.'
        },
        {
          q: `What modern features of ${primarySkill} significantly improve developer productivity and code efficiency?`,
          diff: 'Basic',
          ans: `Modern language features include native async/await patterns, pattern matching, optional chaining, modular package imports, static typing extensions, and performance-tuned standard libraries.`,
          takeaways: ['Leverage modern language syntax for cleaner code.', 'Adopt static typing to catch errors at compile time.', 'Use built-in standard library utilities over custom hacks.'],
          tip: 'Stay updated with the latest ECMAScript / language standard releases.'
        }
      ]
    },
    {
      name: 'SYSTEM DESIGN & SCALABILITY',
      questions: [
        {
          q: `How would you design a highly scalable, fault-tolerant service for ${company}?`,
          diff: 'Advanced',
          ans: `A scalable service at ${company} incorporates API gateways, stateless microservices, distributed caching (Redis), message queues (Kafka/RabbitMQ), auto-scaling groups, and database sharding.`,
          takeaways: ['Separate read and write paths using CQRS.', 'Implement circuit breakers for downstream failure isolation.', 'Ensure multi-region active-active or active-passive failover.'],
          tip: 'Draw a high-level block diagram starting from client DNS down to persistence.'
        },
        {
          q: `How do you implement rate limiting and throttling to protect services at ${company}?`,
          diff: 'Intermediate',
          ans: `Rate limiting utilizes algorithms like Token Bucket, Leaky Bucket, or Sliding Window Log implemented at the API Gateway or Redis tier to prevent DDoS attacks and fair usage abuse.`,
          takeaways: ['Use Token Bucket for bursting tolerance.', 'Return standard HTTP 429 Too Many Requests responses.', 'Include rate-limit reset headers in API responses.'],
          tip: 'Explain the pros/cons of distributed rate limiting vs. local instance limiting.'
        },
        {
          q: `What strategies ensure high availability (HA) and disaster recovery (DR) for ${role} workloads?`,
          diff: 'Advanced',
          ans: `HA/DR strategies require multi-AZ deployment, automated database replication, low RPO (Recovery Point Objective) backups, low RTO (Recovery Time Objective) failovers, and chaos engineering.`,
          takeaways: ['Define explicit RPO and RTO SLA goals.', 'Automate failover DNS switching.', 'Conduct regular chaos engineering drills to test resilience.'],
          tip: 'Reference cloud infrastructure primitives (e.g. AWS Multi-AZ, Route 53 failover).'
        },
        {
          q: `How do you handle data consistency across microservices in distributed environments?`,
          diff: 'Advanced',
          ans: `Distributed data consistency relies on Eventual Consistency, the Saga Pattern (Choreography/Orchestration), 2-Phase Commit (2PC) where strictly required, and idempotent message processing.`,
          takeaways: ['Favor eventual consistency using the Saga pattern.', 'Ensure all event consumers are idempotent.', 'Implement dead-letter queues (DLQ) for failed events.'],
          tip: 'Explain why ACID transactions across microservices are anti-patterns.'
        },
        {
          q: `How would you design a real-time notification or telemetry streaming system for ${company}?`,
          diff: 'Advanced',
          ans: `Real-time notification systems combine WebSockets / Server-Sent Events (SSE) for client connections, backed by a pub/sub message broker (Redis Pub/Sub or Kafka) for broadcasting events horizontally.`,
          takeaways: ['Use WebSockets for bi-directional communication, SSE for mono-directional.', 'Maintain persistent connection state in a distributed cache.', 'Handle heartbeat pings and auto-reconnection gracefully.'],
          tip: 'Detail how to handle millions of concurrent persistent WebSocket connections.'
        },
        {
          q: `What is Content Delivery Network (CDN) edge computing and how does a ${role} leverage it?`,
          diff: 'Intermediate',
          ans: `CDNs cache static assets and execute lightweight serverless functions at edge locations worldwide, drastically reducing latency by serving requests physically closer to users.`,
          takeaways: ['Configure optimal Cache-Control HTTP headers.', 'Execute authentication or geo-routing at the edge.', 'Minimize origin server traffic loads.'],
          tip: 'Mention Cloudflare Workers, AWS CloudFront, or Fastly.'
        },
        {
          q: `How do you design an idempotent API endpoint for critical transactions?`,
          diff: 'Intermediate',
          ans: `Idempotency is achieved by requiring clients to pass a unique Idempotency-Key header. The server records the key and cached response in a fast store (Redis); duplicate requests return the cached result.`,
          takeaways: ['Store idempotency keys with TTL bounds.', 'Return identical HTTP status codes for retried requests.', 'Use atomic database locks while processing initial request.'],
          tip: 'Crucial for payment processing, order placement, and registration endpoints.'
        },
        {
          q: `How do you structure micro-frontend or micro-service boundaries effectively?`,
          diff: 'Advanced',
          ans: `Boundaries should be formed around Bounded Contexts (from Domain-Driven Design) rather than arbitrary technical layers, allowing teams to own end-to-end capabilities independently.`,
          takeaways: ['Align service boundaries with business capabilities.', 'Avoid shared databases between services.', 'Minimize synchronous inter-service dependencies.'],
          tip: 'Demonstrate how domain boundaries prevent monolithic coupling.'
        },
        {
          q: `What are circuit breakers and bulkheads in microservice resilient architecture?`,
          diff: 'Intermediate',
          ans: `Circuit breakers monitor downstream calls and trip (open) upon consecutive failures to prevent cascade crashes. Bulkheads isolate resource pools so failure in one feature doesn't starve others.`,
          takeaways: ['Use Resilience4j / circuit breaker concepts.', 'Provide fallback responses when a circuit is open.', 'Isolate thread pools for distinct integration dependencies.'],
          tip: 'Explain the states: Closed, Open, and Half-Open.'
        },
        {
          q: `How do you monitor distributed system health, metrics, and log aggregation at ${company}?`,
          diff: 'Intermediate',
          ans: `Health monitoring combines structured JSON logging, distributed tracing (correlation IDs), metric scrapers (Prometheus), and centralized dashboards (Grafana / ELK stack).`,
          takeaways: ['Propagate trace IDs across all service boundaries.', 'Monitor the 4 Golden Signals: Latency, Traffic, Errors, Saturation.', 'Set up proactive alert rules with threshold buffers.'],
          tip: 'Emphasize observability over reactive manual log searching.'
        }
      ]
    },
    {
      name: 'DATA STRUCTURES & ALGORITHMS',
      questions: [
        {
          q: `How do you choose the right data structure for optimizing time complexity in ${primarySkill}?`,
          diff: 'Intermediate',
          ans: `Selection depends on operation frequency: Hash Maps for O(1) lookups, Trees/Tries for hierarchical/prefix search, Queues/Stacks for ordered processing, and Heaps for priority retrieval.`,
          takeaways: ['Analyze Big-O time and space complexity upfront.', 'Trade memory space for execution speed when appropriate.', 'Understand internal hashing collisions and tree balancing.'],
          tip: 'Walk through Big-O analysis step-by-step.'
        },
        {
          q: `Explain how to implement and optimize a LRU (Least Recently Used) Cache.`,
          diff: 'Advanced',
          ans: `An LRU cache combines a Doubly Linked List for O(1) node insertion/deletion with a Hash Map for O(1) key-to-node lookups. Accessing or inserting a key moves it to the head; evictions remove from the tail.`,
          takeaways: ['Combine Hash Map + Doubly Linked List.', 'Achieve O(1) get and O(1) put operations.', 'Manage capacity boundary evictions cleanly.'],
          tip: 'Be ready to code LRU Cache from scratch on an interview whiteboard.'
        },
        {
          q: `How do you approach solving graph traversal problems (BFS vs. DFS) in real-world applications?`,
          diff: 'Intermediate',
          ans: `BFS (Breadth-First Search) uses a queue and finds the shortest path in unweighted graphs. DFS (Depth-First Search) uses a stack or recursion, ideal for pathfinding, topological sorting, and cycle detection.`,
          takeaways: ['Use BFS for shortest path or level-order exploration.', 'Use DFS for cycle detection, maze solving, and topological sort.', 'Track visited nodes to prevent infinite loops.'],
          tip: 'Relate graph traversal to social network connections or dependency trees.'
        },
        {
          q: `What is Dynamic Programming (DP) and how do memoization and tabulation differ?`,
          diff: 'Advanced',
          ans: `Dynamic Programming solves complex problems by breaking them into overlapping subproblems. Memoization is top-down (recursive with cache), while Tabulation is bottom-up (iterative array filling).`,
          takeaways: ['Identify optimal substructure and overlapping subproblems.', 'Memoization: Top-down recursion + lookup table.', 'Tabulation: Bottom-up iterative table construction.'],
          tip: 'State the base cases and state transition equation clearly.'
        },
        {
          q: `How do you implement efficient sliding window algorithms for array/string processing?`,
          diff: 'Intermediate',
          ans: `The sliding window technique maintains a window range (fixed or dynamic) over contiguous linear data structures, reducing nested O(N²) loops to linear O(N) complexity.`,
          takeaways: ['Use dual pointers (left and right) for window bounds.', 'Expand right pointer to satisfy conditions; shrink left to optimize.', 'Ideal for subarray sum, substring search, and sliding metrics.'],
          tip: 'Mention sliding window applications in rate limiting logs.'
        },
        {
          q: `Explain the mechanics of Trie (Prefix Tree) data structures and their practical uses.`,
          diff: 'Intermediate',
          ans: `A Trie is a tree-like structure where nodes represent characters. It enables fast O(K) prefix search, auto-complete suggestions, and spell-checking where K is word length.`,
          takeaways: ['Each node stores child pointers and an isEndOfWord flag.', 'Search time depends on key length K, independent of dataset size N.', 'Space efficient for storing shared prefix sets.'],
          tip: 'Connect Tries to search auto-completion engines.'
        },
        {
          q: `How do Binary Search Trees (BST) stay balanced and why is balancing critical?`,
          diff: 'Advanced',
          ans: `Unbalanced BSTs degrade to O(N) linked lists. Self-balancing trees (AVL, Red-Black Trees) perform rotations during insertion/deletion to maintain logarithmic O(log N) height bounds.`,
          takeaways: ['Unbalanced trees lead to O(N) worst-case performance.', 'Self-balancing guarantees O(log N) search, insert, delete.', 'Red-Black trees power engine standard maps/sets.'],
          tip: 'Understand rotations (Left-Left, Right-Right, Left-Right, Right-Left).'
        },
        {
          q: `What are Heaps / Priority Queues and when should a ${role} use them?`,
          diff: 'Intermediate',
          ans: `A Heap is a complete binary tree satisfying the heap property (Min-Heap or Max-Heap). Useful for finding top-K elements, Dijkstra's algorithm, and task scheduling in O(log N) operations.`,
          takeaways: ['Min-Heap: Parent node <= children; Max-Heap: Parent >= children.', 'Extract-Min/Max and Insert operate in O(log N).', 'Find top-K elements in streaming data.'],
          tip: 'Differentiate array-backed heaps from pointer trees.'
        },
        {
          q: `How do you detect cycles in a directed or undirected graph?`,
          diff: 'Intermediate',
          ans: `For undirected graphs, use Union-Find (Disjoint Set Union) or DFS tracking parent nodes. For directed graphs, use DFS with 3-color state tracking (Unvisited, Visiting, Visited) or Kahn's Topological algorithm.`,
          takeaways: ['Undirected: Disjoint Set Union (DSU) or parent tracking.', 'Directed: 3-color DFS state machine or indegree BFS (Kahn).', 'Essential for build dependency graph validation.'],
          tip: 'Relate cycle detection to package manager dependency loops.'
        },
        {
          q: `What is space-time trade-off in algorithm design? Give concrete examples.`,
          diff: 'Basic',
          ans: `Space-time trade-off involves spending additional memory (e.g. Hash Maps, memoization tables, index caches) to dramatically reduce computational execution time (e.g. O(N²) to O(N)).`,
          takeaways: ['Hash tables trade memory for O(1) lookup speed.', 'Pre-calculated lookups avoid repeated CPU operations.', 'Consider device memory limits when trading space for speed.'],
          tip: 'Demonstrate awareness of hardware constraints (RAM vs CPU).'
        }
      ]
    },
    {
      name: 'API DESIGN & INTEGRATION',
      questions: [
        {
          q: `What principles define robust RESTful API design for ${role} services?`,
          diff: 'Intermediate',
          ans: `RESTful APIs utilize HTTP verbs (GET, POST, PUT, PATCH, DELETE), noun-based resource paths, standard status codes (200, 201, 400, 401, 403, 404, 500), pagination, and consistent JSON error envelopes.`,
          takeaways: ['Use plural nouns for resource endpoints (/api/v1/users).', 'Return meaningful HTTP status codes.', 'Enforce schema validation payloads.'],
          tip: 'Discuss API versioning techniques (/v1/ vs header versioning).'
        },
        {
          q: `How do REST, GraphQL, and gRPC compare for integrations at ${company}?`,
          diff: 'Advanced',
          ans: `REST is ubiquitous for public web APIs. GraphQL eliminates over/under-fetching for complex frontend views. gRPC (HTTP/2 + Protobuf) offers binary efficiency for high-performance internal microservices.`,
          takeaways: ['REST: Simple, stateless, widely supported.', 'GraphQL: Client-specified field queries.', 'gRPC: Low-latency binary serialization for service-to-service.'],
          tip: 'Choose the appropriate protocol based on client needs and network constraints.'
        },
        {
          q: `How do you implement secure webhooks and event notification delivery?`,
          diff: 'Intermediate',
          ans: `Webhook delivery requires HMAC SHA-256 signature headers for payload verification, retry policies with exponential backoff, delivery timestamps to prevent replay attacks, and worker queues.`,
          takeaways: ['Sign webhook payloads using shared secret HMAC hashes.', 'Include timestamp headers to mitigate replay attacks.', 'Process incoming webhooks asynchronously.'],
          tip: 'Reference GitHub or Stripe webhook verification patterns.'
        },
        {
          q: `How do you handle API versioning, deprecation, and backward compatibility?`,
          diff: 'Intermediate',
          ans: `Manage versioning via URL path (/v2/), custom headers, or query parameters. Sunset legacy APIs gracefully using Deprecation and Sunset HTTP headers alongside structured developer documentation.`,
          takeaways: ['Never introduce breaking payload changes in active versions.', 'Announce deprecation timelines in advance.', 'Monitor legacy endpoint usage traffic before final shutdown.'],
          tip: 'Discuss how to maintain multi-version code paths cleanly.'
        },
        {
          q: `What is CORS (Cross-Origin Resource Sharing) and how do you configure it safely?`,
          diff: 'Basic',
          ans: `CORS is a browser security mechanism restricting cross-origin HTTP requests. Safe configuration requires explicit Access-Control-Allow-Origin domains, allowed methods/headers, and avoiding wildcards (*) with credentials.`,
          takeaways: ['Wildcard origins (*) cannot be used with Allow-Credentials: true.', 'Handle preflight OPTIONS requests properly.', 'Restrict allowed headers and origin domains strictly.'],
          tip: 'Explain why CORS is a browser security policy, not a server firewall.'
        },
        {
          q: `How do you design paginated API responses for large datasets?`,
          diff: 'Intermediate',
          ans: `Use Offset-based pagination (page & limit) for simple UI tables or Cursor-based pagination (opaque cursor token based on record ID/timestamp) for high-performance, real-time feeds without duplication.`,
          takeaways: ['Offset pagination suffers from performance degradation at deep offsets.', 'Cursor pagination is stable under concurrent data insertions.', 'Return metadata: totalCount, nextCursor, hasNextPage.'],
          tip: 'Explain why cursor pagination is superior for infinite scroll UIs.'
        },
        {
          q: `How do you handle error management and status code standards across ${role} APIs?`,
          diff: 'Basic',
          ans: `Standardize errors using RFC 7807 Problem Details format: status, title, detail, code, and validation field details. Never leak raw internal stack traces in production error payloads.`,
          takeaways: ['Use 4xx for client errors, 5xx for server errors.', 'Provide actionable error messages for API consumers.', 'Sanitize internal DB exception stacktraces from output.'],
          tip: 'Mention RFC 7807 Problem Details for HTTP APIs.'
        },
        {
          q: `What strategies prevent cascading failures when integrating third-party APIs?`,
          diff: 'Intermediate',
          ans: `Prevent cascades by setting aggressive connection/read timeouts, wrapping external calls in circuit breakers, providing fallback cached data, and processing non-critical sync calls asynchronously.`,
          takeaways: ['Always set explicit HTTP client request timeouts.', 'Use circuit breakers to trip failing third-party integrations.', 'Cache third-party response data where SLA permits.'],
          tip: 'Detail a time when a third-party outage threatened your application availability.'
        },
        {
          q: `Explain Server-Sent Events (SSE) vs WebSockets for streaming data updates.`,
          diff: 'Intermediate',
          ans: `SSE is a lightweight, mono-directional (server-to-client) HTTP/2 protocol ideal for live feeds, stock prices, or notification updates. WebSockets provide full bi-directional communication over TCP.`,
          takeaways: ['SSE: HTTP-based, native browser auto-reconnect, mono-directional.', 'WebSockets: Full-duplex TCP socket, bi-directional, custom protocol.', 'Choose SSE for simple server-push streams.'],
          tip: 'Match the technology to the actual directional requirements of the application.'
        },
        {
          q: `How do OpenAPI / Swagger specs improve engineering productivity for ${role}?`,
          diff: 'Basic',
          ans: `OpenAPI specs serve as a single contract source for auto-generating API documentation, mock servers, client SDKs, and automated request validation middleware.`,
          takeaways: ['Adopt API-first design methodologies.', 'Auto-generate client SDKs and TypeScript types.', 'Enforce schema validation middleware on incoming requests.'],
          tip: 'Mention API-first design workflows.'
        }
      ]
    },
    {
      name: 'DATABASE, CACHING & STORAGE',
      questions: [
        {
          q: `How do you decide between SQL (Relational) and NoSQL (Document/Key-Value) databases for ${company}?`,
          diff: 'Intermediate',
          ans: `Use SQL (PostgreSQL, MySQL) when complex ACID transactions, strict schema integrity, and relational joins are required. Use NoSQL (MongoDB, DynamoDB) for unstructured schemas, flexible scaling, and high-velocity key-value reads/writes.`,
          takeaways: ['SQL: ACID compliance, structured data, complex joins.', 'NoSQL: High write velocity, horizontal partition scaling, flexible document schema.', 'Polyglot persistence: Use both where appropriate.'],
          tip: `Justify database choices based on data access patterns for ${company}.`
        },
        {
          q: `How do database indexes work (B-Trees vs. Hash Indexes) and how do you optimize slow queries?`,
          diff: 'Advanced',
          ans: `B-Tree indexes maintain sorted balanced trees for range and point queries. EXPLAIN ANALYZE identifies sequential scans, missing composite indexes, high buffer reads, and inefficient join algorithms.`,
          takeaways: ['Index columns used frequently in WHERE, JOIN, and ORDER BY clauses.', 'Avoid over-indexing—indexes slow down write/insert throughput.', 'Use composite indexes following the leftmost prefix rule.'],
          tip: 'Walk through reading an EXPLAIN ANALYZE execution plan.'
        },
        {
          q: `What are database isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable)?`,
          diff: 'Advanced',
          ans: `Isolation levels prevent concurrency anomalies: Dirty Reads, Non-Repeatable Reads, and Phantom Reads. Higher levels guarantee consistency but increase locking overhead and deadlock potential.`,
          takeaways: ['Read Committed: Prevents dirty reads (default in most DBs).', 'Repeatable Read: Prevents non-repeatable reads.', 'Serializable: Strict serial execution (highest safety, lowest concurrency).'],
          tip: 'Explain trade-offs between concurrency throughput and transaction isolation.'
        },
        {
          q: `How do you implement database connection pooling and why is it critical for ${skillsText}?`,
          diff: 'Intermediate',
          ans: `Connection pools maintain a warm pool of reusable database socket connections, avoiding expensive TCP & TLS handshake overhead per request. Pool sizing must match database thread capacities.`,
          takeaways: ['Avoid opening new DB connections per HTTP request.', 'Tune pool min/max sizes based on DB memory and core count.', 'Handle connection timeouts and stale connection evictions.'],
          tip: 'Reference tools like PgBouncer or HikariCP.'
        },
        {
          q: `What is database Sharding and Horizontal Partitioning?`,
          diff: 'Advanced',
          ans: `Sharding divides a large database into smaller, independent databases (shards) based on a shard key. It provides horizontal write scaling beyond single-instance hardware limits.`,
          takeaways: ['Choose a high-cardinality shard key to distribute load evenly.', 'Cross-shard joins are expensive—denormalize where necessary.', 'Handle rebalancing and consistent hashing carefully.'],
          tip: 'Explain consistent hashing algorithms for shard management.'
        },
        {
          q: `How do you handle Redis cache evictions, TTL, and cache invalidation strategies?`,
          diff: 'Intermediate',
          ans: `Eviction policies (volatile-lru, allkeys-lru) drop memory when limits hit. Invalidation strategies rely on event hooks, explicit cache purges upon write, or jittered TTLs to prevent cache stampedes.`,
          takeaways: ['Use TTL jittering to avoid simultaneous key expirations.', 'Select allkeys-lru for general application caching.', 'Use Cache-Aside pattern for standard DB read caching.'],
          tip: 'Explain cache stampedes (thundering herd) and how locking mitigates them.'
        },
        {
          q: `What are Database Migrations and how do you execute zero-downtime schema changes?`,
          diff: 'Intermediate',
          ans: `Zero-downtime migrations use multi-step deployments: 1) Add new nullable column/table, 2) Write to both old and new columns, 3) Backfill historical data, 4) Switch reads to new column, 5) Drop old column.`,
          takeaways: ['Never rename or drop database columns in a single release.', 'Make new columns nullable initially.', 'Run migration scripts via CI/CD before code deployment.'],
          tip: 'Detail a multi-step expansion and contraction migration strategy.'
        },
        {
          q: `How do Object-Relational Mapping (ORM) tools cause performance issues like N+1 queries?`,
          diff: 'Basic',
          ans: `ORMs abstract SQL but lazy-load related records in loops, issuing N additional SQL queries for N items. Fix by using eager loading (JOIN FETCH, select_related, or include).`,
          takeaways: ['Monitor generated SQL queries from ORMs.', 'Use eager loading / eager joins for relational data.', 'Fallback to raw SQL queries for complex analytics.'],
          tip: 'Show how to detect N+1 queries using ORM logging.'
        },
        {
          q: `Explain Read Replicas and Master-Slave (Primary-Replica) database architecture.`,
          diff: 'Intermediate',
          ans: `Primary-Replica setups direct write queries to a single Primary database and distribute read-heavy traffic across multiple asynchronous Read Replicas, scaling read capacity.`,
          takeaways: ['Primary handles writes; Replicas handle read queries.', 'Account for replication lag when reading immediately after writing.', 'Route write operations strictly to Primary.'],
          tip: 'Explain how to handle read-your-own-writes consistency during replication lag.'
        },
        {
          q: `How do Search Engines like Elasticsearch / Lucene differ from traditional databases?`,
          diff: 'Intermediate',
          ans: `Elasticsearch uses Inverted Indexes to map words to documents, enabling full-text search, fuzzy matching, TF-IDF scoring, and fast aggregations over unstructured text datasets.`,
          takeaways: ['Inverted indexes power sub-second full-text searches.', 'Elasticsearch is optimized for text retrieval, not ACID transactions.', 'Sync DB updates to Elasticsearch via event pipelines.'],
          tip: 'Explain inverted index data structures.'
        }
      ]
    },
    {
      name: 'SECURITY, AUTH & COMPLIANCE',
      questions: [
        {
          q: `How do JWT (JSON Web Tokens) and Session-based Authentication compare for ${role} applications?`,
          diff: 'Intermediate',
          ans: `JWTs are stateless, signed tokens stored on client side (httpOnly cookies recommended), ideal for distributed microservices. Sessions store state in server/Redis with a simple session ID cookie.`,
          takeaways: ['Store sensitive tokens in httpOnly, SameSite, Secure cookies.', 'JWT revocation requires token blacklisting in Redis or short TTLs.', 'Keep JWT payloads lean to reduce HTTP header size.'],
          tip: 'Highlight security trade-offs between stateless JWTs and revokable sessions.'
        },
        {
          q: `What is OAuth 2.0 / OpenID Connect (OIDC) and how does the Authorization Code flow work?`,
          diff: 'Advanced',
          ans: `OAuth 2.0 delegates authorization; OIDC adds authentication layers. The Authorization Code flow with PKCE redirects users to identity providers, exchanges code for tokens, and validates user identity safely.`,
          takeaways: ['Use PKCE (Proof Key for Code Exchange) for SPA and mobile clients.', 'Never expose client secrets in frontend codebases.', 'Validate ID token signatures and expiration timestamps.'],
          tip: 'Walk through the PKCE authorization flow step-by-step.'
        },
        {
          q: `How do you defend applications against OWASP Top 10 vulnerabilities (XSS, CSRF, SQLi)?`,
          diff: 'Intermediate',
          ans: `Defenses include: Prepared statements/parameterized queries for SQLi, HTML escaping & Content Security Policy (CSP) for XSS, and Anti-CSRF tokens / SameSite cookies for CSRF.`,
          takeaways: ['SQLi: Parameterize all database queries.', 'XSS: Sanitize inputs, escape outputs, enforce strict CSP headers.', 'CSRF: Use SameSite=Strict/Lax cookies and CSRF tokens.'],
          tip: 'Demonstrate deep knowledge of defensive security programming.'
        },
        {
          q: `What is Role-Based Access Control (RBAC) vs. Attribute-Based Access Control (ABAC)?`,
          diff: 'Intermediate',
          ans: `RBAC grants permissions based on static user roles (e.g. Admin, Student, HR). ABAC evaluates dynamic attributes (user, resource, environment context) for fine-grained authorization.`,
          takeaways: ['RBAC is simple and effective for standard application roles.', 'ABAC supports complex dynamic policy evaluations.', 'Enforce authorization checks on the server boundary.'],
          tip: 'Reference authorization middleware implementation patterns.'
        },
        {
          q: `How do you secure data at rest and data in transit for ${company}?`,
          diff: 'Intermediate',
          ans: `Data in transit uses TLS 1.3 encryption for all HTTP/gRPC endpoints. Data at rest uses AES-256 encryption for databases, file storage, and automated key rotation via Cloud KMS.`,
          takeaways: ['Enforce HTTPS with HSTS headers everywhere.', 'Encrypt sensitive database columns (e.g. PII, secrets) with AES-256.', 'Manage encryption keys in dedicated Key Management Services (KMS).'],
          tip: `Reference security standards applicable to ${company}'s industry.`
        },
        {
          q: `How do you handle API key management and secrets storage safely in CI/CD and production?`,
          diff: 'Basic',
          ans: `Secrets (API keys, DB credentials) must never be committed to Git. Store secrets in environment managers (HashiCorp Vault, AWS Secrets Manager) and inject them at runtime.`,
          takeaways: ['Use git-secrets / gitleaks to prevent accidental commits.', 'Store secrets in dedicated secret vaults, not plain config files.', 'Rotate secrets periodically with zero-downtime procedures.'],
          tip: 'Mention automated secret scanners in pull requests.'
        },
        {
          q: `What is Content Security Policy (CSP) and how does it prevent malicious script execution?`,
          diff: 'Intermediate',
          ans: `CSP is an HTTP response header defining approved origins for loading scripts, styles, images, and frames, blocking inline script execution and unauthorized data exfiltration.`,
          takeaways: ['Restrict script-src directives to trusted domains.', 'Avoid unsafe-inline and unsafe-eval flags.', 'Use nonces or hashes for legitimate inline scripts.'],
          tip: 'Explain how CSP headers neutralize XSS attacks.'
        },
        {
          q: `How do you safely store and hash user passwords in database tables?`,
          diff: 'Basic',
          ans: `Never store plaintext or simple MD5/SHA256 hashes. Use memory-hard key derivation functions like Argon2id or bcrypt with unique cryptographic salts per password.`,
          takeaways: ['Use Argon2id or bcrypt with high work factor cost.', 'Salt passwords uniquely per record to prevent rainbow table attacks.', 'Re-hash legacy credentials upon successful login.'],
          tip: 'Explain why salted hashes defeat pre-computed rainbow table attacks.'
        },
        {
          q: `What are Rate Limiting, IP Throttling, and WAF (Web Application Firewall) protections?`,
          diff: 'Basic',
          ans: `WAFs inspect HTTP payloads at origin boundaries to block malicious injection, bot scrapers, and DDoS attacks, working alongside application rate limiters for multi-layered defense.`,
          takeaways: ['Deploy Cloudflare / AWS WAF at network edge.', 'Block known vulnerability exploit payloads automatically.', 'Protect authentication endpoints against brute-force attacks.'],
          tip: 'Detail defense-in-depth security strategies.'
        },
        {
          q: `What is Data Privacy Compliance (GDPR, CCPA, SOC2) and how does it affect ${role} coding?`,
          diff: 'Intermediate',
          ans: `Compliance requires data minimization, audit logging, right-to-be-forgotten deletion workflows, user consent management, and strict access logging for PII (Personally Identifiable Information).`,
          takeaways: ['Provide automated user data export and deletion endpoints.', 'Anonymize PII data in logging and analytics channels.', 'Maintain audit logs for administrative data access.'],
          tip: 'Demonstrate awareness of data privacy regulations.'
        }
      ]
    },
    {
      name: 'DEVOPS, CI/CD & DEPLOYMENT',
      questions: [
        {
          q: `How do you structure a zero-downtime CI/CD deployment pipeline for ${skillsText}?`,
          diff: 'Intermediate',
          ans: `A robust CI/CD pipeline runs linting, unit tests, security scans, builds container images, deploys to staging, runs E2E validation, and executes Blue/Green or Canary rollouts in production.`,
          takeaways: ['Automate test gates on every pull request.', 'Build immutable container images tagged with git commit SHA.', 'Use Blue/Green or Canary releases for zero-downtime production updates.'],
          tip: 'Reference GitHub Actions, GitLab CI, or Jenkins pipelines.'
        },
        {
          q: `What are Containerization (Docker) best practices for ${role} microservices?`,
          diff: 'Basic',
          ans: `Best practices include multi-stage builds, non-root execution, minimal alpine/distroless base images, environment variable configurations, and explicit .dockerignore filters.`,
          takeaways: ['Use multi-stage builds to produce lean runtime images.', 'Never run containers as root user in production.', 'Leverage layer caching by ordering Dockerfile instructions.'],
          tip: 'Explain multi-stage Docker builds.'
        },
        {
          q: `How does Kubernetes (K8s) manage orchestration, self-healing, and auto-scaling?`,
          diff: 'Advanced',
          ans: `Kubernetes uses Pods, Deployments, and Services. The Horizontal Pod Autoscaler (HPA) adjusts replica counts based on CPU/memory usage, while liveness/readiness probes enable self-healing.`,
          takeaways: ['Readiness probes control traffic routing; Liveness probes restart hung containers.', 'HPA scales pods dynamically under load spikes.', 'Use ConfigMaps and Secrets for decoupled pod configurations.'],
          tip: 'Explain the difference between readiness and liveness probes.'
        },
        {
          q: `What is Infrastructure as Code (IaC) using Terraform or CloudFormation?`,
          diff: 'Intermediate',
          ans: `IaC manages infrastructure using declarative code files stored in version control, ensuring reproducible, audited, and automated cloud infrastructure provisioning.`,
          takeaways: ['Store infrastructure configurations in Git.', 'Use Terraform state locking to prevent concurrent modification.', 'Run terraform plan before executing production changes.'],
          tip: 'Highlight idempotency and version control in cloud provisioning.'
        },
        {
          q: `Explain Blue/Green Deployments vs. Canary Deployments.`,
          diff: 'Intermediate',
          ans: `Blue/Green provisions two identical environments and switches router traffic instantly. Canary routes a small percentage (e.g. 5%) of production traffic to the new version before full rollout.`,
          takeaways: ['Blue/Green: Instant failback capability, doubles resource costs.', 'Canary: Gradual traffic escalation, minimizes blast radius of bugs.', 'Monitor error rates automatically during canary releases.'],
          tip: 'Choose the deployment strategy matching risk tolerance.'
        },
        {
          q: `How do Feature Flags (Feature Toggles) enable continuous delivery?`,
          diff: 'Basic',
          ans: `Feature flags decouple code deployment from feature release, allowing developers to safely merge code turned OFF, execute dark launches, perform A/B testing, and instantly kill buggy features.`,
          takeaways: ['Decouple code shipping from user enablement.', 'Instantly disable problematic features without re-deploying code.', 'Clean up obsolete feature flags routinely.'],
          tip: 'Reference LaunchDarkly or custom flag implementations.'
        },
        {
          q: `What are 12-Factor App methodology principles for cloud-native software?`,
          diff: 'Intermediate',
          ans: `12-Factor principles include explicit dependency management, config in environment, backing service decoupling, stateless processes, fast startup/graceful shutdown, and dev/prod parity.`,
          takeaways: ['Store configurations in environment variables.', 'Treat backing services as attached resources.', 'Ensure fast startup and graceful SIGTERM shutdown.'],
          tip: 'Reference key 12-Factor principles in cloud app design.'
        },
        {
          q: `How do you configure Graceful Shutdown for Node.js / backend services?`,
          diff: 'Intermediate',
          ans: `Graceful shutdown listens for SIGINT/SIGTERM signals, stops accepting new incoming HTTP connections, finishes processing active requests, closes database pools, and exits cleanly.`,
          takeaways: ['Listen for SIGTERM/SIGINT OS process signals.', 'Stop accepting new traffic while completing inflight requests.', 'Close DB connections and external sockets before process exit.'],
          tip: 'Essential for zero-downtime Kubernetes rolling updates.'
        },
        {
          q: `What is Immutable Infrastructure and why is it preferred over mutable servers?`,
          diff: 'Basic',
          ans: `Immutable infrastructure replaces server instances completely with fresh pre-built images rather than modifying existing servers in-place, eliminating configuration drift.`,
          takeaways: ['Never SSH into production servers to apply manual fixes.', 'Replace instances with fresh images for updates.', 'Eliminate configuration drift between environments.'],
          tip: 'Explain configuration drift prevention.'
        },
        {
          q: `How do GitOps workflows (ArgoCD / Flux) operate in cloud-native environments?`,
          diff: 'Advanced',
          ans: `GitOps uses Git repositories as the single source of truth for infrastructure and application state. Automated agents (ArgoCD) continuously synchronize cluster state with Git manifests.`,
          takeaways: ['Git repository holds target state declarations.', 'Automated controllers pull changes and reconcile cluster state.', 'Enables easy rollbacks via git revert.'],
          tip: 'Mention declarative continuous deployment.'
        }
      ]
    },
    {
      name: 'TESTING, QA & DEBUGGING',
      questions: [
        {
          q: `How do you design a comprehensive testing strategy (Unit, Integration, E2E) for ${role}?`,
          diff: 'Intermediate',
          ans: `A balanced testing pyramid consists of many fast unit tests for isolated business logic, integration tests for API/DB boundaries, and focused E2E tests (Cypress/Playwright) for critical user journeys.`,
          takeaways: ['Follow the Testing Pyramid ratio.', 'Mock external networks in unit and integration layers.', 'Automate end-to-end tests for key user flows.'],
          tip: 'Explain test execution speed vs. confidence balance.'
        },
        {
          q: `What is Test-Driven Development (TDD) and what are its practical benefits and trade-offs?`,
          diff: 'Intermediate',
          ans: `TDD follows the Red-Green-Refactor cycle: write failing test, write minimal code to pass, refactor cleanly. Benefits include superior modular design and high coverage; trade-off is higher initial development time.`,
          takeaways: ['Red: Write failing test case first.', 'Green: Implement simplest passing solution.', 'Refactor: Clean code while ensuring tests remain green.'],
          tip: 'Demonstrate TDD discipline.'
        },
        {
          q: `How do you mock external dependencies, databases, and APIs in test suites?`,
          diff: 'Basic',
          ans: `Use test doubles (Mocks, Stubs, Spies) or in-memory databases (e.g. SQLite / MSW for API mocking) to isolate unit tests from external state, ensuring fast, deterministic test runs.`,
          takeaways: ['Stubs return canned responses; Mocks verify interactions.', 'Use MSW (Mock Service Worker) for network API mocking.', 'Keep unit test suites free of external I/O dependencies.'],
          tip: 'Differentiate Stubs vs. Mocks vs. Spies.'
        },
        {
          q: `How do you debug hard-to-reproduce, intermittent race conditions or memory leaks?`,
          diff: 'Advanced',
          ans: `Debugging requires reproducing issues under stress loops, analyzing detailed heap/CPU profiles, inspecting thread execution order, reviewing distributed trace logs, and using memory leak detectors.`,
          takeaways: ['Isolate variables in minimal reproduction scripts.', 'Analyze heap snapshots and memory allocation diffs.', 'Use concurrency sanitizers and thread logging.'],
          tip: 'Walk through a methodical diagnostic elimination process.'
        },
        {
          q: `What is Code Coverage and why is 100% coverage often a misleading metric?`,
          diff: 'Basic',
          ans: `Code coverage measures executed code lines during tests. 100% coverage can be misleading if assertions are weak or boundary edge cases are ignored. Quality assertions matter more than line count.`,
          takeaways: ['Focus on branch coverage and meaningful assertions over line percent.', 'Test edge cases, null values, and error conditions.', 'Use mutation testing to evaluate test suite quality.'],
          tip: 'Focus on assertion quality over arbitrary coverage targets.'
        },
        {
          q: `How do you conduct static code analysis and linting in production pipelines?`,
          diff: 'Basic',
          ans: `Static analysis tools (ESLint, SonarQube) scan codebases without execution to catch syntax flaws, security vulnerabilities, code smells, and formatting inconsistencies automatically.`,
          takeaways: ['Enforce lint rules in pre-commit hooks (Husky).', 'Block pull requests with critical SonarQube quality gate failures.', 'Maintain consistent team code formatting via Prettier.'],
          tip: 'Mention automated code quality gates.'
        },
        {
          q: `How do you write effective End-to-End (E2E) automation tests using Playwright or Cypress?`,
          diff: 'Intermediate',
          ans: `E2E tests target real browser execution. Best practices: use resilient data-testid selectors, isolate test data state per spec run, avoid brittle sleep timeouts, and mock flaky third-party integrations.`,
          takeaways: ['Select elements using data-testid attributes.', 'Avoid hardcoded wait timeouts; use auto-waiting assertions.', 'Reset test database state before each test spec run.'],
          tip: 'Explain why flaky E2E tests destroy CI pipeline trust.'
        },
        {
          q: `What is Contract Testing (Pact framework) in microservices QA?`,
          diff: 'Advanced',
          ans: `Contract testing verifies that service providers and consumers agree on request/response formats without spinning up all microservices in complex end-to-end integration environments.`,
          takeaways: ['Consumers define expected contract specs.', 'Providers verify compliance independently against contracts.', 'Eliminates brittle E2E staging environments.'],
          tip: 'Explain Consumer-Driven Contract Testing.'
        },
        {
          q: `How do you test error handling, retry policies, and edge cases gracefully?`,
          diff: 'Intermediate',
          ans: `Simulate network latency, server 5xx errors, corrupted payloads, and timeout conditions in unit/integration tests to ensure catch blocks, error boundaries, and user feedback UI execute correctly.`,
          takeaways: ['Test negative paths as thoroughly as happy paths.', 'Verify exponential backoff retry caps.', 'Ensure user interfaces display helpful error fallback components.'],
          tip: 'Highlight negative path testing.'
        },
        {
          q: `What is Chaos Engineering (Chaos Monkey) and how does it validate system reliability?`,
          diff: 'Advanced',
          ans: `Chaos engineering deliberately injects failures (killing instances, introducing network latency, dropping databases) in controlled environments to prove that self-healing systems behave resiliently.`,
          takeaways: ['Formulate hypothesis before injecting failure.', 'Test resilience in staging and production canary environments.', 'Verify automated alerts and self-healing mechanisms trigger.'],
          tip: 'Reference Netflix Chaos Engineering principles.'
        }
      ]
    },
    {
      name: 'BEHAVIORAL, LEADERSHIP & COMPANY SCENARIOS',
      questions: [
        {
          q: `Describe a scenario where you resolved a technical conflict with a team member at ${company}.`,
          diff: 'Intermediate',
          ans: `Structure your response with STAR method: Situation (differing architecture views), Task (aligning on direction), Action (building quick PoCs, objective trade-off evaluation), Result (consensus on scalable solution).`,
          takeaways: ['Focus on objective technical data rather than opinion.', 'Emphasize active listening and collaboration.', 'Highlight team velocity and project delivery outcomes.'],
          tip: `Align your response with ${company}'s culture of constructive debate and teamwork.`
        },
        {
          q: `How do you prioritize competing feature deadlines, technical debt, and production bugs?`,
          diff: 'Intermediate',
          ans: `Prioritization uses an Eisenhower matrix approach: P0 production outages first, followed by high-value roadmap features, while dedicating ~20% of sprint capacity to technical debt and quality enhancements.`,
          takeaways: ['Classify issues by severity and business impact.', 'Maintain transparent communication with product managers.', 'Allocate dedicated sprint budget for technical refactoring.'],
          tip: 'Demonstrate pragmatic balance between engineering excellence and business delivery.'
        },
        {
          q: `Tell me about a production outage or critical bug you caused and how you handled it.`,
          diff: 'Intermediate',
          ans: `Focus on ownership: 1) Immediate mitigation/rollback, 2) Transparent incident communication, 3) Root-cause blameless post-mortem analysis, 4) Implementing automated prevention gates to guarantee it never recurs.`,
          takeaways: ['Take full accountability without blaming others.', 'Focus on immediate system restoration first.', 'Detail blameless post-mortem actions and preventive automation.'],
          tip: 'Interviewers look for honesty, accountability, and systemic learning.'
        },
        {
          q: `How do you mentor junior engineers and foster technical growth in team environments?`,
          diff: 'Basic',
          ans: `Mentorship involves pair programming, constructive and empathetic code reviews, sharing architectural context, delegating stretch goals with safety nets, and encouraging continuous learning.`,
          takeaways: ['Provide actionable, empathetic code review feedback.', 'Break down complex tasks into learning milestones.', 'Encourage questions and create a psychologically safe culture.'],
          tip: 'Highlight leadership and team-building capability.'
        },
        {
          q: `Why do you specifically want to join ${company} as a ${role}?`,
          diff: 'Basic',
          ans: `Express genuine enthusiasm for ${company}'s specific product impact, engineering challenges, scale, and technical culture. Connect your past experience with ${skillsText} directly to their key initiatives.`,
          takeaways: [`Demonstrate deep knowledge of ${company}'s product and engineering domain.`, `Connect your skills (${skillsText}) to their open technical challenges.`, 'Show long-term career commitment and passion for learning.'],
          tip: `Reference real products, blog posts, or open-source projects from ${company}.`
        },
        {
          q: `How do you handle ambiguous requirements when assigned a new feature project?`,
          diff: 'Intermediate',
          ans: `Handle ambiguity by interviewing product managers/stakeholders, writing a technical specification document (RFC/PRD), defining explicit edge cases, prototyping early user flows, and breaking work into iterative milestones.`,
          takeaways: ['Write technical specs (RFCs) to align stakeholders.', 'Identify hidden assumptions and risks early.', 'Deliver incremental MVP iterations to validate direction.'],
          tip: 'Show proactive initiative in bringing clarity to vague scope.'
        },
        {
          q: `How do you communicate complex technical concepts to non-technical business stakeholders?`,
          diff: 'Basic',
          ans: `Use real-world analogies, avoid jargon, focus on outcomes (speed, cost, risk, user experience), and use visual diagrams to illustrate technical tradeoffs clearly.`,
          takeaways: ['Avoid hyper-technical jargon when presenting to business leaders.', 'Use relatable real-world analogies.', 'Focus on business metrics, user experience, and risk.'],
          tip: 'Demonstrate communication versatility across technical and non-technical audiences.'
        },
        {
          q: `Describe a project where you had to learn a completely unfamiliar technology rapidly.`,
          diff: 'Basic',
          ans: `Detail your learning strategy: reading official documentation, studying codebase patterns, building isolated PoCs, seeking guidance from experienced peers, and applying lessons to production.`,
          takeaways: ['Show fast adaptability and self-driven learning.', 'Focus on computer science fundamentals as transferrable skills.', 'Demonstrate resourceful problem-solving.'],
          tip: 'Highlight your capacity to pick up new tools efficiently under deadline pressure.'
        },
        {
          q: `How do you maintain work-life balance and avoid burnout in high-pressure delivery environments?`,
          diff: 'Basic',
          ans: `Manage workload by setting clear boundaries, realistic estimation, automating repetitive tasks, taking structured breaks, and communicating capacity proactively with management.`,
          takeaways: ['Provide realistic estimation buffers based on historical velocity.', 'Automate manual repetitive workflows.', 'Communicate capacity constraints early and transparently.'],
          tip: 'Show self-awareness and sustainable productivity habits.'
        },
        {
          q: `Where do you see your technical career evolving over the next 3 to 5 years as a ${role}?`,
          diff: 'Basic',
          ans: `Articulate a vision for growing into a Staff/Principal Architect or Technical Lead, driving major system architecture, mentoring teams, and delivering impactful software solutions at companies like ${company}.`,
          takeaways: ['Express desire for continuous technical mastery and leadership.', 'Align career growth with organizational impact.', 'Show commitment to engineering excellence.'],
          tip: 'Balance technical depth ambition with leadership growth.'
        }
      ]
    }
  ];

  const all100Questions = [];
  let globalId = 1;

  categories.forEach((cat) => {
    cat.questions.forEach((item) => {
      all100Questions.push({
        id: globalId,
        question: item.q,
        difficulty: item.diff,
        category: cat.name,
        answer: item.ans,
        keyTakeaways: item.takeaways,
        tip: item.tip
      });
      globalId++;
    });
  });

  return all100Questions;
};

const QuestionBankReader = () => {
  const [targetJobs, setTargetJobs] = useState([]);
  const [loadingTargetJobs, setLoadingTargetJobs] = useState(true);

  // NO DEFAULT SELECTION: selectedJob is initially null
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReadingMode, setIsReadingMode] = useState(false);

  // Reader State (100 questions)
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDownloadedIndex, setLastDownloadedIndex] = useState(-1);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  // Success Toast for Download Notification
  const [downloadNotification, setDownloadNotification] = useState('');

  // Fetch student's Target Jobs dynamically
  useEffect(() => {
    fetchStudentTargetJobs();
  }, []);

  const fetchStudentTargetJobs = async () => {
    try {
      setLoadingTargetJobs(true);
      const res = await API.get('/target-jobs');
      if (res.data && res.data.targetJobs && res.data.targetJobs.length > 0) {
        const jobsList = res.data.targetJobs;
        setTargetJobs(jobsList);
        setSelectedJob(null);
      } else {
        setTargetJobs([]);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Failed to load target jobs for question bank:', err);
      setTargetJobs([]);
      setSelectedJob(null);
    } finally {
      setLoadingTargetJobs(false);
    }
  };

  // Auto-save reading progress to localStorage whenever currentIndex or lastDownloadedIndex changes
  useEffect(() => {
    if (isReadingMode && selectedJob) {
      saveProgressToStorage(selectedJob, currentIndex, lastDownloadedIndex);
    }
  }, [currentIndex, lastDownloadedIndex, isReadingMode, selectedJob]);

  // Start / Continue Reading Handler for a Target Job
  const handleStartReading = (jobToRead, startFromIndex = null) => {
    const job = jobToRead || selectedJob;
    if (!job) return;

    setSelectedJob(job);
    setFetchingQuestions(true);
    setIsReadingMode(true);

    // Load saved progress from localStorage
    const saved = loadProgressFromStorage(job);
    const initialIndex = startFromIndex !== null
      ? startFromIndex
      : (saved && saved.lastReadIndex !== undefined ? saved.lastReadIndex : 0);
    const initialDownloaded = saved && saved.lastDownloadedIndex !== undefined ? saved.lastDownloadedIndex : -1;

    setCurrentIndex(initialIndex);
    setLastDownloadedIndex(initialDownloaded);

    try {
      const target100 = generate100TargetJobQuestions(job);
      setQuestions(target100);
    } catch (err) {
      console.error('Failed to generate 100 questions:', err);
      setQuestions(generate100TargetJobQuestions(job));
    } finally {
      setFetchingQuestions(false);
    }
  };

  // PDF Checkpoint Download Handler
  const handleDownloadCheckpoint = (targetIndex = null) => {
    if (!selectedJob || questions.length === 0) return;

    const endIndex = targetIndex !== null ? targetIndex : currentIndex;
    const startIndex = lastDownloadedIndex + 1;

    if (startIndex > endIndex) {
      setDownloadNotification(`Questions Q1–Q${endIndex + 1} are already downloaded.`);
      setTimeout(() => setDownloadNotification(''), 4000);
      return;
    }

    const batchQuestions = questions.slice(startIndex, endIndex + 1);
    const startQNum = startIndex + 1;
    const endQNum = endIndex + 1;

    // Generate & download professional PDF
    generateProfessionalPDF(selectedJob, batchQuestions, startQNum, endQNum);

    // Update lastDownloadedIndex & save progress
    setLastDownloadedIndex(endIndex);
    saveProgressToStorage(selectedJob, currentIndex, endIndex);

    // Automatically advance to the next question after downloading PDF checkpoint
    if (currentIndex < questions.length - 1) {
      const nextQNum = endQNum + 1;
      setCurrentIndex((prev) => prev + 1);
      setDownloadNotification(`Generated Professional PDF for Questions Q${startQNum}–Q${endQNum}! Continuing to Question ${nextQNum}...`);
    } else {
      setDownloadNotification(`Generated Professional PDF for Questions Q${startQNum}–Q${endQNum}! You have completed all 100 questions!`);
    }
    setTimeout(() => setDownloadNotification(''), 4500);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentQ = questions[currentIndex] || {};
  const activeRoleTitle = selectedJob ? (selectedJob.target_job_role || selectedJob.targetJobRole || selectedJob.jobRole || selectedJob.title || 'Target Job') : '';
  const activeCompanyName = selectedJob ? (selectedJob.target_company || selectedJob.targetCompany || selectedJob.companyName || selectedJob.company) : '';

  // Strict Checkpoint Logic: Download button appears ONLY at Q20, Q40, Q60, Q80, and Q100
  const currentQNum = currentIndex + 1;
  const isStrictCheckpoint = currentQNum === 20 || currentQNum === 40 || currentQNum === 60 || currentQNum === 80 || currentQNum === 100;
  const downloadStartQNum = lastDownloadedIndex + 2;
  const downloadEndQNum = currentQNum;
  const hasUnDownloadedBatch = downloadStartQNum <= downloadEndQNum;

    return (
    <StudentLayout>
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div
        className="p-4 mb-4"
        style={{
          background:
            'linear-gradient(135deg, #1E1B4B 0%, #312E81 55%, #4C1D95 100%)',
          borderRadius: '18px',
          color: '#fff',
          boxShadow: '0 12px 30px rgba(76, 29, 149, 0.18)',
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaBookOpen className="fs-3" />

              <h3
                className="fw-bold mb-0 text-white"
                style={{ fontSize: '1.7rem' }}
              >
                Question Bank
              </h3>

              <span
                className="badge text-white"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Read • Revise • Download
              </span>
            </div>

            <p className="mb-0 text-white-50 small">
              Master 100 curated questions for your target job with answers,
              explanations and PDF checkpoints.
            </p>
          </div>

          {isReadingMode && (
            <button
              type="button"
              className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-2"
              onClick={() => setIsReadingMode(false)}
              style={{ borderRadius: '10px' }}
            >
              <FaArrowLeft />
              Back to Target Jobs
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          DOWNLOAD NOTIFICATION
      ========================================================= */}
      {downloadNotification && (
        <div
          className="d-flex align-items-center gap-2 p-3 mb-4 shadow-sm"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            borderRadius: '12px',
          }}
        >
          <FaCheckCircle className="text-success fs-5" />
          <span className="fw-semibold">{downloadNotification}</span>
        </div>
      )}

      {/* =========================================================
          LOADING
      ========================================================= */}
      {loadingTargetJobs ? (
        <div
          className="card border-0 shadow-sm text-center p-5"
          style={{ borderRadius: '18px' }}
        >
          <FaSpinner className="text-primary fs-2 mb-3" />

          <h5 className="fw-bold mb-1">
            Loading Your Target Jobs...
          </h5>

          <p className="text-muted mb-0 small">
            Preparing your personalized question bank.
          </p>
        </div>
      ) : targetJobs.length === 0 ? (
        /* =======================================================
           EMPTY STATE
        ======================================================= */
        <div
          className="card border-0 shadow-sm text-center p-5"
          style={{ borderRadius: '18px' }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '18px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
            }}
          >
            <FaFolderOpen className="fs-2" />
          </div>

          <h4 className="fw-bold text-dark mb-2">
            No Target Jobs Found
          </h4>

          <p
            className="text-muted small mx-auto mb-4"
            style={{ maxWidth: '500px' }}
          >
            You haven't added any saved Target Jobs yet. Add a target
            role and company to generate your personalized 100-question
            study bank.
          </p>

          <Link
            to="/student/target-jobs"
            className="btn btn-primary fw-bold d-inline-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: '10px' }}
          >
            <FaPlusCircle />
            Add Target Job
          </Link>
        </div>
      ) : !isReadingMode ? (
        /* =======================================================
           TARGET JOB SELECTION
        ======================================================= */
        <div className="d-flex flex-column gap-4">

          {/* INFO BANNER */}
          <div
            className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
            style={{
              background:
                'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
              border: '1px solid #DBEAFE',
              borderRadius: '16px',
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#4F46E5',
                  color: '#fff',
                }}
              >
                <FaStar />
              </div>

              <div>
                <h6 className="fw-bold text-dark mb-1">
                  Your Saved Target Jobs
                </h6>

                <p className="text-muted small mb-0">
                  {targetJobs.length} target job
                  {targetJobs.length !== 1 ? 's' : ''} available.
                  Select one to start your 100-question study guide.
                </p>
              </div>
            </div>

            <Link
              to="/student/target-jobs"
              className="btn btn-outline-primary btn-sm fw-bold"
              style={{ borderRadius: '9px' }}
            >
              Manage Target Jobs
            </Link>
          </div>

          {/* TARGET JOB CARDS */}
          <div className="row g-4">
            {targetJobs.map((job, idx) => {
              const roleTitle =
                job.target_job_role ||
                job.targetJobRole ||
                job.jobRole ||
                job.title ||
                `Target Job #${idx + 1}`;

              const companyName =
                job.target_company ||
                job.targetCompany ||
                job.companyName ||
                job.company ||
                'Not Specified';

              const skills =
                job.required_skills ||
                job.requiredSkills ||
                job.skills ||
                [];

              const isSelected =
                selectedJob &&
                (selectedJob._id
                  ? selectedJob._id === job._id
                  : selectedJob === job);

              const savedProg = loadProgressFromStorage(job);

              const hasSavedProgress =
                savedProg && savedProg.lastReadIndex > 0;

              const savedQuestionNum = hasSavedProgress
                ? savedProg.lastReadIndex + 1
                : 1;

              return (
                <div
                  key={job._id || idx}
                  className="col-12 col-md-6 col-xl-4"
                >
                  <div
                    className="card h-100 border-0 shadow-sm"
                    onClick={() => setSelectedJob(job)}
                    style={{
                      borderRadius: '18px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      border: isSelected
                        ? '2px solid #4F46E5'
                        : '2px solid transparent',
                      backgroundColor: isSelected
                        ? '#F5F3FF'
                        : '#FFFFFF',
                    }}
                  >
                    <div className="p-4">

                      {/* CARD TOP */}
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            backgroundColor: isSelected
                              ? '#4F46E5'
                              : '#EEF2FF',
                            color: isSelected
                              ? '#FFFFFF'
                              : '#4F46E5',
                          }}
                        >
                          <FaBriefcase className="fs-5" />
                        </div>

                        {isSelected ? (
                          <span
                            className="badge bg-primary d-flex align-items-center gap-1"
                            style={{ borderRadius: '20px' }}
                          >
                            <FaCheckCircle />
                            Selected
                          </span>
                        ) : (
                          <span className="text-muted small fw-semibold">
                            Select
                          </span>
                        )}
                      </div>

                      {/* ROLE */}
                      <h5 className="fw-bold text-dark mb-2">
                        {roleTitle}
                      </h5>

                      {/* COMPANY */}
                      <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                        <FaBuilding className="text-primary" />
                        <span>{companyName}</span>
                      </div>

                      {/* PROGRESS */}
                      {hasSavedProgress && (
                        <div
                          className="p-3 mb-4"
                          style={{
                            backgroundColor: '#F5F3FF',
                            border: '1px solid #DDD6FE',
                            borderRadius: '12px',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span
                              className="small fw-bold"
                              style={{ color: '#7E22CE' }}
                            >
                              <FaHistory className="me-1" />
                              Reading Progress
                            </span>

                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#7E22CE',
                                color: '#fff',
                              }}
                            >
                              Q{savedQuestionNum} / 100
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SKILLS */}
                      <div className="pt-3 border-top">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <FaCode className="text-primary" />
                          <span className="small fw-bold text-muted">
                            REQUIRED SKILLS
                          </span>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {skills.length > 0 ? (
                            skills.slice(0, 4).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="badge"
                                style={{
                                  backgroundColor: '#F5F3FF',
                                  color: '#4F46E5',
                                  border: '1px solid #DDD6FE',
                                  borderRadius: '7px',
                                }}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small">
                              Core Industry Skills
                            </span>
                          )}

                          {skills.length > 4 && (
                            <span className="badge bg-light text-muted border">
                              +{skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LAUNCH BAR */}
          <div
            className="p-3 mt-2 d-flex flex-column flex-sm-row justify-content-end align-items-sm-center gap-2"
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            {selectedJob ? (
              (() => {
                const savedProg = loadProgressFromStorage(selectedJob);

                const hasSavedProgress =
                  savedProg && savedProg.lastReadIndex > 0;

                const savedQuestionNum = hasSavedProgress
                  ? savedProg.lastReadIndex + 1
                  : 1;

                return (
                  <>
                    {hasSavedProgress && (
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold d-flex align-items-center justify-content-center gap-2"
                        onClick={() =>
                          handleStartReading(
                            selectedJob,
                            savedProg.lastReadIndex
                          )
                        }
                        style={{ borderRadius: '10px' }}
                      >
                        <FaHistory />
                        Continue from Q{savedQuestionNum}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() =>
                        handleStartReading(
                          selectedJob,
                          hasSavedProgress
                            ? savedProg.lastReadIndex
                            : 0
                        )
                      }
                      style={{ borderRadius: '10px' }}
                    >
                      Open Question Bank
                      <FaArrowRight />
                    </button>
                  </>
                );
              })()
            ) : (
              <button
                type="button"
                className="btn btn-secondary fw-bold d-flex align-items-center gap-2"
                disabled
                style={{
                  borderRadius: '10px',
                  cursor: 'not-allowed',
                }}
              >
                Select a Target Job
                <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* =======================================================
           READING MODE
        ======================================================= */
        <div className="d-flex flex-column gap-4">

          {/* READER HEADER */}
          <div
            className="card border-0 shadow-sm p-3"
            style={{ borderRadius: '16px' }}
          >
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background:
                      'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    color: '#fff',
                  }}
                >
                  <FaBookOpen />
                </div>

                <div>
                  <div className="small text-muted fw-semibold">
                    READING MODE
                  </div>

                  <h6 className="fw-bold text-dark mb-0">
                    {activeRoleTitle}
                    {activeCompanyName
                      ? ` at ${activeCompanyName}`
                      : ''}
                  </h6>

                  <small className="text-muted">
                    Question {currentIndex + 1} of {questions.length}
                  </small>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">

                {/* CHECKPOINT DOWNLOAD */}
                {isStrictCheckpoint && hasUnDownloadedBatch && (
                  <button
                    type="button"
                    className="btn btn-success btn-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={() =>
                      handleDownloadCheckpoint(currentIndex)
                    }
                    style={{ borderRadius: '9px' }}
                  >
                    <FaDownload />
                    Download Q{downloadStartQNum}–Q{downloadEndQNum}
                  </button>
                )}

                {/* PROGRESS */}
                <div style={{ minWidth: '190px' }}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small text-muted fw-semibold">
                      Progress
                    </span>

                    <span className="small text-muted fw-bold">
                      {currentIndex + 1} / {questions.length}
                    </span>
                  </div>

                  <div
                    className="progress"
                    style={{
                      height: '8px',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${
                          ((currentIndex + 1) /
                            (questions.length || 1)) *
                          100
                        }%`,
                        backgroundColor: '#4F46E5',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHECKPOINT BANNER */}
          {isStrictCheckpoint && (
            <div
              className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
              style={{
                background:
                  'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                border: '1px solid #A7F3D0',
                borderRadius: '14px',
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#059669',
                    color: '#fff',
                  }}
                >
                  <FaBookmark />
                </div>

                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: '#065F46' }}
                  >
                    Checkpoint Reached — Q{currentQNum}
                  </h6>

                  <p
                    className="small mb-0"
                    style={{ color: '#047857' }}
                  >
                    {hasUnDownloadedBatch
                      ? `Download Questions Q${downloadStartQNum}–Q${downloadEndQNum} as a PDF before continuing.`
                      : `You have already downloaded up to Q${
                          lastDownloadedIndex + 1
                        }. Continue reading.`}
                  </p>
                </div>
              </div>

              {hasUnDownloadedBatch && (
                <button
                  type="button"
                  className="btn btn-success btn-sm fw-bold d-flex align-items-center gap-2"
                  onClick={() =>
                    handleDownloadCheckpoint(currentIndex)
                  }
                  style={{ borderRadius: '9px' }}
                >
                  <FaDownload />
                  Download PDF
                </button>
              )}
            </div>
          )}

          {/* =====================================================
              QUESTION CARD
          ===================================================== */}
          {fetchingQuestions ? (
            <div
              className="card border-0 shadow-sm text-center p-5"
              style={{ borderRadius: '18px' }}
            >
              <FaSpinner className="text-primary fs-2 mb-3" />

              <h5 className="fw-bold mb-2">
                Generating Your Question Bank...
              </h5>

              <p className="text-muted small mb-0">
                Preparing 100 questions for {activeRoleTitle}.
              </p>
            </div>
          ) : (
            <div
              className="card border-0 shadow-sm"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              {/* TOP ACCENT */}
              <div
                style={{
                  height: '5px',
                  background:
                    'linear-gradient(90deg, #4F46E5, #7C3AED)',
                }}
              />

              <div className="p-4 p-md-5">

                {/* QUESTION META */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">

                  <span
                    className="badge px-3 py-2"
                    style={{
                      backgroundColor: '#EEF2FF',
                      color: '#4F46E5',
                      borderRadius: '8px',
                    }}
                  >
                    {currentQ.category || 'TECHNICAL'}
                  </span>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">
                      Difficulty
                    </span>

                    <span
                      className={`badge ${
                        currentQ.difficulty === 'Basic'
                          ? 'bg-success'
                          : currentQ.difficulty === 'Advanced'
                          ? 'bg-danger'
                          : 'bg-warning text-dark'
                      }`}
                      style={{ borderRadius: '7px' }}
                    >
                      {currentQ.difficulty || 'Intermediate'}
                    </span>

                    <span
                      className="badge bg-light text-dark border"
                      style={{ borderRadius: '7px' }}
                    >
                      Q{currentIndex + 1} / 100
                    </span>
                  </div>
                </div>

                {/* QUESTION */}
                <div className="mb-4">
                  <div className="small text-primary fw-bold mb-2">
                    QUESTION {currentIndex + 1}
                  </div>

                  <h4
                    className="fw-bold text-dark mb-0"
                    style={{
                      fontSize: '1.4rem',
                      lineHeight: '1.55',
                    }}
                  >
                    {currentQ.question}
                  </h4>
                </div>

                {/* ANSWER */}
                <div
                  className="p-4 mb-4"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '9px',
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                      }}
                    >
                      <FaBookOpen />
                    </div>

                    <h6 className="fw-bold text-dark mb-0">
                      Detailed Answer & Explanation
                    </h6>
                  </div>

                  <p
                    className="text-secondary mb-0"
                    style={{
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {currentQ.answer}
                  </p>
                </div>

                {/* KEY TAKEAWAYS */}
                {currentQ.keyTakeaways &&
                  currentQ.keyTakeaways.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-3">
                        <FaCheckCircle className="text-success me-2" />
                        Key Technical Takeaways
                      </h6>

                      <div className="d-flex flex-column gap-2">
                        {currentQ.keyTakeaways.map(
                          (point, pIdx) => (
                            <div
                              key={pIdx}
                              className="d-flex align-items-start gap-2"
                            >
                              <span
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  backgroundColor: '#ECFDF5',
                                  color: '#059669',
                                  fontSize: '12px',
                                }}
                              >
                                <FaCheckCircle />
                              </span>

                              <span
                                className="text-secondary small"
                                style={{ lineHeight: '1.6' }}
                              >
                                {point}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* INTERVIEW TIP */}
                {currentQ.tip && (
                  <div
                    className="p-3 mb-4 d-flex align-items-start gap-3"
                    style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '12px',
                    }}
                  >
                    <FaLightbulb
                      className="text-warning fs-5 flex-shrink-0"
                    />

                    <div>
                      <div
                        className="small fw-bold mb-1"
                        style={{ color: '#92400E' }}
                      >
                        PRO INTERVIEW TIP
                        {activeCompanyName
                          ? ` • ${activeCompanyName}`
                          : ''}
                      </div>

                      <div
                        className="small text-dark"
                        style={{ lineHeight: '1.6' }}
                      >
                        {currentQ.tip}
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    NAVIGATION
                ================================================= */}
                <div
                  className="pt-4 mt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3"
                >
                  <button
                    type="button"
                    className="btn btn-outline-secondary fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{
                      borderRadius: '10px',
                      minWidth: '130px',
                    }}
                  >
                    <FaArrowLeft />
                    Previous
                  </button>

                  <div className="d-flex align-items-center gap-2">
                    {isStrictCheckpoint &&
                      hasUnDownloadedBatch && (
                        <button
                          type="button"
                          className="btn btn-success fw-bold d-flex align-items-center gap-2"
                          onClick={() =>
                            handleDownloadCheckpoint(
                              currentIndex
                            )
                          }
                          style={{ borderRadius: '10px' }}
                        >
                          <FaDownload />
                          Download PDF
                        </button>
                      )}

                    <span className="small text-muted fw-bold d-none d-md-inline">
                      {currentIndex + 1} / {questions.length}
                    </span>
                  </div>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={handleNext}
                      style={{
                        borderRadius: '10px',
                        minWidth: '160px',
                      }}
                    >
                      Next Question
                      <FaArrowRight />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setIsReadingMode(false)}
                      style={{
                        borderRadius: '10px',
                        minWidth: '160px',
                      }}
                    >
                      <FaCheckCircle />
                      Finish Reading
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </StudentLayout>
  );
};

export default QuestionBankReader;
