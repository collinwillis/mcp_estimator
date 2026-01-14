/* eslint-disable no-console */
const admin = require('firebase-admin');

const APPLY_CONFIRMATION = 'CLEANUP_PROPOSAL_LEGACY_FIELDS';

const getArgValue = (prefix) => {
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
};

const hasFlag = (flag) => process.argv.includes(flag);

const limitArg = getArgValue('--limit=');
const batchSizeArg = getArgValue('--batch-size=');
const parsedBatchSize = batchSizeArg ? Number(batchSizeArg) : NaN;
const parsedLimit = limitArg ? Number(limitArg) : NaN;
const queryBatchSize = Number.isFinite(parsedBatchSize) ? parsedBatchSize : 200;
const limit = Number.isFinite(parsedLimit) ? parsedLimit : Infinity;

const confirmValue = getArgValue('--confirm=');
const shouldApply = hasFlag('--apply') && confirmValue === APPLY_CONFIRMATION;

const run = async () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const firestore = admin.firestore();
  const proposalsRef = firestore.collection('proposals');

  if (!Number.isFinite(limit) && !hasFlag('--scan-all')) {
    console.log('Refusing to scan all proposals without explicit consent.');
    console.log('Pass --scan-all or set --limit to proceed.');
    return;
  }

  console.log('Cleanup legacy proposal fields');
  console.log(`Mode: ${shouldApply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Limit: ${Number.isFinite(limit) ? limit : 'none'}`);
  console.log(`Query batch size: ${queryBatchSize}`);

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let lastDoc = null;

  const baseQuery = proposalsRef.orderBy(
    admin.firestore.FieldPath.documentId(),
  );

  while (processed < limit) {
    let query = baseQuery.limit(queryBatchSize);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    let batch = firestore.batch();
    let batchOps = 0;

    for (const doc of snapshot.docs) {
      if (processed >= limit) {
        break;
      }

      processed += 1;
      lastDoc = doc;

      const data = doc.data() || {};
      if (!data.datasetVersions) {
        skipped += 1;
        continue;
      }

      const hasLegacyFields =
        Object.prototype.hasOwnProperty.call(data, 'constantDataSet') ||
        Object.prototype.hasOwnProperty.call(data, 'dataVersion');

      if (!hasLegacyFields) {
        skipped += 1;
        continue;
      }

      if (shouldApply) {
        batch.update(doc.ref, {
          constantDataSet: admin.firestore.FieldValue.delete(),
          dataVersion: admin.firestore.FieldValue.delete(),
        });
        batchOps += 1;
      }

      updated += 1;
      if (batchOps >= 450) {
        await batch.commit();
        batch = firestore.batch();
        batchOps = 0;
      }
    }

    if (shouldApply && batchOps > 0) {
      await batch.commit();
    }
  }

  console.log('Done.');
  console.log(`Processed: ${processed}`);
  console.log(`Will update: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  if (!shouldApply) {
    console.log('');
    console.log('Dry-run only. To apply changes, run:');
    const scriptPath = process.cwd().endsWith(`${require('path').sep}functions`)
      ? 'node scripts/cleanup_proposal_legacy_fields.js'
      : 'node functions/scripts/cleanup_proposal_legacy_fields.js';
    console.log(`${scriptPath} --apply --confirm=${APPLY_CONFIRMATION}`);
  }
};

run().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
