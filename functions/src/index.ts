import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

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
    console.error("Error committing batch: ", error);
    throw error;
  }
}

exports.duplicateProposal = functions
  .runWith({
    timeoutSeconds: 540, // Increase timeout to 9 minutes
    memory: "8GB", // Increase memory to 8GB
  })
  .https.onCall(async (data, context) => {
    const proposalId = data.proposalId;

    if (!proposalId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid proposalId.",
      );
    }

    let batch = firestore.batch();
    let operationsCount = 0;

    // Get the proposal being duplicated
    const proposalDocRef = firestore.collection("proposals").doc(proposalId);
    const proposalDoc = await proposalDocRef.get();

    if (!proposalDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Proposal not found",
      );
    }

    const proposalData = proposalDoc.data()!;
    const baseProposalNumber = parseFloat(proposalData.proposalNumber);

    // Find all proposals with the same base number (e.g., 9, 9.1, 9.2)
    const proposalsSnapshot = await firestore
      .collection("proposals")
      .where("proposalNumber", ">=", baseProposalNumber)
      .where("proposalNumber", "<", baseProposalNumber + 1)
      .get();

    // Extract all decimal parts (0 for base number, 0.1 for 9.1, etc.)
    const decimalParts = proposalsSnapshot.docs
      .map((doc) => {
        const num = parseFloat(doc.data().proposalNumber);
        return num - baseProposalNumber;
      })
      .filter((part) => part >= 0);

    // Find the next available decimal (0.1, 0.2, etc.)
    let nextDecimal = 0.1;
    while (decimalParts.includes(nextDecimal)) {
      nextDecimal = parseFloat((nextDecimal + 0.1).toFixed(1));
    }

    const newProposalNumber = (baseProposalNumber + nextDecimal);
    const newProposalRef = firestore.collection("proposals").doc();
    const newProposalId = newProposalRef.id;

    if (proposalDoc.exists) {
      const proposalData = proposalDoc.data();
      if (proposalData) {
        const newProposalData = {
          ...proposalData,
          createdAt: new Date(),
          proposalDescription: `${proposalData.proposalDescription}`,
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
      .collection("proposal-preferences")
      .doc(proposalId);
    const preferencesDoc = await preferencesDocRef.get();

    if (preferencesDoc.exists) {
      const preferencesData = preferencesDoc.data();
      if (preferencesData) {
        const newPreferencesRef = firestore
          .collection("proposal-preferences")
          .doc(newProposalId);
        const newPreferencesData = {...preferencesData, id: newProposalId};
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
      .collection("wbs")
      .where("proposalId", "==", proposalId)
      .get();
    const wbsIdMap: { [key: string]: string } = {};

    for (const wbsDoc of wbsQuerySnapshot.docs) {
      const newWbsRef = firestore.collection("wbs").doc();
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
      .collection("phase")
      .where("proposalId", "==", proposalId)
      .get();
    const phaseIdMap: { [key: string]: string } = {};

    for (const phaseDoc of phaseQuerySnapshot.docs) {
      const newPhaseRef = firestore.collection("phase").doc();
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
        .collection("activities")
        .where("phaseId", "==", phaseDoc.id)
        .get();
      for (const activityDoc of activityQuerySnapshot.docs) {
        const newActivityRef = firestore.collection("activities").doc();
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

    return {newProposalId};
  });
