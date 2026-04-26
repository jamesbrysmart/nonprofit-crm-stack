import { defineRole } from 'twenty-sdk';
import {
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-batch.object';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';
import { GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-submission.object';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import {
  STAGING_REVIEW_ITEM_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/objects/staging-review-item.object';

export const REVIEW_OPERATOR_ROLE_UNIVERSAL_IDENTIFIER =
  'b1aef8f8-b4d4-4f79-8f8f-ff14dbfd263a';

export default defineRole({
  universalIdentifier: REVIEW_OPERATOR_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Review operator',
  description:
    'Can review staging records and inspect batches, but is not intended to drive processing-state changes.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier:
        STAGING_REVIEW_ITEM_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      canReadFieldValue: true,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier:
        STAGING_REVIEW_ITEM_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
      canReadFieldValue: true,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      canReadFieldValue: true,
      canUpdateFieldValue: false,
    },
  ],
});
