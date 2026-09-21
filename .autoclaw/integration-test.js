#!/usr/bin/env node

/**
 * Integration test for personas, resources, and reviewfleet modules.
 *
 * Tests the August 2026 enhancements across all three subsystems.
 * Run: node .autoclaw/integration-test.js
 */

import { Personas } from './personas/index.js';
import { Resources } from './resources/index.js';
import { ReviewFleet } from './reviewfleet/index.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

function success(msg) {
  log(colors.green, '✓', msg);
}

function error(msg) {
  log(colors.red, '✗', msg);
}

function info(msg) {
  log(colors.blue, 'ℹ', msg);
}

async function testPersonas() {
  info('=== Testing Personas Module ===');

  try {
    const personas = new Personas({
      rootDir: '.autoclaw/personas',
      cachePath: '.autoclaw/personas/.cache.json',
    });

    info('Initializing personas...');
    const init = await personas.initialize();
    success(`Loaded ${init.personas.length} personas`);

    // Test version manager
    info('Testing version resolution...');
    const versionManager = personas.registry.versions;
    const versions = ['1.0.0', '1.1.0', '2.0.0', '1.0.1'];
    const resolved = versionManager.resolve('test', '^1.0.0', versions);
    success(`Version ^1.0.0 resolved to ${resolved}`);

    // Test composition (if base persona exists)
    if (personas.registry.has('architect')) {
      info('Testing composition...');
      const composed = await personas.compose({
        base: 'architect',
        traits: [],
        overrides: { name: 'test-composed' },
      });
      success(`Composed persona: ${composed.name}`);
    }

    // Test status
    const status = await personas.status();
    success(`Personas status: ${status.personas.length} registered`);

    return true;
  } catch (err) {
    error(`Personas test failed: ${err.message}`);
    return false;
  }
}

async function testResources() {
  info('=== Testing Resources Module ===');

  try {
    const resources = new Resources({
      rootDir: '.autoclaw/resources',
      manifestPath: '.autoclaw/resources/manifest.json',
      lruSize: 50,
    });

    info('Initializing resources...');
    const init = await resources.initialize();
    success(`Loaded ${init.resources.length} resources`);

    // Test LRU cache
    info('Testing LRU cache...');
    const testResource = { name: 'test', version: '1.0.0', content: 'test' };
    resources.lru.set('test@1.0.0', testResource);
    const cached = resources.lru.get('test@1.0.0');
    success(`LRU cache working: retrieved ${cached.name}`);

    // Test disk cache
    info('Testing disk cache...');
    await resources.disk.set('test@1.0.0', testResource);
    const diskCached = await resources.disk.get('test@1.0.0');
    success(`Disk cache working: retrieved ${diskCached.name}`);

    // Test status
    const status = await resources.status();
    success(`Resources status: ${status.resources.length} registered`);

    return true;
  } catch (err) {
    error(`Resources test failed: ${err.message}`);
    return false;
  }
}

async function testReviewFleet() {
  info('=== Testing ReviewFleet Module ===');

  try {
    const fleet = new ReviewFleet({
      quorum: 2,
      majorityThreshold: 0.6,
      minReasoningLength: 50,
    });

    info('Registering reviewers...');

    // Register test reviewers
    fleet.pool.registerReviewer({
      id: 'alice',
      name: 'Alice Chen',
      expertise: ['backend', 'security'],
    });
    fleet.pool.registerReviewer({
      id: 'bob',
      name: 'Bob Smith',
      expertise: ['frontend', 'performance'],
    });
    fleet.pool.registerReviewer({
      id: 'charlie',
      name: 'Charlie Davis',
      expertise: ['testing', 'backend'],
    });

    success('Registered 3 reviewers');

    // Test expertise matching
    info('Testing expertise matching...');
    const matches = await fleet.matcher.match({
      artifact: { type: 'backend', content: 'auth handler code' },
      goal: 'improve security',
    });
    success(`Found ${matches.length} matching reviewers`);

    // Test submission
    info('Submitting review...');
    const { sessionId, reviewers: selected } = await fleet.submit({
      artifact: { type: 'code', content: 'function auth() { validate(token); }' },
      goal: 'add security validation',
      priority: 'high',
      reviewers: 2,
    });

    success(`Created session ${sessionId} with ${selected.length} reviewers`);

    // Test review submission
    info('Recording verdicts...');

    await fleet.review({
      sessionId,
      reviewerId: 'alice',
      verdict: 'approve',
      reasoning: 'Good JWT validation. However, I recommend adding rate limiting on the endpoint and consider token rotation policies.',
    });

    success('Recorded verdict from Alice');

    const result = await fleet.review({
      sessionId,
      reviewerId: 'bob',
      verdict: 'approve',
      reasoning: 'Code is clean. Proper error handling and token validation are implemented correctly.',
    });

    success('Recorded verdict from Bob');

    // Check if quorum reached
    if (result.quorumReached) {
      info('Quorum reached, checking consensus...');
      const session = await fleet.multi.getSession({ sessionId });
      const consensus = await fleet.consensus.aggregate({
        sessionId,
        verdicts: session.verdicts,
      });

      success(
        `Consensus: ${consensus.verdict} (confidence: ${(consensus.confidence * 100).toFixed(0)}%)`
      );
      success(`Theater reviews: ${consensus.theaterReviews}, Valid reviews: ${consensus.validReviews}`);
    }

    // Test auto-review (LLM judge)
    info('Testing LLM judge...');
    const { sessionId: session2Id } = await fleet.submit({
      artifact: { type: 'test', content: 'console.log("test")' },
      goal: 'review logging',
      reviewers: 1,
    });

    // Create a stub LLM for testing
    const judgeResult = await fleet.judge({ sessionId: session2Id });
    success('LLM judge verdict recorded');

    // Test SLA tracking
    info('Testing SLA tracking...');
    const { sessionId: session3Id } = await fleet.submit({
      artifact: { type: 'urgent', content: 'critical fix' },
      goal: 'urgent review',
      priority: 'critical',
      reviewers: 1,
    });

    const slaStatus = await fleet.sla.status();
    success(`SLA active: ${slaStatus.active} sessions`);

    // Test reputation scoring
    info('Testing reputation scoring...');
    const aliceRep = fleet.pool.reputationScore('alice');
    success(`Alice reputation score: ${(aliceRep * 100).toFixed(0)}%`);

    // Test overall status
    const status = await fleet.status();
    success(`ReviewFleet status: ${status.activeSessions} active sessions`);

    return true;
  } catch (err) {
    error(`ReviewFleet test failed: ${err.message}`);
    console.error(err);
    return false;
  }
}

async function main() {
  log(colors.blue, '\n╔════════════════════════════════════════╗');
  log(colors.blue, '║  Autoclaw August 2026 Integration Test║');
  log(colors.blue, '╚════════════════════════════════════════╝\n');

  const tests = [testPersonas, testResources, testReviewFleet];

  const results = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log();
  }

  // Summary
  log(colors.blue, '╔════════════════════════════════════════╗');
  log(colors.blue, '║  Test Summary');
  log(colors.blue, '╚════════════════════════════════════════╝');

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;

  success(`${passed}/${results.length} module tests passed`);

  if (failed > 0) {
    error(`${failed} test(s) failed`);
    process.exit(1);
  }

  info('All tests passed! ✓');
  process.exit(0);
}

main().catch((err) => {
  error('Fatal error:', err.message);
  console.error(err);
  process.exit(1);
});
