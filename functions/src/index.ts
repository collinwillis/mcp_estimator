import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const firestore = admin.firestore();

/**
 * Function to commit a batch of operations to Firestore.
 * @param {FirebaseFirestore.WriteBatch} batch - The Firestore batch to commit.
 */
async function commitBatch(batch: FirebaseFirestore.WriteBatch) {
  try {
    await batch.commit();
  } catch (error) {
    console.error('Error committing batch: ', error);
    throw error;
  }
}

exports.duplicateProposal = functions
  .runWith({
    timeoutSeconds: 540, // Increase timeout to 9 minutes
    memory: '8GB', // Increase memory to 8GB
  })
  .https.onCall(async (data, context) => {
    const proposalId = data.proposalId;

    if (!proposalId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a valid proposalId.',
      );
    }

    let batch = firestore.batch();
    let operationsCount = 0;

    // Get the highest proposal number
    const allProposalsSnapshot = await firestore.collection('proposals').get();
    const highestProposalNumber = Math.max(
      ...allProposalsSnapshot.docs
        .map((doc) => Number(doc.data().proposalNumber || 0))
        .filter(Number.isFinite),
    );
    const newProposalNumber = highestProposalNumber + 1;

    // Duplicate proposal
    const proposalDocRef = firestore.collection('proposals').doc(proposalId);
    const proposalDoc = await proposalDocRef.get();
    const newProposalRef = firestore.collection('proposals').doc();
    const newProposalId = newProposalRef.id;

    if (proposalDoc.exists) {
      const proposalData = proposalDoc.data();
      if (proposalData) {
        const newProposalData = {
          ...proposalData,
          createdAt: new Date(),
          proposalDescription: `${proposalData.proposalDescription} Copy`,
          proposalNumber: newProposalNumber,
        };
        batch.set(newProposalRef, newProposalData);
        operationsCount++;

        if (operationsCount >= 500) {
          await commitBatch(batch);
          batch = firestore.batch();
          operationsCount = 0;
        }
      }
    }

    // Duplicate proposal preferences
    const preferencesDocRef = firestore
      .collection('proposal-preferences')
      .doc(proposalId);
    const preferencesDoc = await preferencesDocRef.get();

    if (preferencesDoc.exists) {
      const preferencesData = preferencesDoc.data();
      if (preferencesData) {
        const newPreferencesRef = firestore
          .collection('proposal-preferences')
          .doc(newProposalId);
        const newPreferencesData = { ...preferencesData, id: newProposalId };
        batch.set(newPreferencesRef, newPreferencesData);
        operationsCount++;

        if (operationsCount >= 500) {
          await commitBatch(batch);
          batch = firestore.batch();
          operationsCount = 0;
        }
      }
    }

    // Map old WBS IDs to new WBS IDs
    const wbsQuerySnapshot = await firestore
      .collection('wbs')
      .where('proposalId', '==', proposalId)
      .get();
    const wbsIdMap: { [key: string]: string } = {};

    for (const wbsDoc of wbsQuerySnapshot.docs) {
      const newWbsRef = firestore.collection('wbs').doc();
      const newWbsId = newWbsRef.id;
      wbsIdMap[wbsDoc.id] = newWbsId;
      const newWbsData = {
        ...wbsDoc.data(),
        proposalId: newProposalId,
        id: newWbsId,
      };
      batch.set(newWbsRef, newWbsData);
      operationsCount++;

      if (operationsCount >= 500) {
        await commitBatch(batch);
        batch = firestore.batch();
        operationsCount = 0;
      }
    }

    // Map old Phase IDs to new Phase IDs and duplicate phases
    const phaseQuerySnapshot = await firestore
      .collection('phase')
      .where('proposalId', '==', proposalId)
      .get();
    const phaseIdMap: { [key: string]: string } = {};

    for (const phaseDoc of phaseQuerySnapshot.docs) {
      const newPhaseRef = firestore.collection('phase').doc();
      const newPhaseId = newPhaseRef.id;
      phaseIdMap[phaseDoc.id] = newPhaseId;

      const newPhaseData = {
        ...phaseDoc.data(),
        proposalId: newProposalId,
        wbsId: wbsIdMap[phaseDoc.data().wbsId],
        id: newPhaseId,
      };
      batch.set(newPhaseRef, newPhaseData);
      operationsCount++;

      if (operationsCount >= 500) {
        await commitBatch(batch);
        batch = firestore.batch();
        operationsCount = 0;
      }

      // Duplicate activities for each phase
      const activityQuerySnapshot = await firestore
        .collection('activities')
        .where('phaseId', '==', phaseDoc.id)
        .get();
      for (const activityDoc of activityQuerySnapshot.docs) {
        const newActivityRef = firestore.collection('activities').doc();
        const newActivityId = newActivityRef.id;
        const newActivityData = {
          ...activityDoc.data(),
          phaseId: newPhaseId,
          proposalId: newProposalId,
          wbsId: wbsIdMap[activityDoc.data().wbsId],
          id: newActivityId,
        };
        batch.set(newActivityRef, newActivityData);
        operationsCount++;

        if (operationsCount >= 500) {
          await commitBatch(batch);
          batch = firestore.batch();
          operationsCount = 0;
        }
      }
    }

    if (operationsCount > 0) {
      await commitBatch(batch);
    }

    return { newProposalId };
  });
